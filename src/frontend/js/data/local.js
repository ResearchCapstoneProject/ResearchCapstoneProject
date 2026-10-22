/* localStorage persistence -- the offline half of the data layer.

   The whole prototype state lives under one key. Writes can fail (private
   windows, a full quota once images pile up), so every accessor is guarded
   and the app degrades to in-memory rather than throwing. */
import { LS_KEY, SEED_URL } from '../core/config.js';
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
    images: [],
  }));
}

export const freshState = (seed) => ({
  objects: decorateSeedObjects(seed.objects),
  bookings: [],
  scans: {},
});

export function readLocal() {
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
