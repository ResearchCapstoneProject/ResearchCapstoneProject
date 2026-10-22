import { eventRow, pagehead } from '../ui/cards.js';
import { EVENTS } from '../data/constants.js';

export function pageEvents() {
  return `${pagehead([['#/', 'Home'], ['', 'Events']], 'Events', 'Tours, talks and workshops for all ages.')}
  <div class="wrap" style="padding-block:40px 80px"><div class="events">${EVENTS.map(eventRow).join('')}</div></div>`;
}
