import { eventRow } from '../ui/cards.js';
import { card } from '../ui/content.js';
import { trailCards } from './explore.js';
import { splitEvents } from './events.js';
import { ICON } from '../art/icons.js';
import { imgSrc } from '../art/registry.js';
import { ABOUT, IMG } from '../data/about.js';
import { SECTIONS } from '../data/explore.js';
import { openStatus } from '../data/opening.js';
import { published } from '../state/selectors.js';
import { craftOf } from '../state/query.js';
import { esc } from '../core/dom.js';

/* The museum building, in several widths so every screen gets a sharp copy
   without downloading the 6000px original. */
const HERO = `${IMG}/web/natural-history/pix/museum-picture`;
const heroImg = `<img src="${HERO}-1600.jpg" srcset="${[960, 1600, 2400, 3200].map((w) => `${HERO}-${w}.jpg ${w}w`).join(', ')}" sizes="100vw" alt="The Botswana National Museum building" fetchpriority="high">`;

/* The six crafts of the "Art and Crafts of Botswana" catalogue; each card
   opens the collection filtered to that craft. `pick` is the record whose
   first photo represents the craft. */
const CRAFTS = [
  { name: 'Basketry', pick: 'Storage baskets' },
  { name: 'Pottery', pick: 'Decorative clay pots (Dinkgwana tsa makgabisa)' },
  { name: 'Wood carving', pick: 'Carved figurines: animals' },
  { name: 'Beadwork', pick: 'Necklaces, tie and earrings (Dibaga le Manyena)' },
  { name: 'Iron smelting and blacksmithing', pick: 'Metal tools (Didirisiwa tsa tshipi)' },
  { name: 'Leather', pick: 'Dancing skirt, apron and cloak' },
];

function craftCard(c, objs) {
  const list = objs.filter((o) => craftOf(o) === c.name);
  const o = list.find((x) => x.title === c.pick) || list.find((x) => x.images && x.images.length);
  const src = o && o.images && o.images.length ? imgSrc(o.images[0]) : '';
  return `<a class="craft" href="#/collection/${encodeURIComponent(c.name)}">
    <span class="pic">${src ? `<img src="${esc(src)}" alt="" loading="lazy">` : ''}</span>
    <span class="txt"><b>${esc(c.name)}</b><span>${list.length} object record${list.length === 1 ? '' : 's'}</span></span>
  </a>`;
}

/* ---------------- pages ---------------- */
export function pageHome() {
  const st = openStatus();
  const objs = published();
  const { upcoming } = splitEvents();
  return `
  <section class="phero" aria-label="Welcome">
    ${heroImg}
    <div class="wrap">
      <div class="pcopy">
        <div class="eyebrow">Department of National Museum and Monuments · Gaborone</div>
        <h1>Botswana National Museum</h1>
        <p>${esc(ABOUT[0])}</p>
        <div class="ctas"><a class="btn sky" href="#/visit">Plan your visit</a><a class="btn ghost light" href="#/collection">Explore the collection</a></div>
      </div>
    </div>
  </section>

  <section class="visitstrip" aria-label="Visit information">
    <div class="wrap">
      <div class="cell"><div class="eyebrow">Today</div><b>${st.text}</b><span>Tue–Fri 09–18 · Sat–Sun 09–17 · Mon closed</span></div>
      <div class="cell"><div class="eyebrow">Admission</div><b>Free for citizens &amp; residents</b><span>International visitors P 50 · sample prices</span></div>
      <div class="cell"><div class="eyebrow">Address</div><b>331 Independence Avenue</b><span>Gaborone, Botswana</span></div>
      <div class="cta"><a class="btn arrow" href="#/tickets">Book a time slot </a></div>
    </div>
  </section>

  <section>
    <div class="wrap welcome2">
      <div>
        <div class="eyebrow" style="margin-bottom:10px">Dumelang – welcome</div>
        <h2 class="h2">Sixty years of Botswana’s heritage</h2>
        <p class="lede">${esc(ABOUT[2])}</p>
        <p class="lede">${esc(ABOUT[3])}</p>
        <div class="facts">
          <div><b>1967</b><span>founded by Act of Parliament</span></div>
          <div><b>5</b><span>divisions, one museum</span></div>
          <div><b>8,000+</b><span>ethnographic artefacts</span></div>
        </div>
        <p style="margin:28px 0 0"><a class="btn ghost small arrow" href="#/visit/about">About the museum </a></p>
      </div>
      <figure class="welcomepic"><img src="${IMG}/about/about_photo_02.jpg" alt="A gallery in the National Museum" loading="lazy"><figcaption>In the galleries of the National Museum, Gaborone</figcaption></figure>
    </div>
  </section>

  <section class="bg-sand">
    <div class="wrap">
      <div class="sec-head">
        <div><div class="eyebrow">Collection Online · Art and Crafts of Botswana</div><h2 class="h2">Six crafts, ${objs.length} object records</h2></div>
        <form class="teasersearch" id="teasersearch" role="search"><label class="sr-only" for="tq">Search the collection</label><input type="search" id="tq" placeholder="Search the collection …"><button class="btn" type="submit">Search</button></form>
      </div>
      <div class="crafts">${CRAFTS.map((c) => craftCard(c, objs)).join('')}</div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="sec-head"><div><div class="eyebrow">Explore</div><h2 class="h2">Heritage beyond the museum</h2></div><a class="btn ghost small arrow" href="#/explore">Map of all places </a></div>
      <div class="cgrid five">${SECTIONS.filter((x) => x.key !== 'trails').map((x) => card({ href: `#/explore/${x.key}`, img: x.cover, eyebrow: x.eyebrow, title: x.title })).join('')}</div>
    </div>
  </section>

  <section class="bg-mist">
    <div class="wrap">
      <div class="sec-head"><div><div class="eyebrow">Tours &amp; trips</div><h2 class="h2">Heritage trails across Botswana</h2></div><a class="btn ghost small arrow" href="#/explore/trails">All heritage trails </a></div>
      <p class="lede" style="margin:-12px 0 28px">Four routes published by the museum link monuments, museums and natural sites. Each trail map can be downloaded for the road.</p>
      <div class="cgrid">${trailCards()}</div>
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
        <a href="#/page/ar">${ICON.ar}<span class="chip plan dot">Planned</span><h3>AR in the galleries</h3><p>See objects in 3D and in their original setting.</p></a>
        <a href="#/page/displays">${ICON.screen}<span class="chip plan dot">Planned</span><h3>Interactive displays</h3><p>Touch screens in the galleries fed by the same database.</p></a>
      </div>
    </div>
  </section>`;
}
