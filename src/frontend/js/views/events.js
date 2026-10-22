import { eventRow, pagehead } from '../ui/cards.js';
import { EVENTS } from '../data/constants.js';
import { dkey } from '../core/format.js';

/* Split on today's date, so an event moves to "Past events" by itself. */
export function splitEvents() {
  const today = dkey(new Date());
  const sorted = [...EVENTS].sort((a, b) => a.d.localeCompare(b.d));
  return { upcoming: sorted.filter((e) => e.d >= today), past: sorted.filter((e) => e.d < today).reverse() };
}

export function pageEvents() {
  const { upcoming, past } = splitEvents();
  return `${pagehead([['#/', 'Home'], ['', 'Events']], 'Events', 'Talks, tours, workshops and community events for all ages.')}
  <div class="wrap" style="padding-block:40px 32px">
    <h2 class="h3" style="margin-bottom:16px">Upcoming events</h2>
    ${upcoming.length ? `<div class="events">${upcoming.map((e) => eventRow(e)).join('')}</div>` : '<p class="muted">No upcoming events are listed at the moment.</p>'}
  </div>
  <div class="wrap" style="padding-block:32px 80px">
    <h2 class="h3" style="margin-bottom:16px">Past events</h2>
    <div class="events">${past.map((e) => eventRow(e, true)).join('')}</div>
  </div>`;
}
