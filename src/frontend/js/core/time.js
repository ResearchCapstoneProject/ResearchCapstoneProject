import { dkey } from './format.js';

/* Calendar and clock helpers. Nothing here knows anything about the museum --
   opening hours live in data/opening.js, which is what will read from
   GET /api/config once the backend lands. */
export const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
export const DAYNAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function gabNow() {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Gaborone', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { dow: WD[p.weekday], h: Number(p.hour) % 24, m: Number(p.minute) };
  } catch (e) { const d = new Date(); return { dow: d.getDay(), h: d.getHours(), m: d.getMinutes() }; }
}
export function nextDays(n = 14) { const out = []; const d = new Date(); d.setHours(0, 0, 0, 0); for (let i = 0; i < n; i++) { out.push(dkey(d)); d.setDate(d.getDate() + 1); } return out; }
export function isPast(k, h) { const now = new Date(); return k === dkey(now) && h <= now.getHours(); }
