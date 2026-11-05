/* Hash router. Every URL the browser requests is "/" plus a fragment the
   server never sees, so no SPA catch-all is needed on the backend. */
import { bindTips } from '../ui/charts.js';
import { closeModal } from '../ui/modal.js';
import { pageCollection, renderResults } from '../views/collection.js';
import { pageEvents } from '../views/events.js';
import { pageHome } from '../views/home.js';
import { pageNotFound } from '../views/notfound.js';
import { pageObject } from '../views/object.js';
import { pagePlaceholder } from '../views/placeholder.js';
import { pageStaffBookings } from '../views/staff-bookings.js';
import { bindForm, pageStaffForm } from '../views/staff-form.js';
import { pageStaffObjects } from '../views/staff-objects.js';
import { pageStaffStats } from '../views/staff-stats.js';
import { bindSettings, pageStaffSettings } from '../views/staff-settings.js';
import { bindDesign, pageStaffDesign, wireDesign } from '../views/staff-design.js';
import { pageTickets } from '../views/tickets.js';
import { pageDepartment, pageDepartments } from '../views/departments.js';
import { pageImprint, pagePrivacy } from '../views/legal.js';
import { pageExplore, pageExploreRoute } from '../views/explore.js';
import { pagePubType, pagePublications } from '../views/publications.js';
import { mountMaps } from '../ui/maps.js';
import { pageVisit } from '../views/visit.js';
import { store } from '../state/store.js';
import { $ } from '../core/dom.js';
import { PAGES } from '../data/constants.js';
import { THEME } from '../core/theme.js';
import { newT } from '../state/booking.js';
import { newQuery } from '../state/query.js';
import { byId } from '../state/selectors.js';
import { isOnline } from '../data/repo.js';
import { pageStaffLogin } from '../views/staff-login.js';
import { DEPARTMENTS } from '../data/departments.js';
import { PUB_TYPES } from '../data/publications.js';
import { SECTIONS, siteById } from '../data/explore.js';

/* Old addresses that moved: the themed tours were replaced by the heritage
   trails in Explore, About merged into Visit, Tsodilo is an Explore page, and
   the sample exhibitions, the museum floor-plan map and the virtual-tour
   placeholder were removed. */
const MOVED = {
  tours: '#/explore/trails', tour: '#/explore/trails',
  exhibitions: '#/collection', map: '#/visit', 'page/virtual-tour': '#/',
  'publications/heritage-trails': '#/explore/trails',
  'page/about': '#/visit/about', 'page/tsodilo': '#/explore/monuments/tsodilo',
};

/* ---------------- router ---------------- */
export function route() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [a = '', b = '', c = ''] = h.split('/');
  const moved = MOVED[a] || MOVED[`${a}/${b}`];
  if (moved) { history.replaceState(null, '', moved); route(); return; }
  closeModal();
  const nav = $('#mainnav'); nav.classList.remove('open');
  $('#searchbar').hidden = true;
  /* Close the dropdowns. `shut` keeps a hover menu from staying open under
     the pointer after a click; the shell clears it on mouseleave. */
  document.querySelectorAll('.navitem').forEach((n) => { n.classList.remove('open'); n.classList.toggle('shut', n.matches(':hover')); n.querySelector('[data-act="navmenu"]').setAttribute('aria-expanded', 'false'); });
  if (document.activeElement && document.activeElement.closest('.navitem')) document.activeElement.blur();
  let html; let title = 'Home'; let after = null; let anchor = null;
  switch (a) {
    case '': html = pageHome(); break;
    case 'visit': html = pageVisit(); title = 'Visit & About'; if (b) anchor = `sec-${b}`; after = mountMaps; break;
    case 'departments': html = b ? pageDepartment(b, c) : pageDepartments(); title = (DEPARTMENTS.find((d) => d.key === b) || { short: 'Departments' }).short; break;
    case 'explore': html = b ? pageExploreRoute(b, c) : pageExplore(); title = (siteById(c) || {}).name || (SECTIONS.find((s) => s.key === b) || {}).title || 'Explore'; after = mountMaps; break;
    case 'publications': html = b ? pagePubType(b) : pagePublications(); title = (PUB_TYPES.find((t) => t.key === b) || { title: 'Publications' }).title; break;
    case 'events': html = pageEvents(); title = 'Events'; break;
    case 'imprint': html = pageImprint(); title = 'Imprint'; break;
    case 'privacy': html = pagePrivacy(); title = 'Privacy notice'; break;
    case 'tickets': if (store.T.step === 4) store.T = newT(); html = pageTickets(); title = 'Tickets'; break;
    /* #/collection/<craft> opens the collection filtered to one craft of the
       Art and Crafts of Botswana catalogue; the home page links them so. */
    case 'collection': if (b && store.CQ.craft !== b) store.CQ = newQuery({ craft: b }); html = pageCollection(); title = 'Collection Online'; after = renderResults; break;
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
      else if (b === 'design') {
        html = pageStaffDesign(); title = 'Appearance';
        /* Same shape as the settings page: render the shell, fetch the kit,
           then re-render in place. wireDesign re-attaches the file inputs and
           the live preview, which do not go through the delegated listeners. */
        const again = () => { $('#app').innerHTML = pageStaffDesign(); wireDesign(again); };
        after = () => bindDesign(again);
      }
      else if (b === 'settings') {
        html = pageStaffSettings(); title = 'Settings';
        /* The groups and settings are fetched after the shell is on screen,
           then the page re-renders in place -- no spinner route, no flash. */
        after = () => bindSettings(() => { $('#app').innerHTML = pageStaffSettings(); });
      }
      else { html = pageStaffObjects(); title = 'Staff area'; }
      break;
    case 'page': html = pagePlaceholder(b); title = (PAGES[b] || {}).t || 'Page'; break;
    default: html = pageNotFound(); title = 'Not found';
  }
  $('#app').innerHTML = html;
  if (after) after();
  document.title = `${title} · ${THEME.siteName}`;
  document.querySelectorAll('[data-nav]').forEach((el) => el.classList.toggle('on', el.dataset.nav === a || (a === 'object' && el.dataset.nav === 'collection') || (a === 'page' && el.dataset.nav === `page/${b}`)));
  window.scrollTo(0, 0);
  if (anchor) { const el = document.getElementById(anchor); if (el) el.scrollIntoView(); }
  if (store.PENDING) { const p = store.PENDING; store.PENDING = null; p(); }
}
