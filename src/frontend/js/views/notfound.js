import { pagehead } from '../ui/cards.js';
import { PAGE_COPY } from '../data/pagecopy.js';
import { esc } from '../core/dom.js';

export function pageNotFound() {
  return `${pagehead([['#/', 'Home'], ['', esc(PAGE_COPY.notfound.title)]], esc(PAGE_COPY.notfound.title), esc(PAGE_COPY.notfound.lede))}
  <div class="wrap" style="padding-block:32px 80px"><a class="btn" href="#/collection">Go to Collection Online</a></div>`;
}
