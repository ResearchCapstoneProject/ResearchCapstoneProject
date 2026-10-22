import { pagehead } from '../ui/cards.js';
import { EXHIBITIONS } from '../data/constants.js';
import { exArtwork, pic } from '../art/registry.js';
import { $, esc } from '../core/dom.js';

export function pageExhibitions() {
  return `${pagehead([['#/', 'Home'], ['', 'Exhibitions']], 'Exhibitions', 'Special exhibitions and permanent galleries at the National Museum and Art Gallery.')}
  <div class="wrap" style="padding-block:48px 80px"><div class="objgrid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:40px 28px">
    ${EXHIBITIONS.map((e) => `<a class="excard" href="#/exhibitions"><div class="pic">${exArtwork(e)}</div><div class="eyebrow">${esc(e.kind)} · ${esc(e.dates)}</div><h3 class="h3">${esc(e.title)}</h3><p>${esc(e.text)}</p></a>`).join('')}
  </div></div>`;
}
