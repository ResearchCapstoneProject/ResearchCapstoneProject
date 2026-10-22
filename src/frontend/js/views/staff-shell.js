import { store } from '../state/store.js';
import { $ } from '../core/dom.js';
import { esc } from '../core/dom.js';
import { logout, mode } from '../data/repo.js';
/* ---------------- staff area ---------------- */
export function staffShell(tab, inner) {
  const tabs = [['staff', 'Objects', `(${store.S.objects.length})`], ['staff/add', 'Add object', ''], ['staff/bookings', 'Bookings & time slots', `(${store.S.bookings.length})`], ['staff/stats', 'Scan statistics', '']];
  return `<div class="staffbar"><div class="wrap"><div><b>Staff area</b> · Collection &amp; visitor management</div><div class="who">${store.api.user ? `Signed in as: ${esc(store.api.user.displayName)} (${esc(store.api.user.role)})` : 'Demo mode · not signed in'}${store.api.user ? ' · <a href="#/staff/logout" data-act="logout">Sign out</a>' : ''}<a href="#/" style="color:#fff">Back to website</a></div></div></div>
  <div class="wrap" style="padding-block:24px 80px">
    <nav class="tabs" aria-label="Staff sections">${tabs.map(([h, l, c]) => `<a href="#/${h}" class="${tab === h ? 'on' : ''}">${l} <span class="muted">${c}</span></a>`).join('')}</nav>
    ${inner}
  </div>`;
}
