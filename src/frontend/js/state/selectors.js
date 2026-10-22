/* Read-only derivations over store.S. */
import { DEPTS, LOC_ROOM, ROOMS } from '../data/constants.js';
import { getPublicBaseUrl } from '../core/config.js';
import { store } from './store.js';

export function roomOf(location) { return LOC_ROOM[location] || null; }
export function roomById(id) { return ROOMS.find((r) => r.id === id) || null; }
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
