import { pagehead } from '../ui/cards.js';

export function pageNotFound() {
  return `${pagehead([['#/', 'Home'], ['', 'Not found']], 'Page not found', 'This object or page does not exist (anymore). Try the collection search.')}
  <div class="wrap" style="padding-block:32px 80px"><a class="btn" href="#/collection">Go to Collection Online</a></div>`;
}
