import { $, esc } from '../core/dom.js';
import { ROOMS } from '../data/constants.js';
import { objectsInRoom, roomById } from '../state/selectors.js';
/* The museum floor plan, as one inline SVG. Shared by the map page, the
   object page mini-plan and the tour route plans. */

/* ------------------------------------------------------------------
   Added features: image gallery per object, museum floor plan,
   themed tours, scan statistics for staff.
------------------------------------------------------------------- */
/* ---------------- museum floor plan ------------------------------- */

export function floorPlan({ highlight = null, stops = [], interactive = false, counts = false } = {}) {
  const rooms = ROOMS.map((r) => {
    const on = r.id === highlight;
    const cls = `room ${r.kind || 'gallery'}${on ? ' on' : ''}`;
    const n = counts ? objectsInRoom(r.id).length : null;
    const label = r.name.replace(' · ', ' · ');
    const lines = label.split(' · ');
    const tag = interactive ? 'a' : 'g';
    const attrs = interactive ? ` href="#/collection" data-act="room" data-id="${r.id}" role="link" tabindex="0" aria-label="${esc(r.name)}${n !== null ? `, ${n} objects` : ''}"` : '';
    return `<${tag} class="${cls}"${attrs}>
      <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="3"/>
      <text class="rname" x="${r.x + r.w / 2}" y="${r.y + 26}" text-anchor="middle">${esc(lines[0])}</text>
      ${lines[1] ? `<text class="rsub" x="${r.x + r.w / 2}" y="${r.y + 44}" text-anchor="middle">${esc(lines[1])}</text>` : ''}
      ${r.sub ? `<text class="rsub" x="${r.x + r.w / 2}" y="${r.y + (lines[1] ? 62 : 44)}" text-anchor="middle">${esc(r.sub)}</text>` : ''}
      ${n !== null && n > 0 ? `<text class="rcount" x="${r.x + r.w / 2}" y="${r.y + r.h - 14}" text-anchor="middle">${n} object${n === 1 ? '' : 's'}</text>` : ''}
    </${tag}>`;
  }).join('');
  const pins = stops.map((s, i) => {
    const r = roomById(s.room); if (!r) return '';
    const off = (s.offset || 0);
    return `<g class="stop"><circle cx="${r.x + r.w / 2 + off}" cy="${r.y + r.h - 34}" r="14"/><text x="${r.x + r.w / 2 + off}" y="${r.y + r.h - 29}" text-anchor="middle">${i + 1}</text></g>`;
  }).join('');
  return `<svg class="plan" viewBox="0 0 700 440" role="img" aria-label="Floor plan of the museum${highlight ? `, ${esc((roomById(highlight) || {}).name || '')} highlighted` : ''}">
    <rect class="shell" x="24" y="24" width="552" height="392" rx="4"/>
    ${rooms}
    <g class="entrance"><rect x="286" y="412" width="48" height="8"/><polygon points="310,398 298,414 322,414"/><text x="310" y="436" text-anchor="middle" class="rsub">Entrance</text></g>
    ${pins}
  </svg>`;
}
