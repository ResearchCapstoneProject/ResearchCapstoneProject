/* Hash router. Every URL the browser requests is "/" plus a fragment the
   server never sees, so no SPA catch-all is needed on the backend. */
import { bindTips } from '../ui/charts.js';
import { closeModal } from '../ui/modal.js';
import { pageCollection, renderResults } from '../views/collection.js';
import { pageEvents } from '../views/events.js';
import { pageExhibitions } from '../views/exhibitions.js';
import { pageHome } from '../views/home.js';
import { pageMap } from '../views/map.js';
import { pageNotFound } from '../views/notfound.js';
import { pageObject } from '../views/object.js';
import { pagePlaceholder } from '../views/placeholder.js';
import { pageStaffBookings } from '../views/staff-bookings.js';
import { bindForm, pageStaffForm } from '../views/staff-form.js';
import { pageStaffObjects } from '../views/staff-objects.js';
import { pageStaffStats } from '../views/staff-stats.js';
import { pageTickets } from '../views/tickets.js';
import { pageTour, pageTours } from '../views/tours.js';
import { pageVisit } from '../views/visit.js';
import { store } from '../state/store.js';
import { $ } from '../core/dom.js';
import { PAGES } from '../data/constants.js';
import { newT } from '../state/booking.js';
import { byId, tourById } from '../state/selectors.js';
import { isOnline } from '../data/repo.js';
import { pageStaffLogin } from '../views/staff-login.js';

/* ---------------- router ---------------- */
export function route() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [a = '', b = '', c = ''] = h.split('/');
  closeModal();
  const nav = $('#mainnav'); nav.classList.remove('open');
  $('#searchbar').hidden = true;
  let html; let title = 'Home'; let after = null;
  switch (a) {
    case '': html = pageHome(); break;
    case 'visit': html = pageVisit(); title = 'Visit'; break;
    case 'exhibitions': html = pageExhibitions(); title = 'Exhibitions'; break;
    case 'events': html = pageEvents(); title = 'Events'; break;
    case 'tickets': if (store.T.step === 4) store.T = newT(); html = pageTickets(); title = 'Tickets'; break;
    case 'collection': html = pageCollection(); title = 'Collection Online'; after = renderResults; break;
    case 'map': html = pageMap(); title = 'Museum map'; break;
    case 'tours': html = pageTours(); title = 'Tours'; break;
    case 'tour': html = pageTour(b); title = (tourById(b) || {}).title || 'Tour'; break;
    case 'object': html = pageObject(b); title = (byId(b) || {}).title || 'Object'; break;
    case 'staff':
      /* Guard. Online, the staff area needs a session -- the API enforces
         this too, so this only saves a pointless round trip and a flash of
         an empty table. Offline there is no server to sign in to, so the
         area stays open for demos, with the banner saying so. */
      if (b === 'login') { html = pageStaffLogin(); title = 'Staff sign-in'; break; }
      if (isOnline() && !store.api.user) { location.hash = '#/staff/login'; return; }
      if (b === 'add') { html = pageStaffForm(null); after = () => bindForm(null); title = 'Add object'; }
      else if (b === 'edit') { html = pageStaffForm(c); after = () => bindForm(c); title = 'Edit object'; }
      else if (b === 'bookings') { html = pageStaffBookings(); title = 'Bookings'; }
      else if (b === 'stats') { html = pageStaffStats(); title = 'Scan statistics'; after = bindTips; }
      else { html = pageStaffObjects(); title = 'Staff area'; }
      break;
    case 'page': html = pagePlaceholder(b); title = (PAGES[b] || {}).t || 'Page'; break;
    default: html = pageNotFound(); title = 'Not found';
  }
  $('#app').innerHTML = html;
  if (after) after();
  document.title = `${title} · Botswana National Museum (Prototype)`;
  document.querySelectorAll('[data-nav]').forEach((el) => el.classList.toggle('on', el.dataset.nav === a || (a === 'object' && el.dataset.nav === 'collection') || (a === 'page' && el.dataset.nav === `page/${b}`)));
  document.querySelectorAll('[data-pb]').forEach((el) => el.classList.toggle('on', el.dataset.pb === a));
  window.scrollTo(0, 0);
  if (store.PENDING) { const p = store.PENDING; store.PENDING = null; p(); }
}
