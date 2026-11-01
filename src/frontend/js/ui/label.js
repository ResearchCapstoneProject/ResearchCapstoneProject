/* The printable QR label placed next to an object in the gallery. */
import { openModal } from './modal.js';
import { ICON } from '../art/icons.js';
import { esc } from '../core/dom.js';
import { qrSVG } from '../core/qr.js';
import { byId, objectURL } from '../state/selectors.js';
import { $ } from '../core/dom.js';

export function objLabel(o, url) {
  return `<div class="objlabel">
    <div class="t">
      <div class="eyebrow">${esc(o.dept)}</div>
      <b>${esc(o.title)}</b>
      <span>${esc([o.origin, o.date].filter(Boolean).join(' · '))}</span>
      <span>${esc(o.material || '')}</span>
      <div class="inv">${esc(o.id)}</div>
    </div>
    <div class="q">${qrSVG(url, `QR code linking to ${o.title}`)}<small>Scan for more<br>English · Setswana</small></div>
    <div class="stripe" aria-hidden="true"></div>
  </div>`;
}
export function openLabel(id) {
  const o = byId(id); if (!o) return; const url = objectURL(o.id);
  openModal(`<div class="box">
    <button class="iconbtn close noprint" type="button" data-act="close" aria-label="Close">${ICON.close}</button>
    <div class="eyebrow noprint">QR label · print and place next to the object</div>
    <h2 class="h3 noprint" style="margin:6px 0 20px">${esc(o.title)}</h2>
    ${objLabel(o, url)}
    <p class="small muted noprint" style="margin:16px 0;word-break:break-all">QR links to: ${esc(url)}</p>
    <div class="noprint" style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="button" data-act="print">Print label</button><button class="btn ghost" type="button" data-act="scan" data-id="${o.id}">Simulate visitor scan</button><a class="btn ghost" href="#/object/${o.id}">Open object page</a></div>
  </div>`, 'QR label');
}
