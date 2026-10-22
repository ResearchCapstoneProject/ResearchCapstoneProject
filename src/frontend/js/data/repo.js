/* The data layer: one surface, two implementations.

   Every function is async and returns the same shape whether it is talking to
   FastAPI or to localStorage, so no view needs to know which mode it is in.

   Detection is deliberate:
     - exactly ONE health probe per page load, then every call branches on
       store.api.mode. No per-call timeouts, no probe storm.
     - a later failure latches to offline ONE WAY. It never flips back on its
       own, because flapping in the middle of the booking wizard would corrupt
       the wizard's state. The prototype bar has a Reconnect button instead.
     - 401/403 never degrade: the API is up and we are not authorised. That
       conflation is the classic bug in this pattern.
     - other 4xx never degrade either -- a 409 on a full slot is a business
       answer, shown as a form error. */
import { getPublicBaseUrl, setPublicBaseUrl } from '../core/config.js';
import { store } from '../state/store.js';
import { applyServerConfig } from './constants.js';
import { ApiError, Unreachable, probeHealth, request } from './api.js';
import {
  clearLocal, freshState, loadSeed, readLocal, writeLocal,
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
      const cfg = await request('/config');
      applyServerConfig(cfg);
      setPublicBaseUrl(cfg.publicBaseUrl);
      store.api.user = await currentUser();
      store.S = await loadFromApi();
      return store.api.mode;
    } catch (e) {
      if (!(e instanceof Unreachable)) throw e;
      degrade('config failed');
    }
  }

  const seed = await loadSeed();
  store.S = readLocal() || freshState(seed);
  return store.api.mode;
}

async function loadFromApi() {
  const [objects, bookings] = await Promise.all([
    request('/objects').then((r) => r.items),
    // Bookings are staff-only; a visitor simply has none to show.
    store.api.user ? request('/staff/bookings') : Promise.resolve([]),
  ]);
  return { objects, bookings, scans: {} };
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
    const b = await call(() =>
      request('/bookings', { method: 'POST', body: payload }));
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
    const b = await call(() =>
      request(`/staff/bookings/${encodeURIComponent(code)}/check-in`,
        { method: 'POST' }));
    const i = store.S.bookings.findIndex((x) => x.code === code);
    if (i >= 0) store.S.bookings[i] = b;
    return b;
  }
  const b = store.S.bookings.find((x) => x.code === code);
  if (b) { b.checkedIn = true; writeLocal(); }
  return b;
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
