import { floorPlan } from './floorplan.js';
import { esc } from '../core/dom.js';
import { roomOf, tourStops } from '../state/selectors.js';

/* ---------------- themed tours ------------------------------------ */
export function tourPlan(t) {
  const stops = tourStops(t).map((o, i) => ({ room: roomOf(o.location) }));
  const seen = {};
  const spread = stops.map((s) => { const k = s.room || 'x'; seen[k] = (seen[k] || 0) + 1; return { room: s.room, offset: (seen[k] - 1) * 30 - 0 }; });
  return floorPlan({ stops: spread });
}
export function tourCard(t) {
  return `<a class="tourcard" href="#/tour/${t.id}">
    <div class="planbox">${tourPlan(t)}</div>
    <div class="eyebrow">${t.mins} minutes · ${tourStops(t).length} stops</div>
    <h3 class="h3">${esc(t.title)}</h3>
    <p>${esc(t.sub)}</p>
  </a>`;
}
