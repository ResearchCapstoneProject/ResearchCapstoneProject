import { openModal } from './modal.js';
import { store } from '../state/store.js';
import { ICON } from '../art/icons.js';
import { viewsOf } from '../art/registry.js';
import { esc } from '../core/dom.js';
import { byId } from '../state/selectors.js';

/* ---------------- lightbox & tour player --------------------------- */
export function openLight(objId, i) {
  const o = byId(objId); if (!o) return;
  store.LB = { id: objId, i };
  const views = viewsOf(o);
  const v = views[i] || views[0];
  openModal(`<div class="lightbox">
    <div class="lbtop"><span class="eyebrow" style="color:#C9D2DA">${esc(o.title)} · ${esc(v.cap)}</span><button class="iconbtn" type="button" data-act="close" aria-label="Close" style="border-color:#4A5157;color:#fff">${ICON.close}</button></div>
    <div class="lbmain">${v.html}</div>
    <div class="lbbar">
      <button class="btn ghost small" type="button" data-act="lb" data-d="-1" style="color:#fff;border-color:#fff" ${views.length < 2 ? 'disabled' : ''}>← Previous</button>
      <span class="small" style="color:#C9D2DA">${i + 1} / ${views.length}</span>
      <button class="btn ghost small" type="button" data-act="lb" data-d="1" style="color:#fff;border-color:#fff" ${views.length < 2 ? 'disabled' : ''}>Next →</button>
    </div>
  </div>`, 'Enlarged image');
}
