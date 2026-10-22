import { pagehead } from '../ui/cards.js';
import { banner, blocks, card, designationBadges, factlist, gmaps, mapbox, osm, photos } from '../ui/content.js';
import { locator } from '../art/locator.js';
import { pageNotFound } from './notfound.js';
import { esc } from '../core/dom.js';
import {
  MUSEUMS_TEXT, SECTIONS, SITES, TRAILS, hasPage, sectionByKey, siteById, siteHref, sitesIn, trailById,
} from '../data/explore.js';

const marker = (s) => ({ pos: s.pos, name: s.name, href: hasPage(s) ? siteHref(s) : null, kind: s.section });
const trailMarker = (t) => ({ pos: t.pos, name: t.name, href: `#/explore/trails/${t.id}`, kind: 'trails' });
const APPROX = '<p class="small muted mapnote">Map positions are approximate unless the text gives coordinates. Check directions locally before you travel.</p>';

const siteCard = (s) => card({
  href: hasPage(s) ? siteHref(s) : gmaps(s.pos), ext: !hasPage(s),
  img: s.card, art: s.card ? '' : locator(s.pos, s.name), eyebrow: s.designation || s.place, title: s.name, text: s.designation ? s.place : '',
});
const trailCard = (t) => card({ href: `#/explore/trails/${t.id}`, img: t.photo, focus: t.focus, eyebrow: t.region, title: t.name });

/* ---------------- #/explore ---------------- */
export function pageExplore() {
  const all = SITES.filter((s) => s.section !== 'herbarium');
  return `${pagehead([['#/', 'Home'], ['', 'Explore']], 'Explore', 'Botswana’s heritage beyond the museum building: national monuments, other museums, the National Botanical Garden and Herbarium, World Heritage Sites and the heritage trails that connect them.')}
  <div class="wrap" style="padding-block:32px 72px">
    ${mapbox([...all.map(marker), ...TRAILS.map(trailMarker)], { tall: true, label: 'Map of heritage places in Botswana' })}
    <p class="small muted maplegend"><span class="dot blue"></span>Monuments and sites <span class="dot orange"></span>Museums and trails <span class="dot dark"></span>Botanical Garden &amp; Herbarium</p>
    <div class="cgrid three" style="margin-top:40px">${SECTIONS.map((s) => card({ href: `#/explore/${s.key}`, img: s.cover, eyebrow: s.eyebrow, title: s.title, text: s.lede })).join('')}</div>
  </div>`;
}

/* ---------------- #/explore/<section>[/<id>] ---------------- */
export function pageExploreRoute(key, id) {
  const sec = sectionByKey(key);
  if (!sec) return pageNotFound();
  if (key === 'trails') return id ? pageTrail(id) : pageTrails();
  if (sec.single) return pageSite(siteById(sec.single), sec);
  if (id) {
    const s = siteById(id);
    if (!s || !hasPage(s) || !(s.section === key || (s.also || []).includes(key))) return pageNotFound();
    return pageSite(s, sec);
  }
  if (key === 'museums') return pageMuseums(sec);
  const list = sitesIn(key);
  return `${pagehead([['#/', 'Home'], ['#/explore', 'Explore'], ['', sec.title]], esc(sec.title), esc(sec.lede))}
  <div class="wrap" style="padding-block:32px 72px">
    ${mapbox(list.map(marker), { label: `Map: ${sec.title}` })}${APPROX}
    <div class="cgrid" style="margin-top:36px">${list.map(siteCard).join('')}</div>
  </div>`;
}

function pageMuseums(sec) {
  const list = sitesIn('museums');
  const byId = (i) => list.find((s) => s.id === i);
  const item = ([i, label]) => { const s = byId(i); return `<li>${s && hasPage(s) ? `<a href="${siteHref(s)}">${esc(label)}</a>` : esc(label)}</li>`; };
  return `${pagehead([['#/', 'Home'], ['#/explore', 'Explore'], ['', sec.title]], esc(sec.title), esc(sec.lede))}
  <div class="wrap" style="padding-block:32px 72px">
    ${mapbox(list.map(marker), { label: 'Map of museums' })}${APPROX}
    <div class="twocol" style="margin-top:40px">
      <div class="prose">
        <h2 class="h3">Regional Museums</h2>
        ${MUSEUMS_TEXT.regional.map((t) => `<p>${esc(t)}</p>`).join('')}
        <ul>${MUSEUMS_TEXT.regionalList.map(item).join('')}</ul>
        <p>${esc(MUSEUMS_TEXT.regionalAfter)}</p>
      </div>
      <div class="prose">
        <h2 class="h3">Institutional/Specialized Museums:</h2>
        <p>${esc(MUSEUMS_TEXT.institutional)}</p>
        <ul>${MUSEUMS_TEXT.institutionalList.map(item).join('')}</ul>
      </div>
    </div>
    <h2 class="h3" style="margin:48px 0 20px">All museums and heritage houses</h2>
    <div class="cgrid">${list.map(siteCard).join('')}</div>
  </div>`;
}

function pageSite(s, sec) {
  if (!s) return pageNotFound();
  const crumbs = sec.single ? [['#/', 'Home'], ['#/explore', 'Explore'], ['', s.name]] : [['#/', 'Home'], ['#/explore', 'Explore'], [`#/explore/${sec.key}`, sec.title], ['', s.name]];
  const trails = TRAILS.filter((t) => (t.sites || []).includes(s.id));
  const facts = [
    ...(s.designation ? [['Designation', esc(s.designation)]] : []),
    ['Location', esc(s.place)],
    ...(s.facts || []).map(([k, v]) => [k, esc(v)]),
    ['Directions', `<a href="${gmaps(s.pos)}" target="_blank" rel="noopener">Google Maps</a> · <a href="${osm(s.pos)}" target="_blank" rel="noopener">OpenStreetMap</a>`],
    ...(s.brochure ? [['Brochure', `<a href="${esc(s.brochure)}" target="_blank" rel="noopener">Download the PDF</a>`]] : []),
    ...(trails.length ? [['Heritage trail', trails.map((t) => `<a href="#/explore/trails/${t.id}">${esc(t.name)}</a>`).join('<br>')]] : []),
  ];
  return `${pagehead(crumbs, esc(s.name), esc(s.place))}
  ${banner(s.cover, s.name)}
  <div class="wrap sitepage">
    <aside class="siteside">
      ${designationBadges(s.designation)}
      <figure class="sitelocator">${locator(s.pos, s.name)}<figcaption class="small muted">Where in Botswana<br><span class="eyebrow">Schematic map</span></figcaption></figure>
      ${factlist(facts)}
      ${mapbox([marker(s)], { label: `Map: ${s.name}` })}
      ${s.exact ? '' : '<p class="small muted mapnote">Approximate position.</p>'}
    </aside>
    <div class="sitemain">
      ${photos(s.photos, s.name)}
      <div class="textblocks">${blocks(s.sections)}</div>
    </div>
  </div>`;
}

