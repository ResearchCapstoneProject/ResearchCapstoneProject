import { objCard, pagehead } from '../ui/cards.js';
import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
import { DEPTS } from '../data/constants.js';
import { filtered } from '../state/query.js';
import { PAGE_COPY } from '../data/pagecopy.js';

export function pageCollection() {
  return `${pagehead([['#/', 'Home'], ['', esc(PAGE_COPY.collection.title)]], esc(PAGE_COPY.collection.title), esc(PAGE_COPY.collection.lede))}
  <div class="wrap">
    <div class="filters">
      <form class="search" id="colsearch" role="search"><label class="sr-only" for="cq">Search the collection</label><input type="search" id="cq" value="${esc(store.CQ.q)}" placeholder="Search by title, place, material or inventory number"><button class="btn" type="submit">Search</button></form>
      <div class="row" id="deptchips"></div>
    </div>
    <div class="resulthead"><div id="rcount" class="muted" aria-live="polite"></div>
      <div style="display:flex;gap:10px;align-items:center"><label for="sort" class="small muted">Sort by</label><select id="sort"><option value="inv" ${store.CQ.sort === 'inv' ? 'selected' : ''}>Inventory number</option><option value="title" ${store.CQ.sort === 'title' ? 'selected' : ''}>Title A–Z</option><option value="new" ${store.CQ.sort === 'new' ? 'selected' : ''}>Recently added</option></select></div>
    </div>
    <div id="results" style="padding-bottom:72px"></div>
  </div>`;
}
/* Paging. The page lives in store.CQ, so returning from an object page lands
   on the same page; every change of search, filter or sort resets it to 1
   (see events/bind.js). */
export const PAGE_SIZE = 12;

/* Page numbers to show: first, last, the current page and its neighbours,
   with gaps ('…') between them. */
function pageList(cur, n) {
  const keep = new Set([1, n, cur - 1, cur, cur + 1].filter((p) => p >= 1 && p <= n));
  const out = []; let prev = 0;
  [...keep].sort((a, b) => a - b).forEach((p) => { if (p - prev > 1) out.push('…'); out.push(p); prev = p; });
  return out;
}

function pager(cur, n) {
  if (n <= 1) return '';
  const btn = (p, label, extra = '') => `<button type="button" class="pgbtn" data-act="page" data-p="${p}" ${extra}>${label}</button>`;
  return `<nav class="pager" aria-label="Result pages">
    ${btn(cur - 1, '← Previous', cur === 1 ? 'disabled' : 'aria-label="Previous page"')}
    <span class="pgnums">${pageList(cur, n).map((p) => (p === '…' ? '<span class="pggap" aria-hidden="true">…</span>' : btn(p, p, p === cur ? 'aria-current="page"' : `aria-label="Page ${p}"`))).join('')}</span>
    ${btn(cur + 1, 'Next →', cur === n ? 'disabled' : 'aria-label="Next page"')}
  </nav>`;
}

export function renderResults() {
  const base = filtered(true);
  const counts = { All: base.length }; DEPTS.forEach((d) => { counts[d.key] = base.filter((o) => o.dept === d.key).length; });
  $('#deptchips').innerHTML = ['All', ...DEPTS.map((d) => d.key)].map((k) => `<button type="button" class="fchip" data-act="dept" data-v="${k}" aria-pressed="${store.CQ.dept === k}">${k === 'All' ? 'All departments' : k}<span>${counts[k]}</span></button>`).join('')
    + (store.CQ.craft ? `<button type="button" class="fchip" data-act="craft-clear" aria-pressed="true" aria-label="Remove the craft filter ${esc(store.CQ.craft)}">Craft: ${esc(store.CQ.craft)} ✕</button>` : '');
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, store.CQ.page || 1), pages);
  store.CQ.page = page;
  const from = (page - 1) * PAGE_SIZE;
  const shown = list.slice(from, from + PAGE_SIZE);
  const range = pages > 1 ? `Showing ${from + 1}–${from + shown.length} of ${list.length} objects` : `${list.length} ${list.length === 1 ? 'object' : 'objects'}`;
  $('#rcount').textContent = `${range}${store.CQ.q ? ` for “${store.CQ.q}”` : ''}${store.CQ.craft ? ` · ${store.CQ.craft}` : ''} · inventory numbers are provisional`;
  $('#results').innerHTML = list.length ? `<div class="objgrid">${shown.map(objCard).join('')}</div>${pager(page, pages)}` : `<div class="empty"><p>No objects match your search.</p><button class="btn ghost" type="button" data-act="clear-search">Clear search &amp; filters</button></div>`;
}
