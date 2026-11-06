/* The data layer: one surface, two implementations.

   Every function is async and returns the same shape whether it is talking to
   FastAPI or to localStorage, so no view needs to know which mode it is in.

   Detection is deliberate:
     - exactly ONE health probe per page load, then every call branches on
       store.api.mode. No per-call timeouts, no probe storm.
     - a later failure latches to offline ONE WAY. It never flips back on its
       own, because flapping in the middle of the booking wizard would corrupt
       the wizard's state. Reloading the page probes the API again.
     - 401/403 never degrade: the API is up and we are not authorised. That
       conflation is the classic bug in this pattern.
     - other 4xx never degrade either -- a 409 on a full slot is a business
       answer, shown as a form error. */
import { getPublicBaseUrl, setPublicBaseUrl } from '../core/config.js';
import { store } from '../state/store.js';
import {
  applyServerConfig, CAPACITY, EVENTS, SLOT_MINUTES, TICKETS,
} from './constants.js';
import { overrides } from '../core/assets.js';
import { applyTextOverrides, setTextOverrides } from '../core/text.js';

/* Everything GET /config carries, applied in one place: the reference data
   and the look (applyServerConfig), the museum's own texts, and the picture
   swaps (which applyServerConfig passes on to core/assets.js). Used at boot
   and again after a change in the staff area. */
function applyConfig(cfg) {
  applyServerConfig(cfg);
  setTextOverrides(cfg && cfg.texts);
  applyTextOverrides();
  return cfg;
}
import { applyTheme, contrastOnWhite, THEME } from '../core/theme.js';
import { ApiError, Unreachable, probeHealth, request } from './api.js';
import {
  addNewSeedObjects, clearLocal, freshState, loadSeed, readLocal, writeLocal,
} from './local.js';

export const mode = () => store.api.mode;
export const isOnline = () => store.api.mode === 'online';

let onDegrade = null;
export function onDegraded(fn) { onDegrade = fn; }

function degrade(reason) {
  if (store.api.mode === 'offline') return;      // idempotent; stay quiet
  store.api.mode = 'offline';
  store.api.degraded = true;
  store.api.user = null;
  writeLocal();
  if (onDegrade) onDegrade(reason);
}

/* The same state change for use during bootstrap(), without the callback.
   onDegraded() re-renders, and while the app is booting there is no shell to
   render into yet: the callback would throw, the exception would escape the
   catch block below, and the offline fallback that fills store.S would never
   run -- leaving every view to throw on a null store.S. */
function degradeQuietly() {
  store.api.mode = 'offline';
  store.api.degraded = true;
  store.api.user = null;
}

/* Run an API call, degrading only on genuine unreachability. */
async function call(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof Unreachable) { degrade(e.message); throw e; }
    throw e;                                      // ApiError: let callers handle
  }
}

// ---------------------------------------------------------------- bootstrap

export async function bootstrap() {
  const ok = await probeHealth();
  store.api = {
    mode: ok ? 'online' : 'offline',
    checkedAt: Date.now(),
    user: null,
    degraded: false,
  };

  if (ok) {
    try {
      const cfg = applyConfig(await request('/config'));
      setPublicBaseUrl(cfg.publicBaseUrl);
      store.api.user = await currentUser();
      store.S = await loadFromApi();
      return store.api.mode;
    } catch (e) {
      /* The probe said the API was up, then a call failed. api.js maps every
         5xx to Unreachable, so this is also the path a server takes when the
         code is new and the database has not had the migration yet: the API
         answers 500 and the site has to come up anyway. Never rethrow here --
         fall through to the seed plus localStorage below, so store.S is
         always a state object. */
      console.error('[bootstrap]', e);
      degradeQuietly();
    }
  }

  const seed = await loadSeed();
  const saved = readLocal();
  store.S = saved ? addNewSeedObjects(saved, seed) : freshState(seed);
  return store.api.mode;
}

