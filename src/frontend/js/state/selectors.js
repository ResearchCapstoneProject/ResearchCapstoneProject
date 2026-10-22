/* Read-only derivations over store.S. */
import { DEPTS, LOC_ROOM, ROOMS, TOURS } from '../data/constants.js';
import { getPublicBaseUrl } from '../core/config.js';
import { store } from './store.js';

export function roomOf(location) { return LOC_ROOM[location] || null; }
export function roomById(id) { return ROOMS.find((r) => r.id === id) || null; }
export function objectsInRoom(id) { return published().filter((o) => roomOf(o.location) === id); }
export const tourById = (id) => TOURS.find((t) => t.id === id) || null;
export const tourStops = (t) => t.stops.map((id) => byId(id)).filter((o) => o && o.status === 'published');
export function toursOf(objId) { return TOURS.filter((t) => t.stops.includes(objId)); }
export const byId = (id) => store.S.objects.find((o) => o.id === id);
export const published = () => store.S.objects.filter((o) => o.status === 'published');
export const deptCode = (dept) => (DEPTS.find((d) => d.key === dept) || { code: 'OBJ' }).code;
export function objectURL(id) {
  /* The origin printed onto gallery labels. Served by GET /api/config as
     PUBLIC_BASE_URL, so on pilot day the museum sets it once and every
     new label follows -- rather than baking in whatever host happened to
     render the page. */
  return `${getPublicBaseUrl()}#/object/${id}`;
}
