import { pagehead } from '../ui/cards.js';
import { card, mapbox, photos, subnav } from '../ui/content.js';
import { DAYNAME } from '../core/time.js';
import { HOURS, TICKETS } from '../data/constants.js';
import { esc } from '../core/dom.js';
import { hh, money } from '../core/format.js';
import { ABOUT, ABOUT_PHOTOS, CONTACT, HISTORY, IMG, MISSION, OPERATIONS, VISION } from '../data/about.js';
import { DEPARTMENTS, DEPT_INTRO } from '../data/departments.js';

/* Visit and About used to be two pages; they are one now, with in-page
   sections. #/visit/<section> scrolls to `sec-<section>` (see the router). */
export const VISIT_SECTIONS = [['plan', 'Plan your visit'], ['contact', 'Getting here & contact'], ['about', 'About the museum'], ['history', 'History'], ['mission', 'Vision & mission'], ['divisions', 'Divisions']];

export function pageVisit() {
  const today = new Date().getDay();
  const order = [2, 3, 4, 5, 6, 0, 1];
  return `${pagehead([['#/', 'Home'], ['', 'Visit & About']], 'Visit &amp; About', 'Plan your visit to the National Museum in Gaborone and get to know the Department of National Museum and Monuments.')}
  ${subnav(VISIT_SECTIONS.map(([k, l]) => [`#/visit/${k}`, l]))}

  <div class="wrap placeholder" id="sec-plan" style="padding-block:48px 64px">
    <div>
      <h2 class="h3" style="margin-bottom:14px">Opening hours</h2>
      <table class="hours">${order.map((d) => `<tr class="${d === today ? 'today' : ''}"><td>${DAYNAME[d]}${d === today ? ' (today)' : ''}</td><td>${HOURS[d] ? `${hh(HOURS[d][0])} – ${hh(HOURS[d][1])}` : 'Closed'}</td></tr>`).join('')}</table>
      <p class="small muted">Last entry one hour before closing. Closed on selected public holidays. Opening hours and prices are placeholders to be confirmed with the museum.</p>
      <h2 class="h3" style="margin:36px 0 14px">Admission</h2>
      <table class="hours">${TICKETS.map((t) => `<tr><td>${esc(t.name)}</td><td>${money(t.price)}</td></tr>`).join('')}<tr><td>School groups (booked via the education office)</td><td>Free</td></tr></table>
      <div style="margin-top:28px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#/tickets">Book a time slot</a></div>
    </div>
    <div>
      <figure class="visitpic"><img src="${IMG}/contact/photo_contact01.jpg" alt="Entrance of the National Museum in Gaborone"></figure>
      <h2 class="h3" style="margin:28px 0 14px">Accessibility</h2>
      <p class="prose">Information on step-free access, seating and assistance will be added together with the museum team.</p>
      <h2 class="h3" style="margin:28px 0 14px">Groups &amp; schools</h2>
      <p class="prose">School classes visit free of charge. The education office plans guided visits and workshops for all school levels.</p>
    </div>
  </div>

  <section class="bg-mist" id="sec-contact">
    <div class="wrap twocol">
      <div>
        <div class="eyebrow">Getting here &amp; contact</div>
        <h2 class="h2" style="margin:10px 0 20px">${esc(CONTACT.name)}</h2>
        <address class="contact">
          ${esc(CONTACT.street)}<br>${esc(CONTACT.box)}<br>
          Tel: ${CONTACT.tel.map((t) => `<a href="tel:${t.replace(/\s/g, '')}">${esc(t)}</a>`).join(' / ')}<br>
          Fax: ${esc(CONTACT.fax)}
        </address>
        <p class="prose" style="margin-top:20px">The museum is on Independence Avenue in the centre of Gaborone and can be reached by taxi or combi. Parking information will follow.</p>
        <p class="small">The National Botanical Garden and the National Herbarium are at a second site on Okwa Road – see <a href="#/explore/botanical-garden">Botanical Garden</a>.</p>
      </div>
      ${mapbox([{ pos: CONTACT.pos, name: 'Botswana National Museum, 331 Independence Avenue' }], { label: 'Map: location of the museum' })}
    </div>
  </section>

  <section id="sec-about">
    <div class="wrap twocol wide-left">
      <div class="prose">
        <div class="eyebrow">About the Botswana National Museum and Monuments</div>
        <h2 class="h2" style="margin:10px 0 22px;color:var(--ink)">Sixty years of Botswana’s heritage</h2>
        ${ABOUT.map((t) => `<p>${esc(t)}</p>`).join('')}
        <p>${esc(DEPT_INTRO)}</p>
      </div>
      <figure class="visitpic"><img src="${IMG}/web/natural-history/pix/museum-picture.jpg" alt="Museum building" loading="lazy"></figure>
    </div>
    <div class="wrap" style="margin-top:36px">${photos(ABOUT_PHOTOS, 'Botswana National Museum')}</div>
  </section>

  <section class="bg-mist" id="sec-history">
    <div class="wrap twocol">
      <div class="prose"><div class="eyebrow">History</div><h2 class="h3" style="margin:10px 0 16px;color:var(--ink)">From a board-run institution to a government department</h2>${HISTORY.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
      <div class="prose"><div class="eyebrow">Operations</div><h2 class="h3" style="margin:10px 0 16px;color:var(--ink)">What the museum does</h2>${OPERATIONS.map((t) => `<p>${esc(t)}</p>`).join('')}<p><a href="#/publications/zebras-voice">Read the Zebra’s Voice →</a></p></div>
    </div>
  </section>

  <section id="sec-mission">
    <div class="wrap twocol">
      <blockquote class="statement"><div class="eyebrow">Vision</div><p>${esc(VISION)}</p></blockquote>
      <blockquote class="statement"><div class="eyebrow">Mission</div><p>${esc(MISSION)}</p></blockquote>
    </div>
  </section>

  <section class="bg-mist" id="sec-divisions">
    <div class="wrap">
      <div class="sec-head"><div><div class="eyebrow">Divisions and Specialized Units</div><h2 class="h2">Five divisions, one museum</h2></div><a class="btn ghost small arrow" href="#/departments">All departments </a></div>
      <div class="cgrid five">${DEPARTMENTS.map((d) => card({ href: `#/departments/${d.key}`, img: d.cover, title: d.name })).join('')}</div>
    </div>
  </section>`;
}
