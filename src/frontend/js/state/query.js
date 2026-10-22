/* Collection search query and filtering. */
import { published } from './selectors.js';
import { store } from './store.js';

/* ---------------- collection ---------------- */
/* One factory for the query object, so every call site gets every field
   (a hand-built literal once left a filter undefined). */
export const newQuery = (over = {}) => ({ q: '', dept: 'All', sort: 'inv', craft: '', page: 1, ...over });

/* The craft is the part of `material` before " · " ("Basketry · Woven plant
   fibre"), as recorded for the Art and Crafts of Botswana catalogue. */
export const craftOf = (o) => { const m = o.material || ''; const i = m.indexOf(' · '); return i > 0 ? m.slice(0, i) : ''; };

export function matches(o, q) { if (!q) return true; const hay = [o.title, o.origin, o.material, o.text, o.id, o.dept, o.date].join(' ').toLowerCase(); return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w)); }
export function filtered(ignoreDept = false) {
  let list = published().filter((o) => matches(o, store.CQ.q));
  if (store.CQ.craft) list = list.filter((o) => craftOf(o) === store.CQ.craft);
  if (!ignoreDept && store.CQ.dept !== 'All') list = list.filter((o) => o.dept === store.CQ.dept);
  const s = store.CQ.sort;
  list.sort((a, b) => (s === 'title' ? a.title.localeCompare(b.title) : s === 'new' ? b.added - a.added : a.id.localeCompare(b.id)));
  return list;
}
