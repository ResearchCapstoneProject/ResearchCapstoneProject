/* One ticket, opened from the link in the confirmation e-mail.

   The code is the whole key: GET /api/bookings/<code> answers with the
   ticket and not with the visitor's record -- no e-mail address, no phone
   number -- because anyone holding the link can open it. That is the same
   arrangement as a flight reference, and it is what lets the museum send a
   link at all. */
import { pagehead } from '../ui/cards.js';
import { $, esc } from '../core/dom.js';
import { fmtDate, money } from '../core/format.js';
import { qrSVG } from '../core/qr.js';
import { TICKETS } from '../data/constants.js';
import { slotEnd, slotLabel } from '../data/opening.js';
import * as repo from '../data/repo.js';

const state = { code: null, ticket: null, error: '', loading: false };

export function pageTicket(code) {
  const head = pagehead([['#/', 'Home'], ['#/tickets', 'Tickets'], ['', 'Your ticket']],
    'Your ticket');
  const b = state.ticket;

  if (state.loading || (!b && !state.error)) {
    return `${head}<div class="wrap" style="padding-block:40px 80px"><p class="muted">Looking up ${esc(code || '')}…</p></div>`;
  }
  if (!b) {
    return `${head}<div class="wrap" style="padding-block:40px 80px">
      <div class="placeholder"><p class="lede">${esc(state.error || 'No booking with that code.')}</p>
      <p>Check the code in your confirmation, or ask at the front desk — they can find a booking by name.</p>
      <p><a class="btn primary" href="#/tickets">Book a visit</a></p></div></div>`;
  }

  const lines = TICKETS.filter((t) => b.q && b.q[t.key])
    .map((t) => `${b.q[t.key]} × ${esc(t.name)}`).join('<br>') || `${b.visitors} visitors`;
  return `${head}
  <div class="wrap" style="padding-block:40px 80px">
    <div class="eticket">
      <div class="l">
        <div class="flagrule" aria-hidden="true"></div>
        <div><div class="eyebrow">Botswana National Museum · E-ticket</div>
          <div class="h3" style="margin-top:6px">${esc(fmtDate(b.date))}</div></div>
        <dl>
          <dt>Entry</dt><dd>${slotLabel(b.hour, b.minute || 0)} – ${slotEnd(b.hour, b.minute || 0)}</dd>
          ${b.eventTitle ? `<dt>Event</dt><dd>${esc(b.eventTitle)}</dd>` : ''}
          <dt>Visitors</dt><dd>${lines}</dd>
          <dt>Name</dt><dd>${esc(b.name)}</dd>
          <dt>Total</dt><dd>${b.totalThebe ? `${money(b.totalThebe)} · pay on arrival` : 'Free'}</dd>
        </dl>
        ${b.checkedIn ? '<p class="small" style="color:var(--ok)">Checked in. Enjoy your visit.</p>' : ''}
      </div>
      <div class="r">${qrSVG(`BNM-TICKET|${b.code}|${b.date}|${slotLabel(b.hour, b.minute || 0)}|${b.visitors}`, 'Ticket QR code')}<span class="code">${esc(b.code)}</span></div>
    </div>
    <p class="small muted" style="margin-top:18px;max-width:60ch">Show this code at the front desk. Please arrive within
      your entry slot; you can stay until closing time. Anything payable is settled at the front desk.</p>
  </div>`;
}

/* Fetched after the shell is on screen, then the page re-renders in place --
   the same arrangement as the staff pages. */
export async function bindTicket(code, rerender) {
  if (state.loading) return;
  if (state.ticket && state.code === code) { if (rerender) rerender(); return; }
  state.code = code;
  state.ticket = null;
  state.error = '';
  state.loading = true;
  if (rerender) rerender();
  try {
    state.ticket = await repo.getTicket(code);
  } catch (e) {
    state.error = e && e.status === 404
      ? `There is no booking with the code ${code}.`
      : (e && e.message) || 'The ticket could not be loaded.';
  } finally {
    state.loading = false;
  }
  if (rerender) rerender();
}
