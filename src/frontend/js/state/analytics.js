/* Scan statistics.

   The prototype derived these numbers from a hash of the object id, so the
   chart looked plausible during a presentation. They are measured now:
   GET /staff/stats/scans aggregates the scan_event table, separating a real
   visitor at a gallery label (source='qr') from the staff area's "Simulate
   visitor scan" button (source='staff_demo').

   Offline there is no server to count anything. The only scans that exist
   are the ones made in this browser, and localStats() shapes those like the
   server's answer so the page has one thing to render. */
import { dkey } from '../core/format.js';
import { store } from './store.js';
import { published, roomById, roomOf } from './selectors.js';
import * as repo from '../data/repo.js';

const DAYS = 14;

/* Filled by loadScanStats(); null until the first answer arrives, which is
   what the page renders its "Loading…" state from. */
const state = { stats: null, loading: false };

export const scanStats = () => state.stats;

function lastDays(n) {
  const out = []; const d = new Date(); d.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d); x.setDate(x.getDate() - i); out.push(dkey(x));
  }
  return out;
}

function localStats() {
  const scans = store.S.scans || {};
  const today = dkey(new Date());
  const total = Object.values(scans).reduce((a, b) => a + b, 0);
  const objects = published();
  const counted = objects
    .map((o) => ({ key: o.id, label: o.title, total: scans[o.id] || 0,
                   demo: scans[o.id] || 0 }))
    .sort((a, b) => b.total - a.total);

  const rooms = {};
  objects.forEach((o) => {
    const id = roomOf(o.location);
    const label = id ? (roomById(id) || {}).name : 'Not on display';
    const row = rooms[label] || (rooms[label] = { key: label, label, total: 0, demo: 0 });
    row.total += scans[o.id] || 0;
    row.demo += scans[o.id] || 0;
  });

  return {
    days: lastDays(DAYS).map((k) => ({
      date: k, total: k === today ? total : 0, demo: k === today ? total : 0,
    })),
    byRoom: Object.values(rooms).sort((a, b) => b.total - a.total),
    objects: counted,
    total,
    labelledObjects: objects.length,
    averagePerDay: Math.round((total / DAYS) * 10) / 10,
    mostScanned: counted.length && counted[0].total ? counted[0].label : null,
    offline: true,
  };
}

/* Fetches the statistics once the page is on screen, then re-renders it in
   place -- the same shape as the settings and appearance pages. */
export async function loadScanStats(rerender) {
  if (state.loading) return;
  state.loading = true;
  try {
    const out = await repo.scanStats(DAYS);
    state.stats = out ? { ...out, offline: false } : localStats();
  } catch (e) {
    state.stats = localStats();
  } finally {
    state.loading = false;
  }
  if (rerender) rerender();
}
