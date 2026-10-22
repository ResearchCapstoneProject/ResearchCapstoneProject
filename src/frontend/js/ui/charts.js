import { $ } from '../core/dom.js';
/* ---------------- tooltips for the statistics charts -------------- */
export function bindTips() {
  const host = $('#daychart'); if (!host) return;
  let tip = $('#chart-tip');
  if (!tip) { document.body.insertAdjacentHTML('beforeend', '<div class="charttip" id="chart-tip" hidden></div>'); tip = $('#chart-tip'); }
  const show = (el, x, y) => {
    tip.textContent = el.dataset.tip; tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.min(window.innerWidth - r.width - 12, Math.max(12, x - r.width / 2)) + 'px';
    tip.style.top = Math.max(12, y - r.height - 14) + 'px';
  };
  host.addEventListener('mousemove', (e) => { const el = e.target.closest('[data-tip]'); if (el) { const r = el.getBoundingClientRect(); show(el, r.left + r.width / 2, r.top); } else tip.hidden = true; });
  host.addEventListener('mouseleave', () => { tip.hidden = true; });
  host.addEventListener('focusin', (e) => { const el = e.target.closest('[data-tip]'); if (el) { const r = el.getBoundingClientRect(); show(el, r.left + r.width / 2, r.top); } });
  host.addEventListener('focusout', () => { tip.hidden = true; });
}
