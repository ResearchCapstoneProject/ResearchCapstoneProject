import { openModal } from './modal.js';
import { store } from '../state/store.js';
import { emblem } from '../art/objects.js';
import { viewsOf } from '../art/registry.js';
import { $, esc } from '../core/dom.js';
import { qrSVG } from '../core/qr.js';
import { save } from '../data/local.js';
import { byId, objectURL } from '../state/selectors.js';

export function openScan(id) {
  const o = byId(id); if (!o) return; const url = objectURL(o.id);
  store.S.scans[id] = (store.S.scans[id] || 0) + 1; save();
  openModal(`<div class="phonewrap">
    <div class="explain">
      <div class="eyebrow" style="color:#9FC7E4">In the gallery</div>
      <h2>What a visitor sees after scanning</h2>
      <ol><li>The visitor points the phone camera at the QR code on the label.</li><li>The object page opens in the browser – no app, no login.</li><li>Content comes live from the collection database, so staff edits appear immediately.</li></ol>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn sky" type="button" data-act="close">Close</button><button class="btn ghost" type="button" data-act="scan" data-id="${o.id}" style="color:#fff;border-color:#fff">Scan again</button></div>
    </div>
    <div class="phone">
      <div class="scanning" id="scanning"><div><div class="frame">${qrSVG(url)}</div><p>Scanning label …</p></div></div>
      <div class="screen">
        <div class="urlbar"><span>${esc(url.replace(/^https?:\/\//, ''))}</span></div>
        <div class="scroll">
          <div class="mhead"><span class="brand">${emblem()}<b>National Museum</b></span><span class="langs small"><b>EN</b><span class="muted">TN</span></span></div>
          <div class="mstrip" id="mstrip">${viewsOf(o).map((v) => `<div class="mslide">${v.html}</div>`).join('')}</div>
          <div class="mdots" id="mdots">${viewsOf(o).map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
          <div class="mbody">
            <div class="eyebrow">${esc(o.dept)} · ${esc(o.id)}</div>
            <h3>${esc(o.title)}</h3>
            <div class="audio"><i>▶</i><span>Listen in Setswana or English<br><span style="opacity:.7">Audio guide · planned</span></span></div>
            <dl><dt>Date</dt><dd>${esc(o.date || '–')}</dd><dt>Material</dt><dd>${esc(o.material || '–')}</dd><dt>Origin</dt><dd>${esc(o.origin || '–')}</dd></dl>
            <p>${esc(o.text || '')}</p>
            <a class="btn small" href="#/tickets" style="margin-top:6px">Book a guided tour</a>
          </div>
        </div>
      </div>
    </div>
  </div>`, 'Visitor scan simulation');
  const sc = $('#scanning');
  setTimeout(() => { if (sc) { sc.style.opacity = '0'; setTimeout(() => sc.remove(), 400); } }, 1400);
  const strip = $('#mstrip');
  if (strip) strip.addEventListener('scroll', () => {
    const i = Math.round(strip.scrollLeft / strip.clientWidth);
    document.querySelectorAll('#mdots i').forEach((d, j) => d.classList.toggle('on', j === i));
  });
}
