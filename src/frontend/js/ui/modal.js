import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
/* The single modal host. Resets the lightbox and tour-player state directly
   rather than importing them, which would make those modules cyclic. */

/* ---------------- modals ---------------- */
export function openModal(html, label) {
  closeModal();
  store.lastFocus = document.activeElement;
  document.body.insertAdjacentHTML('beforeend', `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}" id="modal">${html}</div>`);
  document.body.style.overflow = 'hidden';
  const f = $('#modal [data-act="close"]'); if (f) f.focus();
}
export function closeModal() {
  store.LB = { id: null, i: 0 }; store.TOURSTATE = { id: null, i: 0 };
  const m = $('#modal'); if (!m) return;
  m.remove(); document.body.style.overflow = '';
  if (store.lastFocus && document.contains(store.lastFocus)) store.lastFocus.focus();
}
