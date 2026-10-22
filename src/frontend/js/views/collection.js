import { objCard, pagehead } from '../ui/cards.js';
import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
import { DEPTS } from '../data/constants.js';
import { filtered } from '../state/query.js';
import { roomById } from '../state/selectors.js';
import { ROOMS } from '../data/constants.js';

export function pageCollection() {
  return `${pagehead([['#/', 'Home'], ['', 'Collection Online']], 'Collection Online', 'Explore objects from the museum’s archaeology, ethnography, natural history, history and art collections – including many that are not on display.')}
  <div class="wrap">
    <div class="filters">
      <form class="search" id="colsearch" role="search"><label class="sr-only" for="cq">Search the collection</label><input type="search" id="cq" value="${esc(store.CQ.q)}" placeholder="Search by title, place, material or inventory number"><button class="btn" type="submit">Search</button></form>
      <div class="row" id="deptchips"></div>
      <div class="row"><label class="small muted" for="locf">Where in the museum</label><select id="locf" style="width:auto;min-height:40px">${['All', ...ROOMS.map((r) => r.id), 'store'].map((v) => `<option value="${v}" ${store.CQ.room === v ? 'selected' : ''}>${v === 'All' ? 'Anywhere' : v === 'store' ? 'In the store' : esc((roomById(v) || {}).name || v)}</option>`).join('')}</select><a class="small" href="#/map">Show me on the map →</a></div>
    </div>
    <div class="resulthead"><div id="rcount" class="muted" aria-live="polite"></div>
      <div style="display:flex;gap:10px;align-items:center"><label for="sort" class="small muted">Sort by</label><select id="sort"><option value="inv" ${store.CQ.sort === 'inv' ? 'selected' : ''}>Inventory number</option><option value="title" ${store.CQ.sort === 'title' ? 'selected' : ''}>Title A–Z</option><option value="new" ${store.CQ.sort === 'new' ? 'selected' : ''}>Recently added</option></select></div>
    </div>
    <div id="results" style="padding-bottom:72px"></div>
  </div>`;
}
export function renderResults() {
  const base = filtered(true);
  const counts = { All: base.length }; DEPTS.forEach((d) => { counts[d.key] = base.filter((o) => o.dept === d.key).length; });
  $('#deptchips').innerHTML = ['All', ...DEPTS.map((d) => d.key)].map((k) => `<button type="button" class="fchip" data-act="dept" data-v="${k}" aria-pressed="${store.CQ.dept === k}">${k === 'All' ? 'All departments' : k}<span>${counts[k]}</span></button>`).join('')
    + `<button type="button" class="fchip" data-act="display" aria-pressed="${store.CQ.display}">On display now</button>`;
  const list = filtered();
  $('#rcount').textContent = `${list.length} ${list.length === 1 ? 'object' : 'objects'}${store.CQ.q ? ` for “${store.CQ.q}”` : ''} · all records are sample data`;
  $('#results').innerHTML = list.length ? `<div class="objgrid">${list.map(objCard).join('')}</div>` : `<div class="empty"><p>No objects match your search.</p><button class="btn ghost" type="button" data-act="clear-search">Clear search &amp; filters</button></div>`;
}
