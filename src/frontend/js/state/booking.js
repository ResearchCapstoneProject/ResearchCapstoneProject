/* Ticket wizard state and slot occupancy. */
import { fromKey } from '../core/format.js';
import { h32 } from '../core/hash.js';
import { CAPACITY, TICKETS } from '../data/constants.js';
import { store } from './store.js';

export function sampleOcc(k, h) {
  const x = h32(`${k}@${h}`); const wd = fromKey(k).getDay();
  let n = (x % 24) + (wd === 0 || wd === 6 ? 10 : 2) + (h === 11 || h === 14 ? 6 : 0);
  if (x % 17 === 0) n = CAPACITY;
  return Math.min(CAPACITY, n);
}
export const onlineOcc = (k, h) => store.S.bookings.filter((b) => b.date === k && b.hour === h).reduce((a, b) => a + b.visitors, 0);
export const taken = (k, h) => Math.min(CAPACITY, sampleOcc(k, h) + onlineOcc(k, h));
export const newT = () => ({ step: 1, date: null, hour: null, q: { res: 0, child: 0, intl: 0, tour: 0 }, name: '', email: '', phone: '', country: 'Botswana', pay: 'desk', agree: false, done: null, err: {} });
export const visitorsOf = (q) => q.res + q.child + q.intl;
export const totalOf = (q) => TICKETS.reduce((a, t) => a + t.price * q[t.key], 0);
export const leftIn = (k, h) => CAPACITY - taken(k, h);
