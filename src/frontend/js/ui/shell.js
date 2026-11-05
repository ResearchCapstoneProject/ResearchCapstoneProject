import { ICON } from '../art/icons.js';
import { emblem } from '../art/objects.js';
import { NAV } from '../data/constants.js';
import { DEPARTMENTS } from '../data/departments.js';
import { SECTIONS } from '../data/explore.js';
import { PUB_TYPES } from '../data/publications.js';
import { openStatus } from '../data/opening.js';
import { esc } from '../core/dom.js';
import { THEME } from '../core/theme.js';
import { applyImageOverrides } from '../core/assets.js';

/* The museum's own logo once one is uploaded in the staff area, otherwise
   the emblem drawn in art/objects.js. */
/* The address is the one footer field with line breaks; they survive as <br>
   and nothing else in it is markup. */
const lines = (text) => esc(text).replace(/\n/g, '<br>');

const mark = () => (THEME.logoUrl
  ? `<img class="brandmark" src="${esc(THEME.logoUrl)}" alt="" width="44" height="44">`
  : emblem());
/* Masthead, utility bar, footer and the #app outlet the router renders into. */

/* Dropdown entries for the main navigation: [href, label]. */
const MENUS = {
  departments: DEPARTMENTS.map((d) => [`#/departments/${d.key}`, d.short]),
  explore: SECTIONS.map((s) => [`#/explore/${s.key}`, s.title]),
  publications: PUB_TYPES.map((t) => [`#/publications/${t.key}`, t.title]),
};

function navItem([h, l, menu]) {
  if (!menu) return `<a href="#/${h}" data-nav="${h}">${esc(l)}</a>`;
  return `<div class="navitem">
    <a href="#/${h}" data-nav="${h}">${esc(l)}</a><button class="navcaret" type="button" data-act="navmenu" aria-expanded="false" aria-controls="menu-${menu}"><span class="sr-only">${esc(l)} menu</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
    <ul class="navmenu" id="menu-${menu}">${MENUS[menu].map(([mh, ml]) => `<li><a href="${mh}">${esc(ml)}</a></li>`).join('')}</ul>
  </div>`;
}

/* ---------------- shell ---------------- */
export function shell() {
  const st = openStatus();
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="utility">
    <div class="wrap">
      <div class="status ${st.open ? '' : 'closed'}"><i></i><span>${st.text}</span><span class="hide-s muted">· Gaborone time</span></div>
      <div class="tools">
        <a href="#/page/accessibility" class="hide-s">Accessibility</a>
        <a href="#/staff" class="hide-s">Staff login</a>
        <span class="lang" role="group" aria-label="Language"><button type="button" aria-pressed="true">EN</button><button type="button" aria-pressed="false" data-act="lang-tn" title="Setswana">TN</button></span>
      </div>
    </div>
  </div>
  <header class="masthead">
    <div class="wrap">
      <a class="brand" href="#/" aria-label="${esc(THEME.siteName)} – home">${mark()}<div><b>${esc(THEME.siteName)}</b><span>${esc(THEME.siteTagline)}</span></div></a>
      <nav class="mainnav" id="mainnav" aria-label="Main">${NAV.map(navItem).join('')}<a href="#/collection" class="mobile-only">Search the collection</a><a href="#/staff" class="mobile-only">Staff area</a></nav>
      <div class="headactions">
        <button class="iconbtn searchbtn" type="button" data-act="search-toggle" aria-label="Search the collection">${ICON.search}</button>
        <a class="btn" href="#/tickets">Tickets</a>
        <button class="iconbtn menubtn" type="button" data-act="menu" aria-label="Menu" aria-controls="mainnav">${ICON.menu}</button>
      </div>
    </div>
    <div class="searchbar" id="searchbar" hidden>
      <form class="wrap" id="topsearch" role="search"><label class="sr-only" for="topq">Search the collection</label><input type="search" id="topq" placeholder="Search objects, places, materials …"><button class="btn" type="submit">Search</button></form>
    </div>
  </header>
  <div class="flagrule" aria-hidden="true"></div>
  <main id="app" tabindex="-1"></main>
  <footer class="site">
    <div class="wrap">
      <div class="cols">
        <div>
          <a class="brand" href="#/" style="color:#fff">${mark()}<div><b style="color:#fff">${esc(THEME.siteName)}</b><span style="color:#9AA3AB">${esc(THEME.footerDepartment)}</span></div></a>
          <p class="faddr" style="margin:18px 0 4px">${lines(THEME.footerAddress)}</p>
          <p class="small fcontact" style="margin:0;color:#9AA3AB">${esc(THEME.footerContact)}</p>
          <form class="newsletter" data-act-submit="newsletter"><label class="sr-only" for="nl">E-mail for newsletter</label><input id="nl" type="email" placeholder="Newsletter: your e-mail"><button class="btn sky" type="submit">Subscribe</button></form>
        </div>
        <div><h4>Visit</h4><ul><li><a href="#/visit">Visit &amp; About</a></li><li><a href="#/tickets">Tickets &amp; time slots</a></li><li><a href="#/page/groups">Groups &amp; schools</a></li><li><a href="#/page/accessibility">Accessibility</a></li></ul></div>
        <div><h4>Discover</h4><ul><li><a href="#/collection">Collection Online</a></li><li><a href="#/events">Events</a></li><li><a href="#/publications">Publications</a></li><li><a href="#/departments">Departments</a></li></ul></div>
        <div><h4>Explore</h4><ul>${SECTIONS.map((s) => `<li><a href="#/explore/${s.key}">${esc(s.title)}</a></li>`).join('')}</ul></div>
      </div>
      <div class="legal">
        <div class="notes"><span>${esc(THEME.footerNote)}</span><span>${esc(THEME.footerNote2)}</span></div>
        <nav aria-label="Legal"><a href="#/visit/about">About us</a><a href="#/imprint">Imprint</a><a href="#/privacy">Privacy</a><a href="#/staff">Staff area</a></nav>
      </div>
    </div>
  </footer>`);
  /* See the router: a menu closed by navigation may open again on hover only
     once the pointer has left it. */
  document.querySelectorAll('.navitem').forEach((n) => n.addEventListener('mouseleave', () => n.classList.remove('shut')));
  /* The masthead and footer render once, outside the router's reach. */
  applyImageOverrides(document.body);
}
