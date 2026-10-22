import { staffShell } from './staff-shell.js';
import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
import { dkey, fmtDate, hh } from '../core/format.js';
import { nextDays } from '../core/time.js';
import { CAPACITY } from '../data/constants.js';
import { holiday, slotHours } from '../data/opening.js';
import { onlineOcc, sampleOcc, taken } from '../state/booking.js';
import { fromKey } from '../core/format.js';
import { hoursFor } from '../data/opening.js';

export function pageStaffBookings() {
  const days = nextDays(14);
  const k = store.SB.date;
  const hours = slotHours(k);
  const sum = (fn) => hours.reduce((a, h) => a + fn(h), 0);
  const cap = hours.length * CAPACITY; const tot = sum((h) => taken(k, h)); const onl = sum((h) => onlineOcc(k, h));
  const tours = store.S.bookings.filter((b) => b.date === k).reduce((a, b) => a + b.q.tour, 0);
  const bars = hours.length ? hours.map((h) => {
    const s = sampleOcc(k, h); const o = onlineOcc(k, h); const sw = Math.min(100, (s / CAPACITY) * 100); const ow = Math.min(100 - sw, (o / CAPACITY) * 100);
    return `<div class="capbar"><b class="tnum">${hh(h)}</b><div class="bar" role="img" aria-label="${s + o} of ${CAPACITY} places booked"><i style="width:${sw}%"></i><i class="online" style="width:${ow}%"></i></div><span class="n">${Math.min(CAPACITY, s + o)} / ${CAPACITY}</span></div>`;
  }).join('') : '<p class="muted">The museum is closed on this day.</p>';
  const rows = [...store.S.bookings].sort((a, b) => b.created - a.created);
  const inner = `
    <div class="days" role="group" aria-label="Day" style="margin-bottom:24px">${days.map((d) => { const dt = fromKey(d); const closed = !hoursFor(d); return `<button type="button" class="day" data-act="sday" data-k="${d}" aria-pressed="${d === k}" ${closed ? 'disabled' : ''}><small>${dt.toLocaleDateString('en-GB', { weekday: 'short' })}</small><b>${dt.getDate()}</b><em>${closed ? 'Closed' : d === dkey(new Date()) ? 'Today' : holiday(d) ? `<span class="hol">${esc(holiday(d))}</span>` : dt.toLocaleDateString('en-GB', { month: 'short' })}</em></button>`; }).join('')}</div>
    <div class="kpis">
      <div><b>${tot}</b><span>visitors booked on ${esc(fmtDate(k, { weekday: 'short', day: 'numeric', month: 'short' }))}</span></div>
      <div><b>${cap ? Math.round((tot / cap) * 100) : 0}%</b><span>of ${cap} places filled</span></div>
      <div><b>${onl}</b><span>from your demo bookings</span></div>
      <div><b>${tours}</b><span>guided-tour participants</span></div>
    </div>
    <div class="twocol">
      <div>
        <h2 class="h3">Time slots</h2>
        <div class="legend"><span><i style="background:var(--sky)"></i>Sample bookings</span><span><i style="background:var(--deep)"></i>Booked in this demo</span></div>
        ${bars}
      </div>
      <div>
        <h2 class="h3" style="margin-bottom:14px">Online bookings</h2>
        ${rows.length ? `<div class="tablewrap"><table class="data" style="min-width:520px"><thead><tr><th>Code</th><th>Visit</th><th>Name</th><th>Visitors</th><th style="text-align:right">Entry</th></tr></thead><tbody>${rows.map((b) => `<tr><td class="inv"><b>${b.code}</b></td><td class="small">${esc(fmtDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' }))}, ${hh(b.hour)}</td><td>${esc(b.name)}</td><td class="tnum">${b.visitors}${b.q.tour ? ` <span class="chip">${b.q.tour} tour</span>` : ''}</td><td style="text-align:right">${b.checkedIn ? '<span class="chip live dot">Checked in</span>' : `<button class="btn small ghost" type="button" data-act="checkin" data-code="${b.code}">Check in</button>`}</td></tr>`).join('')}</tbody></table></div>`
          : `<div class="empty" style="text-align:left;padding:24px;border:1px dashed #AEB7BF"><p style="margin:0 0 14px">No online bookings yet. Book a time slot on the website and it appears here instantly.</p><a class="btn small" href="#/tickets">Open ticket shop</a></div>`}
      </div>
    </div>`;
  return staffShell('staff/bookings', inner);
}
