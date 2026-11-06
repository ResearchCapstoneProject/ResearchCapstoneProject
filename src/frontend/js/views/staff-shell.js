import { store } from '../state/store.js';
import { $ } from '../core/dom.js';
import { esc } from '../core/dom.js';
import { isOnline, logout, mode } from '../data/repo.js';
import { DEMO_MODE, DEMO_RESET } from '../data/constants.js';
/* ---------------- staff area ---------------- */
export function staffShell(tab, inner) {
  const tabs = [['staff', 'Objects', `(${store.S.objects.length})`], ['staff/add', 'Add object', ''], ['staff/bookings', 'Bookings & time slots', `(${store.S.bookings.length})`], ['staff/stats', 'Scan statistics', ''], ['staff/events', 'Events', ''], ['staff/publications', 'Publications', ''],
    ['staff/images', 'Pictures', ''], ['staff/texts', 'Texts', ''],
    ['staff/design', 'Appearance', ''],
    ['staff/settings', 'Settings', '']];
  const who = store.api.user ? `Signed in as ${esc(store.api.user.displayName)} (${esc(store.api.user.role)})` : 'Demo mode · not signed in';
  return `<div class="staffbar"><div class="wrap">
    <div class="title"><b>Staff area</b><span>Collection &amp; visitor management</span></div>
    <div class="who"><span>${who}</span>${store.api.user ? '<a href="#/staff/logout" data-act="logout">Sign out</a>' : ''}${(DEMO_RESET && DEMO_MODE) || !isOnline() ? '<button type="button" class="btn small ghost light" data-act="reset">Reset demo data</button>' : ''}<a class="btn small ghost light" href="#/">Back to website</a></div>
  </div></div>
  <div class="wrap" style="padding-block:24px 80px">
    <nav class="tabs" aria-label="Staff sections">${tabs.map(([h, l, c]) => `<a href="#/${h}" class="${tab === h ? 'on' : ''}">${l} <span class="muted">${c}</span></a>`).join('')}</nav>
    ${inner}
  </div>`;
}
