import { openModal } from './modal.js';
import { store } from '../state/store.js';
import { emblem } from '../art/objects.js';
import { pic } from '../art/registry.js';
import { esc } from '../core/dom.js';
import { objectURL, tourById, tourStops } from '../state/selectors.js';
import { $ } from '../core/dom.js';

export function openTour(tourId, i = 0) {
  const t = tourById(tourId); if (!t) return;
  const stops = tourStops(t); if (!stops.length) return;
  i = Math.max(0, Math.min(stops.length - 1, i));
  store.TOURSTATE = { id: tourId, i };
  const o = stops[i];
  const last = i === stops.length - 1;
  openModal(`<div class="phonewrap">
    <div class="explain">
      <div class="eyebrow" style="color:#9FC7E4">Tour on the visitor’s phone</div>
      <h2>${esc(t.title)}</h2>
      <ol><li>The visitor opens the tour from the website or from any QR label.</li><li>Each stop shows one object with a short text.</li><li>At the object, the QR code opens the same record with all the details.</li></ol>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn sky" type="button" data-act="close">Close</button><a class="btn ghost" href="#/tour/${t.id}" style="color:#fff;border-color:#fff">Tour page</a></div>
    </div>
    <div class="phone">
      <div class="screen">
        <div class="urlbar"><span>${esc(objectURL(o.id).replace(/^https?:\/\//, '').replace(/#.*$/, '') + 'tour/' + t.id)}</span></div>
        <div class="scroll">
          <div class="mhead"><span class="brand">${emblem()}<b>${esc(t.title)}</b></span><span class="small muted">${i + 1}/${stops.length}</span></div>
          <div class="tourbar"><i style="width:${Math.round(((i + 1) / stops.length) * 100)}%"></i></div>
          <div class="mpic">${pic(o)}</div>
          <div class="mbody">
            <div class="eyebrow">Stop ${i + 1} · ${esc(o.onDisplay ? o.location : 'In the store')}</div>
            <h3>${esc(o.title)}</h3>
            <p>${esc((o.text || '').split('. ').slice(0, 2).join('. ') + (o.text ? '.' : ''))}</p>
            <a class="btn ghost small" href="#/object/${o.id}" data-act="close-nav">Full object page</a>
            <div class="tournav">
              <button class="btn ghost small" type="button" data-act="tour-go" data-d="-1" ${i === 0 ? 'disabled' : ''}>Back</button>
              ${last ? '<button class="btn small" type="button" data-act="close">Finish tour</button>' : '<button class="btn small" type="button" data-act="tour-go" data-d="1">Next stop</button>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`, 'Tour preview');
}