/* The API and the offline store disagreed on two field names: the server
   says `minute` and `totalThebe`, the browser's own bookings say `min` and
   `total`. Everything that renders a booking reads the second pair, so every
   booking coming off the API passes through here -- which also quietly fixes
   the staff list, where a server booking's start minute used to read as 0. */
const fromApi = (b) => ({
  ...b,
  min: b.minute || 0,
  total: b.totalThebe || 0,
  checkedIn: !!b.checkedIn,
});

async function loadFromApi() {
  const [objects, bookings, events, publications] = await Promise.all([
    request('/objects').then((r) => r.items),
    // Bookings are staff-only; a visitor simply has none to show.
    store.api.user ? request('/staff/bookings').then((r) => r.map(fromApi))
      : Promise.resolve([]),
    request('/events'),
    request('/publications'),
  ]);
  return { objects, bookings, scans: {}, events, publications };
}

/* Re-reads the public programme after a change in the staff area, so the
   events page and the publications pages show what was just saved. */
async function refreshContent() {
  const [events, publications] = await Promise.all([
    call(() => request('/events')), call(() => request('/publications')),
  ]);
  store.S.events = events;
  store.S.publications = publications;
}

export async function refresh() {
  return bootstrap();
}

// ------------------------------------------------------------------ objects

export const listObjects = async () => store.S.objects;
export const listPublished = async () =>
  store.S.objects.filter((o) => o.status === 'published');

export async function getObject(id) {
  if (isOnline()) return call(() => request(`/objects/${encodeURIComponent(id)}`));
  return store.S.objects.find((o) => o.id === id) || null;
}

export async function nextInventoryNo(dept) {
  if (isOnline()) {
    const r = await call(() =>
      request(`/staff/objects/next-inventory-no?dept=${encodeURIComponent(dept)}`));
    return r.preview;
  }
  return localNextInv(dept);
}

function localNextInv(dept) {
  const code = { Archaeology: 'ARC', Ethnography: 'ETH', 'Natural History': 'NAT',
    History: 'HIS', Art: 'ART' }[dept] || 'OBJ';
  const nums = store.S.objects
    .filter((o) => o.id.startsWith(`BNM-${code}-`))
    .map((o) => parseInt(o.id.split('-')[2], 10) || 0);
  return `BNM-${code}-${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
}

export async function createObject(draft) {
  if (isOnline()) {
    const created = await call(() =>
      request('/staff/objects', { method: 'POST', body: draft }));
    store.S.objects.unshift(created);
    return created;
  }
  const o = {
    ...draft,
    id: localNextInv(draft.dept),
    onDisplay: !String(draft.location || '').startsWith('Store'),
    added: Date.now(),
    seed: false,
    images: draft.images || [],
  };
  store.S.objects.push(o);
  writeLocal();
  return o;
}

export async function updateObject(id, patch) {
  if (isOnline()) {
    const saved = await call(() =>
      request(`/staff/objects/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: patch }));
    const i = store.S.objects.findIndex((o) => o.id === id);
    if (i >= 0) store.S.objects[i] = saved;
    return saved;
  }
  const o = store.S.objects.find((x) => x.id === id);
  if (o) {
    Object.assign(o, patch);
    o.onDisplay = !String(o.location || '').startsWith('Store');
    writeLocal();
  }
  return o;
}

export async function deleteObject(id) {
  if (isOnline()) {
    await call(() =>
      request(`/staff/objects/${encodeURIComponent(id)}`, { method: 'DELETE' }));
  }
  const i = store.S.objects.findIndex((o) => o.id === id);
  if (i >= 0) store.S.objects.splice(i, 1);
  if (!isOnline()) writeLocal();
}

/* The one place the two modes genuinely differ: online this is a real upload
   and the server returns a URL; offline it stays a data URL in localStorage.
   Both normalise to { id, url, position } so pic() and viewsOf() are
   unchanged either way. */
