import { pagehead } from '../ui/cards.js';
import { card, factlist } from '../ui/content.js';
import { pageNotFound } from './notfound.js';
import { esc } from '../core/dom.js';
import { pubTypeByKey, pubTypes } from '../data/publications.js';

const cover = (t) => { const i = t.items.find((x) => x.thumb || x.poster) || {}; return i.thumb || i.poster; };

/* ---------------- #/publications ---------------- */
export function pagePublications() {
  return `${pagehead([['#/', 'Home'], ['', 'Publications']], 'Publications', 'Brochures, the Zebra’s Voice magazine and the Natural History Division’s monthly features.')}
  <div class="wrap" style="padding-block:40px 80px">
    <div class="cgrid">${pubTypes().map((t) => card({ href: `#/publications/${t.key}`, img: cover(t), eyebrow: t.eyebrow, title: t.title, text: t.lede })).join('')}</div>
  </div>`;
}

/* ---------------- #/publications/<type> ---------------- */
export function pagePubType(key) {
  const t = pubTypeByKey(key);
  if (!t) return pageNotFound();
  const head = pagehead([['#/', 'Home'], ['#/publications', 'Publications'], ['', t.title]], esc(t.title), esc(t.lede));
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

/* One Plant or Insect of the Month poster, as an article. Every item has the
   same parts -- poster, facts, text, download -- so the months look alike.
   A block is [heading, text or [paragraphs], optional list]. */
function feature(i) {
  const paras = (x) => (Array.isArray(x) ? x : x ? [x] : []).map((t) => `<p>${esc(t)}</p>`).join('');
  return `<article class="feature">
    <div class="feathead"><div class="eyebrow">${esc(i.date)}</div><h2 class="h2">${esc(i.title)}</h2></div>
    <div class="featbody">
      <figure class="featpic"><a href="${esc(i.pdf)}" target="_blank" rel="noopener"><img src="${esc(i.poster)}" alt="Poster: ${esc(i.title)}, ${esc(i.date)}" loading="lazy"></a><figcaption>The poster as published · click to open the PDF</figcaption></figure>
      <div class="prose">
        ${factlist((i.facts || []).map(([k, v]) => [k, esc(v)]))}
        ${paras(i.p)}
        ${(i.blocks || []).map(([h, x, list]) => `<h3 class="h4" style="margin:22px 0 8px">${esc(h)}</h3>${paras(x)}${list ? `<ul>${list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}`).join('')}
        <p><a class="btn ghost small" href="${esc(i.pdf)}" target="_blank" rel="noopener">Download the poster (PDF)</a></p>
      </div>
    </div>
  </article>`;
}
