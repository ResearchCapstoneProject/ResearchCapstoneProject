import { pic } from '../art/registry.js';
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
export function eventRow(ev, past = false) {
  const d = fromKey(ev.d);
  const action = past
    ? (ev.pdf ? `<a class="btn ghost small" href="${esc(ev.pdf)}" target="_blank" rel="noopener">Flyer (PDF)</a>` : '<span class="chip">Past</span>')
    /* With an id the ticket page knows which event it is booking for; the
       bundled offline programme has none, and then it is a plain link. */
    : `<a class="btn ghost small" href="${ev.id ? `#/tickets/event/${ev.id}` : '#/tickets'}">Book</a>`;
  return `<div class="event${past ? ' past' : ''}">
    <div class="date"><b>${d.getDate()}</b><span>${d.toLocaleDateString('en-GB', { month: 'short' })}<br>${past ? d.getFullYear() : d.toLocaleDateString('en-GB', { weekday: 'short' })}</span></div>
    <div><div class="eyebrow">${esc(ev.kind)}</div><h3>${esc(ev.title)}</h3><div class="meta">${esc(ev.time)} · ${esc(ev.place)}${ev.by ? ` · ${esc(ev.by)}` : ''}</div>${ev.text ? `<p class="evtext">${esc(ev.text)}</p>` : ''}</div>
    ${action}
  </div>`;
}
export function pagehead(crumbs, title, lede = '') {
  return `<div class="pagehead"><div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">${crumbs.map(([h, l], i) => (i < crumbs.length - 1 ? `<a href="${h}">${esc(l)}</a><span aria-hidden="true">/</span>` : `<span>${esc(l)}</span>`)).join('')}</nav>
    <h1 class="h1">${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}
  </div></div>`;
}