/* ---------------- heritage trails ---------------- */
function pageTrails() {
  const sec = sectionByKey('trails');
  return `${pagehead([['#/', 'Home'], ['#/explore', 'Explore'], ['', sec.title]], esc(sec.title), esc(sec.lede))}
  <div class="wrap" style="padding-block:32px 72px">
    ${mapbox(TRAILS.flatMap((t) => [trailMarker(t), ...(t.extra || []).map(([n, pos]) => ({ pos, name: `${t.name} · ${n}`, href: `#/explore/trails/${t.id}`, kind: 'trails' }))]), { label: 'Map of heritage trails' })}
    <div class="cgrid" style="margin-top:36px">${TRAILS.map(trailCard).join('')}</div>
  </div>`;
}

function pageTrail(id) {
  const t = trailById(id);
  if (!t) return pageNotFound();
  const sites = (t.sites || []).map(siteById).filter(Boolean);
  const pts = [{ ...trailMarker(t), href: null }, ...(t.extra || []).map(([n, pos]) => ({ pos, name: n, kind: 'trails' })), ...sites.map(marker)];
  return `${pagehead([['#/', 'Home'], ['#/explore', 'Explore'], ['#/explore/trails', 'Heritage trails'], ['', t.name]], esc(t.name), esc(t.region))}
  <div class="wrap sitepage" style="padding-top:36px">
    <aside class="siteside">
      <a class="trailpdf" href="${esc(t.pdf)}" target="_blank" rel="noopener"><img src="${esc(t.thumb)}" alt="Cover of the ${esc(t.name)} map"><span class="btn small">Download the trail map (PDF)</span></a>
      <p class="small"><a href="${esc(t.map)}" target="_blank" rel="noopener">Open the online trail map →</a></p>
      ${mapbox(pts, { label: `Map: ${t.name}` })}
      <p class="small muted mapnote">Approximate positions.</p>
    </aside>
    <div class="sitemain">
      <figure class="trailphoto"><img src="${esc(t.photo)}" alt=""></figure>
      <div class="textblocks prose">${t.p.map((x) => `<p>${esc(x)}</p>`).join('')}</div>
      ${sites.length ? `<h2 class="h3" style="margin:32px 0 18px">Places on this trail</h2><div class="cgrid">${sites.map(siteCard).join('')}</div>` : ''}
    </div>
  </div>`;
}

/* Home page teaser. */
export const trailCards = () => TRAILS.map(trailCard).join('');
