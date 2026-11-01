export const pad = (n) => String(n).padStart(2, '0');
export const pad4 = (n) => String(n).padStart(4, '0');
export const dkey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const fmtDate = (k, o = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) => fromKey(k).toLocaleDateString('en-GB', o);
/* Takes THEBE, not pula. Both the API (price_thebe) and the offline
   defaults use minor units, so there is one unit in the system. */
export const money = (thebe) => (thebe === 0 ? 'Free' : `P ${(thebe / 100).toFixed(2)}`);
export const hh = (h) => `${pad(h)}:00`;
