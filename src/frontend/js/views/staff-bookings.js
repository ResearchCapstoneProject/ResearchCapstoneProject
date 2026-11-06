import { staffShell } from './staff-shell.js';
import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
import { dkey, fmtDate, hh } from '../core/format.js';
import { nextDays } from '../core/time.js';
import { CAPACITY, DEMO_MODE } from '../data/constants.js';
import { holiday, slotEnd, slotLabel, slotStarts } from '../data/opening.js';
import { addonsOf, onlineOcc, sampleOcc, taken } from '../state/booking.js';
import { fromKey } from '../core/format.js';
import { hoursFor } from '../data/opening.js';

/* Deleting a booking is an administrator's job: it is the answer to "please
   remove my data", not something to do while checking visitors in. */
const canDelete = () => !!(store.api.user && store.api.user.role === 'admin');

export function pageStaffBookings() {
  const days = nextDays(14);
  const k = store.SB.date;
  const starts = slotStarts(k);
  const sum = (fn) => starts.reduce((a, { h, m }) => a + fn(h, m), 0);
  const cap = starts.length * CAPACITY; const tot = sum((h, m) => taken(k, h, m)); const onl = sum((h, m) => onlineOcc(k, h, m));
  const tours = store.S.bookings.filter((b) => b.date === k).reduce((a, b) => a + addonsOf(b.q), 0);
  const bars = starts.length ? starts.map(({ h, m }) => {
    const s = sampleOcc(k, h, m); const o = onlineOcc(k, h, m); const sw = Math.min(100, (s / CAPACITY) * 100); const ow = Math.min(100 - sw, (o / CAPACITY) * 100);
    return `<div class="capbar"><b class="tnum">${slotLabel(h, m)}</b><div class="bar" role="img" aria-label="${s + o} of ${CAPACITY} places booked"><i style="width:${sw}%"></i><i class="online" style="width:${ow}%"></i></div><span class="n">${Math.min(CAPACITY, s + o)} / ${CAPACITY}</span></div>`;
  }).join('') : '<p class="muted">The museum is closed on this day.</p>';
  const rows = [...store.S.bookings].sort((a, b) => b.created - a.created);
  const inner = `
    <div class="days" role="group" aria-label="Day" style="margin-bottom:24px">${days.map((d) => { const dt = fromKey(d); const closed = !hoursFor(d); return `<button type="button" class="day" data-act="sday" data-k="${d}" aria-pressed="${d === k}" ${closed ? 'disabled' : ''}><small>${dt.toLocaleDateString('en-GB', { weekday: 'short' })}</small><b>${dt.getDate()}</b><em>${closed ? 'Closed' : d === dkey(new Date()) ? 'Today' : holiday(d) ? `<span class="hol">${esc(holiday(d))}</span>` : dt.toLocaleDateString('en-GB', { month: 'short' })}</em></button>`; }).join('')}</div>
    <div class="kpis">
      <div><b>${tot}</b><span>visitors booked on ${esc(fmtDate(k, { weekday: 'short', day: 'numeric', month: 'short' }))}</span></div>
      <div><b>${cap ? Math.round((tot / cap) * 100) : 0}%</b><span>of ${cap} places filled</span></div>
      <div><b>${onl}</b><span>${DEMO_MODE ? 'from your demo bookings' : 'booked online'}</span></div>
      <div><b>${tours}</b><span>guided-tour participants</span></div>
    </div>
    <div class="twocol">
      <div>
        <h2 class="h3">Time slots <span class="muted small" style="font-weight:400">· <a href="#/staff/settings">change length</a></span></h2>
        <div class="legend">${DEMO_MODE
    ? '<span><i style="background:var(--sky)"></i>Sample bookings</span><span><i style="background:var(--deep)"></i>Booked in this demo</span>'
    : '<span><i style="background:var(--deep)"></i>Booked places</span>'}</div>
        ${bars}
      </div>
      <div>
        <h2 class="h3" style="margin-bottom:14px">Online bookings</h2>
        ${rows.length ? `<div class="tablewrap"><table class="data" style="min-width:520px"><thead><tr><th>Code</th><th>Visit</th><th>Name</th><th>Visitors</th><th style="text-align:right">Entry</th></tr></thead><tbody>${rows.map((b) => `<tr><td class="inv"><b>${b.code}</b></td><td class="small">${esc(fmtDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' }))}, ${slotLabel(b.hour, b.min || 0)}–${slotEnd(b.hour, b.min || 0)}</td><td>${esc(b.name)}${b.eventTitle ? `<div class="small muted">for ${esc(b.eventTitle)}</div>` : ''}</td><td class="tnum">${b.visitors}${addonsOf(b.q) ? ` <span class="chip">${addonsOf(b.q)} add-on</span>` : ''}</td><td style="text-align:right">${b.checkedIn ? '<span class="chip live dot">Checked in</span>' : `<button class="btn small ghost" type="button" data-act="checkin" data-code="${b.code}">Check in</button>`}${canDelete() ? `<button class="btn link" type="button" data-act="bk-del" data-code="${b.code}" style="color:var(--full);margin-left:10px">Delete</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`
          : `<div class="empty" style="text-align:left;padding:24px;border:1px dashed #AEB7BF"><p style="margin:0 0 14px">No online bookings yet. Book a time slot on the website and it appears here instantly.</p><a class="btn small" href="#/tickets">Open ticket shop</a></div>`}
      </div>
    </div>`;
  return staffShell('staff/bookings', inner);
}
