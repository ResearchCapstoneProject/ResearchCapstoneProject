import { exArtwork, pic } from '../art/registry.js';
import { esc } from '../core/dom.js';
import { fromKey } from '../core/format.js';
import { $ } from '../core/dom.js';
/* Card and page-head fragments shared across views. */

/* ---------------- shared pieces ---------------- */
export function objCard(o) {
  return `<a class="objcard" href="#/object/${o.id}">
    <div class="pic">${pic(o)}${o.status === 'draft' ? '<span class="chip draft">Draft</span>' : ''}</div>
    <div class="eyebrow">${esc(o.dept)}</div>
    <h3>${esc(o.title)}</h3>
    <div class="inv">${esc(o.date || '')}${o.date ? ' · ' : ''}${esc(o.id)}</div>
  </a>`;
}
export function exCard(e, big = false) {
  return `<a class="excard ${big ? 'big' : 'row'}" href="#/exhibitions">
    <div class="pic">${exArtwork(e)}</div>
    <div class="txt">
      <div class="eyebrow">${esc(e.kind)} · ${esc(e.dates)}</div>
      <h3 class="${big ? 'h2' : 'h4'}">${esc(e.title)}</h3>
      <p>${esc(e.text)}</p>
    </div>
  </a>`;
}
export function eventRow(ev) {
  const d = fromKey(ev.d);
  return `<div class="event">
    <div class="date"><b>${d.getDate()}</b><span>${d.toLocaleDateString('en-GB', { month: 'short' })}<br>${d.toLocaleDateString('en-GB', { weekday: 'short' })}</span></div>
    <div><div class="eyebrow">${esc(ev.kind)}</div><h3>${esc(ev.title)}</h3><div class="meta">${esc(ev.time)} · ${esc(ev.place)}</div></div>
    <a class="btn ghost small" href="#/tickets">Book</a>
  </div>`;
}
export function pagehead(crumbs, title, lede = '') {
  return `<div class="pagehead"><div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">${crumbs.map(([h, l], i) => (i < crumbs.length - 1 ? `<a href="${h}">${esc(l)}</a><span aria-hidden="true">/</span>` : `<span>${esc(l)}</span>`)).join('')}</nav>
    <h1 class="h1">${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}
  </div></div>`;
}
