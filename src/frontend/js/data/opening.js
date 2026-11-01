import { fromKey, hh } from '../core/format.js';
import { gabNow } from '../core/time.js';
import { HOLIDAYS, HOURS } from './constants.js';
import { DAYNAME } from '../core/time.js';

/* When is the museum open? Reads the HOURS / HOLIDAYS reference data, so this
   sits in data/ rather than core/ -- core/time.js stays free of museum
   specifics. Both tables are placeholders until the museum confirms them
   (doc/TODO.md), and both become GET /api/config once the backend lands. */

export function openStatus() {
  const { dow, h } = gabNow();
  const hrs = HOURS[dow];
  if (hrs && h >= hrs[0] && h < hrs[1]) return { open: true, text: `Open now · until ${hh(hrs[1])}` };
  if (hrs && h < hrs[0]) return { open: false, text: `Closed now · opens today ${hh(hrs[0])}` };
  for (let i = 1; i <= 7; i++) { const d = (dow + i) % 7; if (HOURS[d]) return { open: false, text: `Closed now · opens ${i === 1 ? 'tomorrow' : DAYNAME[d]} ${hh(HOURS[d][0])}` }; }
  return { open: false, text: 'Closed' };
}
export const hoursFor = (k) => HOURS[fromKey(k).getDay()];
export const holiday = (k) => HOLIDAYS[k.slice(5)];
export function slotHours(k) { const r = hoursFor(k); if (!r) return []; const out = []; for (let h = r[0]; h < r[1]; h++) out.push(h); return out; }
