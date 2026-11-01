/* Scan counts. Deterministic hashes, not measurements -- the real numbers
   come from the scan_event table once the backend lands. */
import { fromKey } from '../core/format.js';
import { h32 } from '../core/hash.js';
import { hoursFor } from '../data/opening.js';
import { store } from './store.js';

/* ---------------- scan statistics (staff) -------------------------- */
export const scanBase = (id) => 16 + (h32('scan-' + id) % 150);
export const scanTotal = (o) => scanBase(o.id) + (store.S.scans[o.id] || 0);
export const demoScans = () => Object.values(store.S.scans || {}).reduce((a, b) => a + b, 0);
export function scansOnDay(k) {
  const d = fromKey(k); if (!hoursFor(k)) return 0;
  const x = h32('day-' + k);
  return 24 + (x % 46) + (d.getDay() === 0 || d.getDay() === 6 ? 26 : 0);
}
