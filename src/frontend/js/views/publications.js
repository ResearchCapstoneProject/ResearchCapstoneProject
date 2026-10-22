import { pagehead } from '../ui/cards.js';
import { card, factlist } from '../ui/content.js';
import { pageNotFound } from './notfound.js';
import { esc } from '../core/dom.js';
import { PUB_TYPES, pubTypeByKey } from '../data/publications.js';
import { TRAILS } from '../data/explore.js';

const cover = (t) => (t.items ? (t.items.find((i) => i.thumb) || {}).thumb : TRAILS[0].thumb);

/* ---------------- #/publications ---------------- */
export function pagePublications() {
  return `${pagehead([['#/', 'Home'], ['', 'Publications']], 'Publications', 'Brochures, the Zebra’s Voice magazine and the Natural History Division’s monthly features. Heritage trail maps are in the Explore section.')}
  <div class="wrap" style="padding-block:40px 80px">
    <div class="cgrid">${PUB_TYPES.map((t) => card({ href: t.explore || `#/publications/${t.key}`, img: cover(t), eyebrow: t.eyebrow, title: t.title, text: t.lede })).join('')}</div>
  </div>`;
}

/* ---------------- #/publications/<type> ---------------- */
export function pagePubType(key) {
  const t = pubTypeByKey(key);
  if (!t) return pageNotFound();
  const head = pagehead([['#/', 'Home'], ['#/publications', 'Publications'], ['', t.title]], esc(t.title), esc(t.lede));
  if (t.explore) {
    return `${head}
    <div class="wrap" style="padding-block:40px 80px">
      <div class="callout"><div><div class="eyebrow">Moved to Explore</div><h2 class="h3" style="margin:8px 0 6px">Trips and heritage trails</h2><p>Each trail has its own page with the downloadable map, an interactive map and the monuments and museums along the way.</p></div><a class="btn arrow" href="${t.explore}">Go to Explore </a></div>
      <div class="cgrid" style="margin-top:36px">${TRAILS.map((x) => card({ href: `#/explore/trails/${x.id}`, img: x.thumb, eyebrow: 'Trail map', title: x.name })).join('')}</div>
    </div>`;
  }
  if (t.key === 'plant-of-the-month' || t.key === 'insect-of-the-month') {
    return `${head}<div class="wrap" style="padding-block:24px 80px">${t.items.map(feature).join('')}</div>`;
  }
  return `${head}
  <div class="wrap" style="padding-block:40px 80px">
    <div class="pubgrid">${t.items.map((i) => `<div class="pubitem">
      <a href="${esc(i.pdf)}" target="_blank" rel="noopener" class="pubcover"><img src="${esc(i.thumb)}" alt="Cover: ${esc(i.title)}" loading="lazy"></a>
      <div class="eyebrow">${esc(i.date)}</div>
      <h3 class="h4">${esc(i.title)}</h3>
      <p class="small"><a href="${esc(i.pdf)}" target="_blank" rel="noopener">Download PDF</a>${i.href ? ` · <a href="${esc(i.href)}">About the place</a>` : ''}</p>
    </div>`).join('')}</div>
  </div>`;
}

/* One Plant or Insect of the Month poster, as an article. */
function feature(i) {
  const pic = i.thumb ? `<figure class="featpic"><a href="${esc(i.full || i.thumb)}" target="_blank" rel="noopener"><img src="${esc(i.thumb)}" alt="${esc(i.cap || i.title)}" loading="lazy"></a>${i.cap ? `<figcaption>${esc(i.cap)}</figcaption>` : ''}</figure>` : '';
  return `<article class="feature">
    <div class="feathead"><div class="eyebrow">${esc(i.date)}</div><h2 class="h2">${esc(i.title)}</h2></div>
    <div class="featbody${pic ? '' : ' nopic'}">
      ${pic}
      <div class="prose">
        ${factlist((i.facts || []).map(([k, v]) => [k, esc(v)]))}
        ${(i.p || []).map((x) => `<p>${esc(x)}</p>`).join('')}
        ${(i.blocks || []).map(([h, x, list]) => `<h3 class="h4" style="margin:22px 0 8px">${esc(h)}</h3>${x ? `<p>${esc(x)}</p>` : ''}${list ? `<ul>${list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}`).join('')}
        <p><a class="btn ghost small" href="${esc(i.pdf)}" target="_blank" rel="noopener">Download the poster (PDF)</a></p>
      </div>
    </div>
  </article>`;
}
