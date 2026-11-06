/* Ticket wizard state and slot occupancy. */
import { CAPACITY, TICKETS } from '../data/constants.js';
import { store } from './store.js';

/* How full a slot is.

   Online this is the server's count over every confirmed booking, fetched
   once by repo.refreshAvailability() and kept in store.AV, because a visitor
   is shown places that other visitors have already taken. Offline there is
   nobody else: the only bookings that exist are the ones this browser made,
   and localOcc counts those. The prototype used a hash of the date here, so
   the ticket page looked busy during a presentation; nothing invents a
   number any more. */
export const slotKey = (k, h, m = 0) => `${k}@${h}:${m}`;
export const serverOcc = (k, h, m = 0) => (store.AV || {})[slotKey(k, h, m)] || 0;
export const localOcc = (k, h, m = 0) => store.S.bookings
  .filter((b) => b.date === k && b.hour === h && (b.min || 0) === m)
  .reduce((a, b) => a + b.visitors, 0);
export const taken = (k, h, m = 0) => Math.min(
  CAPACITY,
  store.api && store.api.mode === 'online' ? serverOcc(k, h, m) : localOcc(k, h, m),
);

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
