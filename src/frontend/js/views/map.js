import { pagehead } from '../ui/cards.js';
import { floorPlan } from '../ui/floorplan.js';
import { $, esc } from '../core/dom.js';
import { ROOMS } from '../data/constants.js';
import { objectsInRoom } from '../state/selectors.js';

/* ---------------- museum map page --------------------------------- */
export function pageMap() {
  return `${pagehead([['#/', 'Home'], ['', 'Museum map']], 'Museum map', 'Six galleries, the art gallery and the courtyard. Select a room to see the objects on display there.')}
  <div class="wrap" style="padding-block:32px 72px">
    <div class="planbox big">${floorPlan({ interactive: true, counts: true })}</div>
    <div class="planlist">
      ${ROOMS.map((r) => { const n = objectsInRoom(r.id).length; return `<a class="planrow" href="#/collection" data-act="room" data-id="${r.id}"><b>${esc(r.name)}</b><span class="muted small">${n ? `${n} object${n === 1 ? '' : 's'} online` : 'No objects online yet'}</span></a>`; }).join('')}
    </div>
    <p class="small muted" style="margin-top:24px">The plan is a simplified sketch for the prototype. The real layout will be drawn with the museum.</p>
  </div>`;
}
