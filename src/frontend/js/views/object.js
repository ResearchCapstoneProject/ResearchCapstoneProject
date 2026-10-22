import { floorPlan } from '../ui/floorplan.js';
import { objLabel } from '../ui/label.js';
import { pageNotFound } from './notfound.js';
import { ICON } from '../art/icons.js';
import { viewsOf } from '../art/registry.js';
import { $, esc } from '../core/dom.js';
import { byId, objectURL, published, roomOf, toursOf } from '../state/selectors.js';
import { store } from '../state/store.js';
import { objCard } from '../ui/cards.js';
import { request } from '../data/api.js';

/* ---------------- object ---------------- */
export function pageObject(id) {
  const o = byId(id);
  if (!o) return pageNotFound();
  const url = objectURL(o.id);
  const related = published().filter((x) => x.dept === o.dept && x.id !== o.id).slice(0, 4);
  const store = !o.onDisplay;
  const views = viewsOf(o);
  const room = roomOf(o.location);
  const inTours = toursOf(o.id);
  return `
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb" style="padding-top:28px"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="#/collection">Collection</a><span aria-hidden="true">/</span><span>${esc(o.dept)}</span></nav>
    ${o.status === 'draft' ? '<p class="chip draft" style="margin-top:8px">Draft · only visible to staff</p>' : ''}
    <div class="objpage">
      <div class="viewer">
        <div class="gallery">
          <div class="pic" id="mainpic">${views[0].html}<button class="zoombtn" type="button" data-act="light" data-id="${o.id}" data-i="0">Enlarge</button></div>
          <div class="thumbs" role="group" aria-label="Images of this object">${views.map((v, i) => `<button type="button" class="thumb" data-act="view" data-id="${o.id}" data-i="${i}" aria-pressed="${i === 0}"><span class="sr-only">${esc(v.cap)}</span>${v.html}</button>`).join('')}</div>
          <p class="small muted" id="viewcap">${esc(views[0].cap)}${views.length > 1 ? ` · ${views.length} images` : ''}</p>
        </div>
        <div class="tools"><button class="btn small" type="button" data-act="scan" data-id="${o.id}">Simulate visitor scan</button><button class="btn ghost small" type="button" data-act="label" data-id="${o.id}">QR label</button><button class="btn ghost small" type="button" data-act="toast" data-msg="Share: copies the object link – planned">Share</button></div>
      </div>
      <div>
        <div class="eyebrow">${esc(o.dept)}</div>
        <h1>${esc(o.title)}</h1>
        <div class="sub">${esc([o.origin, o.date].filter(Boolean).join(' · '))}</div>
        ${inTours.length ? `<div class="tourchips">${inTours.map((t) => `<a class="chip dev" href="#/tour/${t.id}">On the tour: ${esc(t.title)}</a>`).join('')}</div>` : ''}
        <div class="where ${store ? 'store' : ''}">${store ? ICON.box : ICON.pin}<span>${store ? '<b>In the store</b> – can be viewed on request' : `<b>On display:</b> ${esc(o.location)}`}</span></div>
        ${room ? `<div class="planmini"><div class="planbox">${floorPlan({ highlight: room })}</div><a class="small" href="#/map">Open the full museum map →</a></div>` : ''}
        <div class="prose"><p>${esc(o.text || 'Description will follow.')}</p></div>
        <dl class="facts">
          <dt>Inventory number</dt><dd>${esc(o.id)}</dd>
          <dt>Department</dt><dd>${esc(o.dept)}</dd>
          <dt>Origin / maker</dt><dd>${esc(o.origin || '–')}</dd>
          <dt>Date</dt><dd>${esc(o.date || '–')}</dd>
          <dt>Material</dt><dd>${esc(o.material || '–')}</dd>
          <dt>Dimensions</dt><dd>${esc(o.dims || '–')}</dd>
          <dt>Location</dt><dd>${esc(o.location || '–')}</dd>
        </dl>
        <div class="eyebrow" style="margin-bottom:10px">Planned for this record</div>
        <div class="future">
          <div><span class="chip plan">Phase 2</span><b>Audio guide</b><span class="muted">English &amp; Setswana narration</span></div>
          <div><span class="chip plan">Phase 2</span><b>3D model &amp; AR</b><span class="muted">From the digitisation programme</span></div>
          <div><span class="chip plan">Phase 2</span><b>Gallery display</b><span class="muted">Same record on touch screens</span></div>
        </div>
      </div>
    </div>
  </div>
  <section class="bg-mist">
    <div class="wrap labelwrap">
      <div>
        <div class="eyebrow" style="margin-bottom:10px">In the gallery</div>
        <h2 class="h2" style="margin-bottom:14px">One label, one QR code, one record</h2>
        <p class="lede" style="margin:0 0 22px">Every object gets a printed label with a QR code. Visitors scan it with their phone camera and land on this page – no app, no login. Because the page is loaded from the collection database, corrections by staff are visible immediately.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="button" data-act="scan" data-id="${o.id}">Simulate visitor scan</button><button class="btn ghost" type="button" data-act="label" data-id="${o.id}">Print label</button></div>
        <p class="small muted" style="margin-top:16px;word-break:break-all">QR links to: ${esc(url)}</p>
      </div>
      ${objLabel(o, url)}
    </div>
  </section>
  ${related.length ? `<section><div class="wrap"><div class="sec-head"><div><div class="eyebrow">More from the collection</div><h2 class="h2">${esc(o.dept)}</h2></div><a class="btn ghost small arrow" href="#/collection" data-act="dept-link" data-v="${esc(o.dept)}">All ${esc(o.dept)} objects </a></div><div class="objgrid">${related.map(objCard).join('')}</div></div></section>` : ''}`;
}
