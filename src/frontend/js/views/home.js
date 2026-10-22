import { eventRow, exCard, objCard } from '../ui/cards.js';
import { card } from '../ui/content.js';
import { trailCards } from './explore.js';
import { splitEvents } from './events.js';
import { ICON } from '../art/icons.js';
import { basketArt } from '../art/objects.js';
import { EXHIBITIONS } from '../data/constants.js';
import { ABOUT } from '../data/about.js';
import { SECTIONS } from '../data/explore.js';
import { openStatus } from '../data/opening.js';
import { published } from '../state/selectors.js';
import { esc } from '../core/dom.js';

/* ---------------- pages ---------------- */
export function pageHome() {
  const st = openStatus();
  const latest = [...published()].sort((a, b) => b.added - a.added).slice(0, 4);
  const { upcoming } = splitEvents();
  return `
  <section class="hero" aria-label="Featured exhibition">
    <div class="band" aria-hidden="true"></div>
    <div class="wrap">
      <div class="copy">
        <div class="top">
          <div class="eyebrow">Special exhibition · 30 Sep 2026 – 28 Mar 2027</div>
          <p>Diamond Jubilee: sixty years of independence, told through sixty objects.</p>
        </div>
        <h1>Botswana at 60</h1>
        <div class="bottom">
          <p>From the first Independence Day flag to baskets woven in Etsha – how a young nation tells its story.</p>
          <div class="ctas"><a class="btn" href="#/tickets">Book a time slot</a><a class="btn ghost" href="#/collection">Explore the objects</a></div>
        </div>
      </div>
      <div class="art">${basketArt({ bg: null })}</div>
    </div>
    <div class="credit">Illustration: coiled basket, “Tears of the Giraffe” pattern</div>
  </section>

  <section class="visitstrip" aria-label="Visit information">
    <div class="wrap">
      <div class="cell"><div class="eyebrow">Today</div><b>${st.text}</b><span>Tue–Fri 09–18 · Sat–Sun 09–17 · Mon closed</span></div>
      <div class="cell"><div class="eyebrow">Admission</div><b>Free for citizens &amp; residents</b><span>International visitors P 50 · sample prices</span></div>
      <div class="cell"><div class="eyebrow">Address</div><b>331 Independence Avenue</b><span>Gaborone, Botswana</span></div>
      <div class="cta"><a class="btn sky arrow" href="#/visit">Plan your visit </a></div>
    </div>
  </section>

  <section>
    <div class="wrap welcome">
      <div><div class="eyebrow" style="margin-bottom:10px">Dumelang – welcome</div><h2 class="h2">Botswana’s story, from the Stone Age to today</h2></div>
      <div>
        <p class="lede" style="margin:0 0 14px">${esc(ABOUT[0])}</p>
        <p class="lede" style="margin:0">${esc(ABOUT[2])}</p>
        <div class="facts">
          <div><b>1967</b><span>founded by Act of Parliament</span></div>
          <div><b>5</b><span>divisions, one museum</span></div>
          <div><b>8,000+</b><span>ethnographic artefacts</span></div>
        </div>
        <p style="margin:24px 0 0"><a class="btn ghost small arrow" href="#/visit/about">About the museum </a></p>
      </div>
    </div>
  </section>

  <section class="rule-top" id="exhibitions" style="border-top-width:1px;border-color:var(--line)">
    <div class="wrap">
      <div class="sec-head"><div><div class="eyebrow">Exhibitions</div><h2 class="h2">On view now</h2></div><a class="btn ghost small arrow" href="#/exhibitions">All exhibitions </a></div>
      <div class="exgrid">${exCard(EXHIBITIONS[0], true)}${EXHIBITIONS.slice(1).map((e) => exCard(e)).join('')}</div>
    </div>
  </section>

  <section class="bg-mist">
    <div class="wrap">
      <div class="sec-head">
        <div><div class="eyebrow">Collection Online</div><h2 class="h2">New in the collection</h2></div>
        <form class="teasersearch" id="teasersearch" role="search" style="display:flex;gap:8px;flex:1;max-width:460px;min-width:260px"><label class="sr-only" for="tq">Search the collection</label><input type="search" id="tq" placeholder="Search ${published().length} objects …"><button class="btn" type="submit">Search</button></form>
      </div>
      <div class="objgrid">${latest.map(objCard).join('')}</div>
      <p class="small muted" style="margin:28px 0 0;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="chip dev">How it works</span> Objects that staff add in the staff area appear here automatically – no web developer needed. <a href="#/collection">Explore the collection →</a></p>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="sec-head"><div><div class="eyebrow">Tours &amp; trips</div><h2 class="h2">Heritage trails across Botswana</h2></div><a class="btn ghost small arrow" href="#/explore/trails">All heritage trails </a></div>
      <p class="lede" style="margin:-12px 0 28px">Four routes published by the museum link monuments, museums and natural sites. Each trail map can be downloaded for the road.</p>
      <div class="cgrid">${trailCards()}</div>
    </div>
  </section>

  <section class="bg-mist">
    <div class="wrap">
      <div class="sec-head"><div><div class="eyebrow">Explore</div><h2 class="h2">Heritage beyond the museum</h2></div><a class="btn ghost small arrow" href="#/explore">Map of all places </a></div>
      <div class="cgrid three">${SECTIONS.filter((x) => x.key !== 'trails').map((x) => card({ href: `#/explore/${x.key}`, img: x.cover, eyebrow: x.eyebrow, title: x.title })).join('')}</div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="sec-head"><div><div class="eyebrow">What’s on</div><h2 class="h2">Upcoming events</h2></div><a class="btn ghost small arrow" href="#/events">Upcoming &amp; past events </a></div>
      ${upcoming.length ? `<div class="events">${upcoming.slice(0, 4).map((e) => eventRow(e)).join('')}</div>` : '<p class="muted">No upcoming events are listed at the moment. <a href="#/events">See past events</a>.</p>'}
    </div>
  </section>

  <section class="bg-mist">
    <div class="wrap">
      <div class="sec-head"><div><div class="eyebrow">Museum digital</div><h2 class="h2">Visit online, discover more in the galleries</h2></div></div>
      <div class="digital">
        <a href="#/collection">${ICON.grid}<span class="chip live dot">Live in prototype</span><h3>Collection Online</h3><p>Search and browse every published object record.</p></a>
        <a href="#/object/BNM-ETH-0302">${ICON.qr}<span class="chip live dot">Live in prototype</span><h3>QR codes on objects</h3><p>Scan a label in the gallery to open the object page.</p></a>
        <a href="#/explore/trails">${ICON.route}<span class="chip live dot">Live in prototype</span><h3>Heritage trails</h3><p>Trips to monuments and museums, with maps to download.</p></a>
        <a href="#/page/virtual-tour">${ICON.tour}<span class="chip plan dot">Planned</span><h3>Virtual tour</h3><p>Walk through the galleries in 360° from anywhere.</p></a>
        <a href="#/page/ar">${ICON.ar}<span class="chip plan dot">Planned</span><h3>AR in the exhibition</h3><p>See objects in 3D and in their original setting.</p></a>
        <a href="#/page/displays">${ICON.screen}<span class="chip plan dot">Planned</span><h3>Interactive displays</h3><p>Touch screens in the galleries fed by the same database.</p></a>
      </div>
    </div>
  </section>`;
}
