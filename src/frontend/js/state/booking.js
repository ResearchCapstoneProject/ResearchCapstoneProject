/* Ticket wizard state and slot occupancy. */
import { fromKey } from '../core/format.js';
import { h32 } from '../core/hash.js';
import { CAPACITY, TICKETS } from '../data/constants.js';
import { store } from './store.js';

export function sampleOcc(k, h, m = 0) {
  const x = h32(`${k}@${h}:${m}`); const wd = fromKey(k).getDay();
  let n = (x % 24) + (wd === 0 || wd === 6 ? 10 : 2) + (h === 11 || h === 14 ? 6 : 0);
  if (x % 17 === 0) n = CAPACITY;
  return Math.min(CAPACITY, n);
}
export const onlineOcc = (k, h, m = 0) => store.S.bookings
  .filter((b) => b.date === k && b.hour === h && (b.min || 0) === m)
  .reduce((a, b) => a + b.visitors, 0);
export const taken = (k, h, m = 0) => Math.min(CAPACITY, sampleOcc(k, h, m) + onlineOcc(k, h, m));

/* Quantities are keyed by whatever groups the museum has defined, so a group
   added in the staff area needs no change here. */
export const emptyQ = () => Object.fromEntries(TICKETS.map((t) => [t.key, 0]));
/* `eventId` is set when the visitor came from an event's Book button; the
   ticket page then says which event they are booking for and the booking
   carries it to the front desk. */
export const newT = () => ({ step: 1, date: null, hour: null, min: 0, q: emptyQ(), name: '', email: '', phone: '', country: 'Botswana', pay: 'desk', agree: false, done: null, err: {}, eventId: null, busy: false });
/* Add-ons (a guided tour, say) accompany a visitor rather than being one. */
export const visitorsOf = (q) => TICKETS.filter((t) => !t.addon).reduce((a, t) => a + (q[t.key] || 0), 0);
export const addonsOf = (q) => TICKETS.filter((t) => t.addon).reduce((a, t) => a + (q[t.key] || 0), 0);
export const totalOf = (q) => TICKETS.reduce((a, t) => a + t.price * (q[t.key] || 0), 0);
export const leftIn = (k, h, m = 0) => CAPACITY - taken(k, h, m);
