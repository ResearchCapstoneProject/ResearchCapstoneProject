import { pagehead } from '../ui/cards.js';
import { pageNotFound } from './notfound.js';
import { esc } from '../core/dom.js';
import { PAGES } from '../data/constants.js';
import { $ } from '../core/dom.js';

export function pagePlaceholder(key) {
  const p = PAGES[key];
  if (!p) return pageNotFound();
  return `${pagehead([['#/', 'Home'], ['', p.t]], esc(p.t), esc(p.l))}
  <div class="wrap placeholder">
    <div><span class="chip ${p.chip.startsWith('Planned') ? 'plan' : 'dev'}">${esc(p.chip)}</span><h2 class="h3" style="margin:16px 0 14px">What this page will contain</h2><ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
    <div><p class="prose">This page is being prepared together with the museum and will be published in a later version of the website.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#/">Back to home</a><a class="btn ghost" href="#/collection">Collection Online</a></div></div>
  </div>`;
}
