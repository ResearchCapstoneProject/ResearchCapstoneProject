/* Document-level delegation. Every interactive control in the app is a
   [data-act] attribute dispatched from the click handler here. */
import { route } from '../router/router.js';
import { openLabel } from '../ui/label.js';
import { openLight } from '../ui/lightbox.js';
import { closeModal } from '../ui/modal.js';
import { openScan } from '../ui/scanmodal.js';
import { toast } from '../ui/toast.js';
import { openTour } from '../ui/tourplayer.js';
import { renderResults } from '../views/collection.js';
import { pageStaffBookings } from '../views/staff-bookings.js';
import { updatePreview } from '../views/staff-form.js';
import { tkConfirm, tkRerender } from '../views/tickets.js';
import { store } from '../state/store.js';
import { viewsOf } from '../art/registry.js';
import { $ } from '../core/dom.js';
import { TOUR_TIMES } from '../data/constants.js';
import { save } from '../data/local.js';
import * as repo from '../data/repo.js';
import { newT, visitorsOf } from '../state/booking.js';
import { byId } from '../state/selectors.js';
import { newQuery } from '../state/query.js';
import { pageStaffLogin } from '../views/staff-login.js';

/* ---------------- events ---------------- */
document.addEventListener('click', (e) => {
  /* Handle in-page links ourselves: some preview frames turn a plain
     fragment link into a navigation of the surrounding page. */
  if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
    const a = e.target.closest('a[href^="#"]');
    if (a && !a.hasAttribute('target')) {
      e.preventDefault();
      const to = a.getAttribute('href');
      if (to !== location.hash) { location.hash = to; if (location.hash !== to) { history.replaceState(null, '', to); route(); } }
      else route();
    }
  }
  const t = e.target.closest('[data-act]');
  if (!t) { if (e.target.id === 'modal') closeModal(); return; }
  const act = t.dataset.act;
  switch (act) {
    case 'reset':
      if (confirm('Reset the prototype? Added objects, demo bookings and demo scans will be removed.')) {
        repo.resetDemo().then(() => {
          store.T = newT(); store.CQ = newQuery(); route();
          toast('Demo data reset.');
        }).catch(() => toast('Could not reset the demo data.'));
      }
      break;
    case 'logout':
      e.preventDefault();
      repo.logout().then(() => { location.hash = '#/'; route(); toast('Signed out.'); });
      break;
    case 'lang-tn': toast('Setswana version is planned for phase 2 – Re a leboga!'); break;
    case 'toast': toast(t.dataset.msg); break;
    case 'search-toggle': { const sb = $('#searchbar'); sb.hidden = !sb.hidden; if (!sb.hidden) $('#topq').focus(); break; }
    case 'menu': $('#mainnav').classList.toggle('open'); break;
    case 'close': closeModal(); break;
    case 'scan': openScan(t.dataset.id); break;
    case 'view': {
      const o = byId(t.dataset.id); if (!o) break;
      const i = Number(t.dataset.i); const v = viewsOf(o)[i]; if (!v) break;
      $('#mainpic').innerHTML = `${v.html}<button class="zoombtn" type="button" data-act="light" data-id="${o.id}" data-i="${i}">Enlarge</button>`;
      $('#viewcap').textContent = `${v.cap} · ${viewsOf(o).length} images`;
      document.querySelectorAll('.thumb').forEach((el) => el.setAttribute('aria-pressed', el === t));
      break;
    }
    case 'light': openLight(t.dataset.id, Number(t.dataset.i)); break;
    case 'lb': { const o = byId(store.LB.id); if (!o) break; const n = viewsOf(o).length; openLight(store.LB.id, (store.LB.i + Number(t.dataset.d) + n) % n); break; }
    case 'tour-start': openTour(t.dataset.id, 0); break;
    case 'tour-go': openTour(store.TOURSTATE.id, store.TOURSTATE.i + Number(t.dataset.d)); break;
    case 'close-nav': closeModal(); break;
    case 'label': openLabel(t.dataset.id); break;
    case 'print': document.body.classList.add('printing'); window.print(); setTimeout(() => document.body.classList.remove('printing'), 500); break;
    case 'day': store.T.date = t.dataset.k; store.T.hour = null; store.T.q.tour = 0; tkRerender(); break;
    case 'slot': store.T.hour = Number(t.dataset.h); if (!TOUR_TIMES.includes(store.T.hour)) store.T.q.tour = 0; tkRerender(); break;
    case 'qty': {
      const k = t.dataset.k; store.T.q[k] = Math.max(0, store.T.q[k] + Number(t.dataset.d));
      if (store.T.q.tour > visitorsOf(store.T.q)) store.T.q.tour = visitorsOf(store.T.q);
      tkRerender(); break;
    }
    case 'tk-next': store.T.step += 1; tkRerender(true); break;
    case 'tk-back':
      if (store.T.step === 3) { store.T.name = $('#f-name').value; store.T.email = $('#f-email').value; store.T.phone = $('#f-phone').value; store.T.country = $('#f-country').value; store.T.agree = $('#f-agree').checked; }
      store.T.step -= 1; store.T.err = {}; tkRerender(true); break;
    case 'tk-confirm': tkConfirm(); break;
    case 'tk-new': store.T = newT(); tkRerender(true); break;
    case 'dept': store.CQ.dept = t.dataset.v; renderResults(); break;
    case 'dept-link': store.CQ = newQuery({ dept: t.dataset.v }); break;
    case 'room': store.CQ = newQuery({ room: t.dataset.id }); if (location.hash === '#/collection') route(); else location.hash = '#/collection'; break;
    case 'display': store.CQ.display = !store.CQ.display; renderResults(); break;
    case 'clear-search': store.CQ = newQuery(); $('#cq').value = ''; if ($('#locf')) $('#locf').value = 'All'; renderResults(); break;
    case 'del': {
      const o = byId(t.dataset.id);
      if (o && confirm(`Delete “${o.title}” (${o.id})? Its QR code will stop working.`)) { store.S.objects = store.S.objects.filter((x) => x.id !== o.id); save(); route(); toast(`Deleted ${o.id}.`); }
      break;
    }
    case 'rm-img': store.formImages.splice(Number(t.dataset.i), 1); updatePreview(); break;
    case 'checkin': { const b = store.S.bookings.find((x) => x.code === t.dataset.code); if (b) { b.checkedIn = true; save(); $('#app').innerHTML = pageStaffBookings(); toast(`${b.code} checked in · ${b.visitors} visitor${b.visitors > 1 ? 's' : ''}`); } break; }
    case 'sday': store.SB.date = t.dataset.k; $('#app').innerHTML = pageStaffBookings(); break;
    default: break;
  }
});
document.addEventListener('submit', (e) => {
  if (e.target.id === 'stafflogin') {
    e.preventDefault();
    const form = e.target;
    const user = form.querySelector('#l-user').value.trim();
    const pass = form.querySelector('#l-pass').value;
    repo.login(user, pass)
      .then(() => { location.hash = '#/staff'; route(); })
      .catch((err) => {
        $('#app').innerHTML = pageStaffLogin(
          err && err.status === 401
            ? 'Incorrect username or password.'
            : 'Could not sign in. Please try again.',
        );
        $('#l-user').focus();
      });
    return;
  }
  const f = e.target;
  if (f.id === 'topsearch' || f.id === 'teasersearch') {
    e.preventDefault(); const q = (f.querySelector('input').value || '').trim();
    store.CQ = newQuery({ q });
    if (location.hash === '#/collection') route(); else location.hash = '#/collection';
  } else if (f.id === 'colsearch') {
    e.preventDefault(); store.CQ.q = $('#cq').value.trim(); renderResults();
  } else if (f.dataset.actSubmit === 'newsletter') {
    e.preventDefault(); toast('Newsletter sign-up is part of the full website – not active in the prototype.');
  }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'cq') { store.CQ.q = e.target.value.trim(); renderResults(); }
  if (store.T.step === 3 && e.target.id && e.target.id.startsWith('f-')) {
    const m = { 'f-name': 'name', 'f-email': 'email', 'f-phone': 'phone' }; if (m[e.target.id]) store.T[m[e.target.id]] = e.target.value;
  }
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'sort') { store.CQ.sort = e.target.value; renderResults(); }
  if (e.target.id === 'locf') { store.CQ.room = e.target.value; renderResults(); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (!$('#modal')) return;
  if (store.LB.id && $('.lightbox')) {
    const n = viewsOf(byId(store.LB.id)).length;
    if (e.key === 'ArrowRight') openLight(store.LB.id, (store.LB.i + 1) % n);
    if (e.key === 'ArrowLeft') openLight(store.LB.id, (store.LB.i - 1 + n) % n);
  } else if (store.TOURSTATE.id && $('.tournav')) {
    if (e.key === 'ArrowRight') openTour(store.TOURSTATE.id, store.TOURSTATE.i + 1);
    if (e.key === 'ArrowLeft') openTour(store.TOURSTATE.id, store.TOURSTATE.i - 1);
  }
});
window.addEventListener('hashchange', route);
window.addEventListener('afterprint', () => document.body.classList.remove('printing'));
