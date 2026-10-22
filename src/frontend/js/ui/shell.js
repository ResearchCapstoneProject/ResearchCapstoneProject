import { ICON } from '../art/icons.js';
import { emblem } from '../art/objects.js';
import { NAV } from '../data/constants.js';
import { openStatus } from '../data/opening.js';
import { $ } from '../core/dom.js';
/* Masthead, utility bar, footer and the #app outlet the router renders into. */

/* ---------------- shell ---------------- */
export function shell() {
  const st = openStatus();
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="protobar" role="region" aria-label="Prototype navigation">
    <div class="wrap">
      <span class="tag">PROTOTYPE</span>
      <span class="note">Capstone project with the Botswana National Museum · sample content, not the official website</span>
      <nav aria-label="Prototype screens">
        <a href="#/" data-pb="">Home</a><a href="#/tickets" data-pb="tickets">Tickets</a><a href="#/collection" data-pb="collection">Collection</a><a href="#/object/BNM-ETH-0142" data-pb="object">Object &amp; QR</a><a href="#/tours" data-pb="tours">Tours</a><a href="#/map" data-pb="map">Map</a><a href="#/staff" data-pb="staff">Staff area</a><button type="button" data-act="reset">Reset demo</button>
      </nav>
    </div>
  </div>
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
      <a class="brand" href="#/" aria-label="Botswana National Museum – home">${emblem()}<div><b>Botswana National Museum</b><span>&amp; Art Gallery · Gaborone</span></div></a>
      <nav class="mainnav" id="mainnav" aria-label="Main">${NAV.map(([h, l]) => `<a href="#/${h}" data-nav="${h}">${l}</a>`).join('')}<a href="#/collection" class="mobile-only">Search the collection</a><a href="#/staff" class="mobile-only">Staff area</a></nav>
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
          <a class="brand" href="#/" style="color:#fff">${emblem()}<div><b style="color:#fff">Botswana National Museum</b><span style="color:#9AA3AB">&amp; Art Gallery</span></div></a>
          <p style="margin:18px 0 4px">331 Independence Avenue<br>Gaborone, Botswana</p>
          <p class="small" style="margin:0;color:#9AA3AB">Tue–Fri 09:00–18:00 · Sat–Sun 09:00–17:00 · Mon closed</p>
          <form class="newsletter" data-act-submit="newsletter"><label class="sr-only" for="nl">E-mail for newsletter</label><input id="nl" type="email" placeholder="Newsletter: your e-mail"><button class="btn sky" type="submit">Subscribe</button></form>
        </div>
        <div><h4>Visit</h4><ul><li><a href="#/tickets">Tickets &amp; time slots</a></li><li><a href="#/visit">Opening hours</a></li><li><a href="#/page/groups">Groups &amp; schools</a></li><li><a href="#/map">Museum map</a></li><li><a href="#/page/accessibility">Accessibility</a></li></ul></div>
        <div><h4>Discover</h4><ul><li><a href="#/exhibitions">Exhibitions</a></li><li><a href="#/collection">Collection Online</a></li><li><a href="#/tours">Themed tours</a></li><li><a href="#/events">Events</a></li><li><a href="#/page/virtual-tour">Virtual tour</a></li></ul></div>
        <div><h4>Museum</h4><ul><li><a href="#/page/about">About us</a></li><li><a href="#/page/learn">Learn &amp; schools</a></li><li><a href="#/page/tsodilo">Tsodilo World Heritage Site</a></li><li><a href="#/page/press">Press</a></li><li><a href="#/staff">Staff area</a></li></ul></div>
      </div>
      <div class="legal"><span>Prototype · Research capstone project in cooperation with the Botswana National Museum, 2026</span><span>All objects, prices and events are sample content</span><a href="#/page/about">Imprint</a><a href="#/page/about">Privacy</a></div>
    </div>
  </footer>`);
}
