/* Fragments for the content pages: Visit & About, Departments, Explore and
   Publications. Every value is escaped -- the texts are static, but they are
   long and full of quotes and ampersands, and esc() keeps that harmless. */
import { esc } from '../core/dom.js';

/* Long-form text: [{ h, p: [], ul: [], ol: [], img, cols: [{ h, ul }], note }] */
export function blocks(list = []) {
  return list.map((s) => `<section class="tblock${s.img ? ' withpic' : ''}">
    <div class="tbody">
      ${s.h ? `<h2 class="h3">${esc(s.h)}</h2>` : ''}
      ${(s.p || []).map((t) => `<p>${esc(t)}</p>`).join('')}
      ${s.ul ? `<ul>${s.ul.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      ${s.ol ? `<ol>${s.ol.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>` : ''}
      ${s.cols ? `<div class="tcols">${s.cols.map((c) => `<div><h3 class="h4">${esc(c.h)}</h3><ul>${c.ul.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
      ${s.note ? `<p class="note"><b>Please note:</b> ${esc(s.note)}</p>` : ''}
    </div>
    ${s.img ? `<figure class="tpic"><img src="${esc(s.img)}" alt="" loading="lazy"></figure>` : ''}
  </section>`).join('');
}

/* A row of photos; each opens full size in a new tab. */
export function photos(list = [], alt = '') {
  if (!list.length) return '';
  return `<div class="photos">${list.map((p) => {
    const [src, cap] = Array.isArray(p) ? p : [p, ''];
    return `<figure><a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="${esc(cap || alt)}" loading="lazy"></a>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}</figure>`;
  }).join('')}</div>`;
}

/* Wide header image under the page head. */
export function banner(src, alt = '') {
  return src ? `<div class="banner"><img src="${esc(src)}" alt="${esc(alt)}"></div>` : '';
}

/* Image card used by every index page. */
export function card({ href, img, eyebrow = '', title, text = '', ext = false }) {
  return `<a class="ccard" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>
    <span class="pic">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : '<span class="nopic" aria-hidden="true"></span>'}</span>
    ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ''}
    <h3 class="h4">${esc(title)}</h3>
    ${text ? `<p>${esc(text)}</p>` : ''}
  </a>`;
}

export function factlist(rows = []) {
  return rows.length ? `<dl class="facts">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>` : '';
}

/* A map placeholder that ui/maps.js turns into an interactive map.
   markers: [{ pos: [lat, lng], name, href?, kind? }]. Without JavaScript or
   without a connection to the map server, the list of places with links to
   OpenStreetMap stays visible instead. */
export function mapbox(markers, { tall = false, label = 'Map' } = {}) {
  const pts = markers.filter((m) => m.pos);
  if (!pts.length) return '';
  return `<div class="mapbox${tall ? ' tall' : ''}" role="region" aria-label="${esc(label)}" data-map='${esc(JSON.stringify(pts))}'>
    <ul class="mapfallback">${pts.map((m) => `<li>${m.href ? `<a href="${esc(m.href)}">${esc(m.name)}</a>` : esc(m.name)} · <a href="${osm(m.pos)}" target="_blank" rel="noopener">open map</a></li>`).join('')}</ul>
  </div>`;
}

export const osm = ([lat, lng]) => `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`;
export const gmaps = ([lat, lng]) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/* In-page section links for long pages: [[href, label]]. */
export function subnav(links) {
  return `<nav class="subnav" aria-label="On this page"><div class="wrap">${links.map(([h, l]) => `<a href="${esc(h)}">${esc(l)}</a>`).join('')}</div></nav>`;
}
