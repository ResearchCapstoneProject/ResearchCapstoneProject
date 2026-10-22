import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
/* ---------------- toast ---------------- */
export function toast(msg) {
  const old = $('.toast'); if (old) old.remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="toast" role="status">${esc(msg)}</div>`);
  clearTimeout(store.toastTimer); store.toastTimer = setTimeout(() => { const t = $('.toast'); if (t) t.remove(); }, 3600);
}
