import { pagehead } from '../ui/cards.js';
import { banner, blocks, card, photos } from '../ui/content.js';
import { pageNotFound } from './notfound.js';
import { esc } from '../core/dom.js';
import { CRAFTS, DEPARTMENTS, DEPT_INTRO, craftByKey, deptByKey } from '../data/departments.js';

const firstSentence = (t) => t.split(/(?<=\.)\s/)[0];

/* ---------------- #/departments ---------------- */
export function pageDepartments() {
  return `${pagehead([['#/', 'Home'], ['', 'Departments']], 'Departments', esc(DEPT_INTRO))}
  <div class="wrap" style="padding-block:40px 80px">
    <div class="cgrid">${DEPARTMENTS.map((d) => card({ href: `#/departments/${d.key}`, img: d.cover, eyebrow: 'Division', title: d.name, text: firstSentence(d.lede) })).join('')}</div>
  </div>`;
}

/* ---------------- #/departments/<key>[/<craft>] ---------------- */
export function pageDepartment(key, sub) {
  const d = deptByKey(key);
  if (!d) return pageNotFound();
  if (sub) return key === 'ethnology' ? pageCraft(d, sub) : pageNotFound();
  return `${pagehead([['#/', 'Home'], ['#/departments', 'Departments'], ['', d.short]], esc(d.name))}
  ${banner(d.cover, d.name)}
  <div class="wrap deptpage">
    <div class="prose">
      <p class="lede" style="margin-top:0">${esc(d.lede)}</p>
      <h2 class="h3" style="margin:32px 0 14px">${esc(d.unitsLabel)}</h2>
      <ul class="units">${d.units.map(([n, t]) => `<li><b>${esc(n)}:</b> ${esc(t)}</li>`).join('')}</ul>
    </div>
    <aside class="deptside">
      <h2 class="eyebrow" style="margin-bottom:12px">Related</h2>
      <ul class="linklist">${d.links.map(([h, l]) => `<li><a href="${esc(h)}">${esc(l)}</a></li>`).join('')}</ul>
      ${DEPARTMENTS.filter((x) => x.key !== d.key).length ? `<h2 class="eyebrow" style="margin:28px 0 12px">Other divisions</h2><ul class="linklist">${DEPARTMENTS.filter((x) => x.key !== d.key).map((x) => `<li><a href="#/departments/${x.key}">${esc(x.name)}</a></li>`).join('')}</ul>` : ''}
    </aside>
  </div>
  ${d.photos.length ? `<div class="wrap" style="padding-bottom:24px">${photos(d.photos)}</div>` : ''}
  ${d.key === 'ethnology' ? `<section class="bg-mist"><div class="wrap">
    <div class="sec-head"><div><div class="eyebrow">Material culture</div><h2 class="h2">Traditional crafts</h2></div></div>
    <div class="cgrid">${CRAFTS.map((c) => card({ href: `#/departments/ethnology/${c.key}`, img: `${c.dir}/${c.photos[0]}`, title: c.title, text: firstSentence(c.sections[0].p[0]) })).join('')}</div>
  </div></section>` : ''}
  ${d.poster ? `<section class="bg-mist"><div class="wrap poster">
    <a href="${esc(d.poster.full)}" target="_blank" rel="noopener"><img src="${esc(d.poster.src)}" alt="Poster: ${esc(d.poster.title)}" loading="lazy"></a>
    <div><div class="eyebrow">Geology unit</div><h2 class="h2" style="margin:10px 0 14px">${esc(d.poster.title)}</h2><p class="lede">${esc(d.poster.text)}</p><a class="btn ghost small" href="${esc(d.poster.full)}" target="_blank" rel="noopener">View the poster</a></div>
  </div></section>` : ''}`;
}

function pageCraft(d, key) {
  const c = craftByKey(key);
  if (!c) return pageNotFound();
  const secs = c.sections.map((s) => ({ ...s, img: undefined }));
  return `${pagehead([['#/', 'Home'], ['#/departments', 'Departments'], ['#/departments/ethnology', d.short], ['', c.title]], esc(c.title), 'Traditional crafts documented by the Ethnology Division.')}
  <div class="wrap" style="padding-block:32px 72px">
    ${photos(c.photos.map((f) => `${c.dir}/${f}`), c.title)}
    <div class="textblocks">${blocks(secs)}</div>
    ${c.sections.filter((s) => s.photos).map((s) => photos(s.photos.map((f) => `${c.dir}/${f}`), s.h)).join('')}
    <p style="margin-top:36px"><a class="btn ghost small" href="#/departments/ethnology">← Ethnology Division</a></p>
  </div>`;
}
