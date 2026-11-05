/* localStorage persistence -- the offline half of the data layer.

   The whole prototype state lives under one key. Writes can fail (private
   windows, a full quota once images pile up), so every accessor is guarded
   and the app degrades to in-memory rather than throwing. */
import { LS_KEY, LS_KEY_OLD, SEED_URL } from '../core/config.js';
import { store } from '../state/store.js';

let seedCache = null;

export async function loadSeed() {
  if (seedCache) return seedCache;
  const names = ['objects', 'exhibitions', 'events', 'tours'];
  const [objects, exhibitions, events, tours] = await Promise.all(
    names.map((n) => fetch(`${SEED_URL}/${n}.json`).then((r) => r.json())),
  );
  seedCache = { objects, exhibitions, events, tours };
  return seedCache;
}

/* The derived fields the prototype applied when it loaded its seed array.
   The backend seeder applies the same rule; keep the two in step. */
export function decorateSeedObjects(rows) {
  return rows.map((o, i) => ({
    ...o,
    status: 'published',
    onDisplay: !o.location.startsWith('Store'),
    added: Date.UTC(2026, 7, 1 + i),
    seed: true,
    images: o.images || [],
  }));
}

/* A browser that saved its demo state before the seed changed would keep a
   stale collection. Drop seed records the seed no longer has (the sample
   objects removed in favour of the ACB catalogue) and add the ones it has not
   seen yet; `seedIds` remembers which ones it has, so a seed object deleted
   in the staff area does not come back on the next load. */
export function addNewSeedObjects(state, seed) {
  const current = new Set(seed.objects.map((o) => o.id));
  state.objects = state.objects.filter((o) => !o.seed || current.has(o.id));
  const known = new Set(state.seedIds || state.objects.filter((o) => o.seed).map((o) => o.id));
  const fresh = decorateSeedObjects(seed.objects).filter((o) => !known.has(o.id) && !state.objects.some((x) => x.id === o.id));
  state.objects.push(...fresh);
  state.seedIds = seed.objects.map((o) => o.id);
  return state;
}

export const freshState = (seed) => ({
  objects: decorateSeedObjects(seed.objects),
  seedIds: seed.objects.map((o) => o.id),
  bookings: [],
  scans: {},
  /* null means "no server list here": the events page then shows the bundled
     programme, and the publications page the bundled catalogue. An empty
     array is different -- it means the museum has withdrawn everything. */
  events: null,
  publications: null,
});

/* Saved data from before the storage key was renamed moves to the new key
   once, so nobody loses their bookings or added objects. */
function migrateKey() {
  try {
    const old = localStorage.getItem(LS_KEY_OLD);
    if (old !== null && localStorage.getItem(LS_KEY) === null) localStorage.setItem(LS_KEY, old);
    if (old !== null) localStorage.removeItem(LS_KEY_OLD);
  } catch { /* storage unavailable: nothing to move */ }
}

export function readLocal() {
  migrateKey();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.objects) || !Array.isArray(s.bookings)) return null;
    s.scans = s.scans || {};
    // Older saves kept a single `image`; normalise to the images[] array.
    s.objects.forEach((o) => { if (!o.images) o.images = o.image ? [o.image] : []; });
    return s;
  } catch {
    return null;
  }
}

export function writeLocal(state = store.S) {
  /* Boot has not filled the state yet. Writing now would replace a good save
     with "null" and lose the visitor's offline bookings. */
  if (!state) return false;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;   // quota or private window; the app keeps working in memory
  }
}

export function clearLocal() {
  try { localStorage.removeItem(LS_KEY); } catch { /* nothing to do */ }
}

/* Kept for the modules that still call save() directly. */
export const save = writeLocal;