export async function uploadImage(objectId, file) {
  if (isOnline()) {
    const form = new FormData();
    form.append('file', file);
    return call(() => request(
      `/staff/objects/${encodeURIComponent(objectId)}/images`,
      { method: 'POST', form },
    ));
  }
  const url = await fileToDataUrl(file);
  return { id: Date.now(), url, position: 0 };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// ----------------------------------------------------------------- bookings

export async function availability(startKey, days) {
  if (isOnline()) {
    const qs = new URLSearchParams();
    if (startKey) qs.set('start', startKey);
    if (days) qs.set('days', String(days));
    return call(() => request(`/availability?${qs}`));
  }
  return null;    // offline callers fall back to the local sampleOcc path
}

export async function createBooking(payload) {
  if (isOnline()) {
    const b = fromApi(await call(() =>
      request('/bookings', { method: 'POST', body: payload })));
    store.S.bookings.push(b);
    return b;
  }
  const code = 'BNM-' + Array.from({ length: 5 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  const b = { ...payload, code, created: Date.now(), checkedIn: false };
  store.S.bookings.push(b);
  writeLocal();
  return b;
}

export async function checkIn(code) {
  if (isOnline()) {
    const b = fromApi(await call(() =>
      request(`/staff/bookings/${encodeURIComponent(code)}/check-in`,
        { method: 'POST' })));
    const i = store.S.bookings.findIndex((x) => x.code === code);
    if (i >= 0) store.S.bookings[i] = b;
    return b;
  }
  const b = store.S.bookings.find((x) => x.code === code);
  if (b) { b.checkedIn = true; writeLocal(); }
  return b;
}

// ------------------------------------------------- settings & visitor groups

/* Re-reads GET /config after a settings change, so the price list, the
   capacity and the slot length the visitor-facing pages hold are the ones
   the museum just saved -- without a reload. */
async function refreshConfig() {
  return applyConfig(await call(() => request('/config')));
}

function offlineOnly() {
  throw new ApiError(503, {
    code: 'offline',
    message: 'Settings are stored on the server. Sign in to the live site to change them.',
  });
}

export async function listTicketTypes() {
  if (isOnline()) return call(() => request('/staff/ticket-types'));
  // Offline the staff page is read-only; show what the demo is using.
  return TICKETS.map((t) => ({
    key: t.key, name: t.name, desc: t.desc, priceThebe: t.price,
    addon: !!t.addon, active: true, sortOrder: 0, inUse: false,
  }));
}

export async function createTicketType(draft) {
  if (!isOnline()) return offlineOnly();
  const created = await call(() =>
    request('/staff/ticket-types', { method: 'POST', body: draft }));
  await refreshConfig();
  return created;
}

export async function updateTicketType(key, patch) {
  if (!isOnline()) return offlineOnly();
  const saved = await call(() =>
    request(`/staff/ticket-types/${encodeURIComponent(key)}`,
      { method: 'PATCH', body: patch }));
  await refreshConfig();
  return saved;
}

export async function deleteTicketType(key) {
  if (!isOnline()) return offlineOnly();
  const out = await call(() =>
    request(`/staff/ticket-types/${encodeURIComponent(key)}`, { method: 'DELETE' }));
  await refreshConfig();
  return out;
}

export async function getVisitSettings() {
  if (isOnline()) return call(() => request('/staff/settings'));
  return {
    capacityPerSlot: CAPACITY, slotMinutes: SLOT_MINUTES,
    bookingWindowDays: 14, tourTimes: [], currency: 'BWP',
    slotLengths: [15, 20, 30, 45, 60, 90, 120],
  };
}

export async function updateVisitSettings(patch) {
  if (!isOnline()) return offlineOnly();
  const saved = await call(() =>
    request('/staff/settings', { method: 'PATCH', body: patch }));
  await refreshConfig();
  return saved;
}

// ------------------------------------------------------- events (staff side)

/* The programme lives in the database and is public through GET /events; the
   staff list also carries the withdrawn ones. Offline the bundled programme
   is shown read-only, like the visitor groups. */

export async function listEvents() {
  if (isOnline()) return call(() => request('/staff/events'));
  return [...EVENTS]
    .sort((a, b) => b.d.localeCompare(a.d))
    .map((e, i) => ({ id: -(i + 1), ...e, published: true }));
}

export async function createEvent(draft) {
  if (!isOnline()) return offlineOnly();
  const created = await call(() => request('/staff/events', { method: 'POST', body: draft }));
  await refreshContent();
  return created;
}

export async function updateEvent(id, patch) {
  if (!isOnline()) return offlineOnly();
  const saved = await call(() =>
    request(`/staff/events/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }));
  await refreshContent();
  return saved;
}

export async function deleteEvent(id) {
  if (!isOnline()) return offlineOnly();
  await call(() => request(`/staff/events/${encodeURIComponent(id)}`, { method: 'DELETE' }));
  await refreshContent();
}

export async function uploadEventFlyer(id, file) {
  if (!isOnline()) return offlineOnly();
  const form = new FormData();
  form.append('file', file);
  const saved = await call(() =>
    request(`/staff/events/${encodeURIComponent(id)}/flyer`, { method: 'POST', form }));
  await refreshContent();
  return saved;
}

export async function removeEventFlyer(id) {
  if (!isOnline()) return offlineOnly();
  const saved = await call(() =>
    request(`/staff/events/${encodeURIComponent(id)}/flyer`, { method: 'DELETE' }));
  await refreshContent();
  return saved;
}

// ------------------------------------------------- publications (staff side)

export async function listPublicationsAdmin() {
  if (isOnline()) return call(() => request('/staff/publications'));
  return [];      // offline there is nothing but the bundled catalogue
}

export async function createPublication(draft) {
  if (!isOnline()) return offlineOnly();
  const created = await call(() =>
    request('/staff/publications', { method: 'POST', body: draft }));
  await refreshContent();
  return created;
}

export async function updatePublication(id, patch) {
  if (!isOnline()) return offlineOnly();
  const saved = await call(() =>
    request(`/staff/publications/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }));
  await refreshContent();
  return saved;
}

export async function deletePublication(id) {
  if (!isOnline()) return offlineOnly();
  await call(() =>
    request(`/staff/publications/${encodeURIComponent(id)}`, { method: 'DELETE' }));
  await refreshContent();
}

/* `what` is 'cover' or 'pdf'. */
export async function uploadPublicationFile(id, what, file) {
  if (!isOnline()) return offlineOnly();
  const form = new FormData();
  form.append('file', file);
  const saved = await call(() =>
    request(`/staff/publications/${encodeURIComponent(id)}/${what}`, { method: 'POST', form }));
  await refreshContent();
  return saved;
}

// -------------------------------------------------------- the museum's texts

export async function saveText(key, value) {
  if (!isOnline()) return offlineOnly();
  const saved = await call(() =>
    request('/staff/texts', { method: 'PUT', body: { key, value } }));
  await refreshConfig();      // re-applies the texts for every open page
  return saved;
}

export async function clearText(key) {
  if (!isOnline()) return offlineOnly();
  await call(() =>
    request(`/staff/texts?key=${encodeURIComponent(key)}`, { method: 'DELETE' }));
  await refreshConfig();
}

// ------------------------------------------------------------ replaced images

export async function listImageOverrides() {
  if (isOnline()) return call(() => request('/staff/image-overrides'));
  return Object.entries(overrides()).map(([path, url]) => ({ path, url, updated: 0 }));
}

export async function setImageOverride(path, file) {
  if (!isOnline()) return offlineOnly();
  const form = new FormData();
  form.append('path', path);
  form.append('file', file);
  const saved = await call(() =>
    request('/staff/image-overrides', { method: 'POST', form }));
  await refreshConfig();          // re-applies the map for every open page
  return saved;
}

export async function clearImageOverride(path) {
  if (!isOnline()) return offlineOnly();
  await call(() =>
    request(`/staff/image-overrides?path=${encodeURIComponent(path)}`, { method: 'DELETE' }));
  await refreshConfig();
}

// ------------------------------------------------------------ appearance kit

/* Colours, fonts, logo, hero picture and the wording in the masthead. The
   kit writes settings on the server, so offline it is read-only like the
   visitor groups -- with the difference that the current look is already in
   THEME, having come down with GET /config. */

export async function getTheme() {
  if (isOnline()) return call(() => request('/staff/theme'));
  return {
    theme: { ...THEME },
    defaults: { ...THEME },
    fonts: [{ key: THEME.headingFont, name: 'Current font', stack: THEME.headingStack, note: '' }],
    contrast: {
      brand: contrastOnWhite(THEME.brand),
      action: contrastOnWhite(THEME.action),
      accent: contrastOnWhite(THEME.accent),
    },
  };
}

export async function updateTheme(patch) {
  if (!isOnline()) return offlineOnly();
  const saved = await call(() =>
    request('/staff/theme', { method: 'PATCH', body: patch }));
  applyTheme(saved.theme);
  return saved;
}

/* `slot` is 'logo' or 'hero'. The file goes up as multipart, like an object
   photograph, so the server decides the format from what Pillow decodes. */
export async function uploadThemeImage(slot, file) {
  if (!isOnline()) return offlineOnly();
  const form = new FormData();
  form.append('file', file);
  const saved = await call(() =>
    request(`/staff/theme/image/${encodeURIComponent(slot)}`,
      { method: 'POST', form }));
  applyTheme(saved.theme);
  return saved;
}

export async function resetThemeImage(slot) {
  if (!isOnline()) return offlineOnly();
  const saved = await call(() =>
    request(`/staff/theme/image/${encodeURIComponent(slot)}`, { method: 'DELETE' }));
  applyTheme(saved.theme);
  return saved;
}

export async function uploadThemeFont(file, family) {
  if (!isOnline()) return offlineOnly();
  const form = new FormData();
  form.append('file', file);
  form.append('family', family || '');
  const saved = await call(() =>
    request('/staff/theme/font', { method: 'POST', form }));
  applyTheme(saved.theme);
  return saved;
}

export async function resetThemeFont() {
  if (!isOnline()) return offlineOnly();
  const saved = await call(() => request('/staff/theme/font', { method: 'DELETE' }));
  applyTheme(saved.theme);
  return saved;
}

export async function resetTheme() {
  if (!isOnline()) return offlineOnly();
  const saved = await call(() => request('/staff/theme', { method: 'DELETE' }));
  applyTheme(saved.theme);
  return saved;
}

// -------------------------------------------------------------------- scans

export async function recordScan(objectId, source = 'qr') {
  if (isOnline()) {
    // Fire and forget: a failed scan log must never break the object page.
    request('/scans', { method: 'POST', body: { objectId, source } })
      .catch(() => {});
  }
  store.S.scans[objectId] = (store.S.scans[objectId] || 0) + 1;
  if (!isOnline()) writeLocal();
}

export async function scanStats(days = 14) {
  if (isOnline()) return call(() => request(`/staff/stats/scans?days=${days}`));
  return null;    // offline callers use the local hash-based estimate
}

// --------------------------------------------------------------------- auth

export async function login(username, password) {
  const user = await request('/auth/login',
    { method: 'POST', body: { username, password } });
  store.api.user = user;
  return user;
}

export async function logout() {
  try { await request('/auth/logout', { method: 'POST' }); } catch { /* already gone */ }
  store.api.user = null;
}

export async function currentUser() {
  try {
    return await request('/auth/me');
  } catch (e) {
    if (e instanceof ApiError && e.isAuth) return null;   // simply not signed in
    if (e instanceof Unreachable) throw e;
    return null;
  }
}

// --------------------------------------------------------------- demo reset

export async function resetDemo() {
  if (isOnline()) {
    await call(() => request('/staff/demo/reset', { method: 'POST' }));
    return bootstrap();
  }
  clearLocal();
  store.S = freshState(await loadSeed());
  writeLocal();
  return 'offline';
}

export { getPublicBaseUrl };
