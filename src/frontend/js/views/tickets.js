import { pagehead } from '../ui/cards.js';
import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
import { dkey, fmtDate, fromKey, hh, money } from '../core/format.js';
import { qrSVG } from '../core/qr.js';
import { isPast, nextDays } from '../core/time.js';
import { TICKETS, TOUR_TIMES } from '../data/constants.js';
import { save } from '../data/local.js';
import { holiday, hoursFor, slotHours } from '../data/opening.js';
import { leftIn, newT, totalOf, visitorsOf } from '../state/booking.js';
import { CAPACITY } from '../data/constants.js';
import { taken } from '../state/booking.js';

/* ---------------- tickets ---------------- */

export function pageTickets() {
  if (store.T.step === 4 && !store.T.done) store.T = newT();
  const steps = ['Date & time', 'Tickets', 'Your details', 'Confirmation'];
  return `${pagehead([['#/', 'Home'], ['', 'Tickets']], 'Tickets &amp; time slots', 'Book your visit online and skip the queue. Every hour, up to 40 visitors can enter – so the galleries never get too crowded.')}
  <div class="wrap">
    <ol class="steps" aria-label="Booking steps">${steps.map((s, i) => `<li class="${i + 1 === store.T.step ? 'on' : i + 1 < store.T.step ? 'done' : ''}" ${i + 1 === store.T.step ? 'aria-current="step"' : ''}>${s}</li>`).join('')}</ol>
    <div class="tk" id="tk">${tkBody()}${tkSummary()}</div>
  </div>`;
}
export function tkRerender(scroll = false) {
  const a = document.activeElement; let sel = null;
  if (a && a.dataset && a.dataset.act) sel = `[data-act="${a.dataset.act}"]` + ['k', 'h', 'd'].map((x) => (a.dataset[x] !== undefined ? `[data-${x}="${a.dataset[x]}"]` : '')).join('');
  $('#app').innerHTML = pageTickets();
  if (scroll) { $('.steps').scrollIntoView({ behavior: 'smooth', block: 'start' }); const h = $('#tk h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } return; }
  if (sel) { const el = $(sel); if (el && !el.disabled) el.focus({ preventScroll: true }); }
}
export function tkBody() {
  if (store.T.step === 1) {
    const days = nextDays(14);
    const dayBtns = days.map((k) => {
      const d = fromKey(k); const closed = !hoursFor(k); const hol = holiday(k);
      const isToday = k === dkey(new Date());
      const allPast = !closed && slotHours(k).every((h) => isPast(k, h));
      const dis = closed || allPast;
      const em = closed ? 'Closed' : allPast ? 'Closed for today' : hol ? `<span class="hol">${esc(hol)}</span>` : isToday ? 'Today' : d.toLocaleDateString('en-GB', { month: 'short' });
      return `<button type="button" class="day" data-act="day" data-k="${k}" aria-pressed="${store.T.date === k}" ${dis ? 'disabled' : ''}><small>${d.toLocaleDateString('en-GB', { weekday: 'short' })}</small><b>${d.getDate()}</b><em>${em}</em></button>`;
    }).join('');
    let slots = '<p class="muted">Choose a day to see available time slots.</p>';
    if (store.T.date) {
      slots = `<div class="slots">${slotHours(store.T.date).map((h) => {
        const past = isPast(store.T.date, h); const left = leftIn(store.T.date, h); const full = left <= 0;
        const pct = Math.round((taken(store.T.date, h) / CAPACITY) * 100);
        const few = !full && left <= 8;
        const tour = TOUR_TIMES.includes(h);
        return `<button type="button" class="slot ${few ? 'few' : ''}" data-act="slot" data-h="${h}" aria-pressed="${store.T.hour === h}" ${past || full ? 'disabled' : ''}>
          <b>${hh(h)}</b>
          <span class="cap" aria-hidden="true"><i style="width:${past ? 0 : pct}%"></i></span>
          <span class="left">${past ? 'Past' : full ? 'Fully booked' : few ? `Only ${left} left` : `${left} places left`}</span>
          ${tour ? '<span class="tour">+ Guided tour</span>' : ''}
        </button>`;
      }).join('')}</div>`;
    }
    return `<div>
      <h2>Choose a day</h2><div class="days" role="group" aria-label="Day">${dayBtns}</div>
      <h2>Choose an entry time</h2>${slots}
      <div class="navrow"><span></span><button class="btn arrow" type="button" data-act="tk-next" ${store.T.date && store.T.hour !== null ? '' : 'disabled'}>Continue </button></div>
    </div>`;
  }
  if (store.T.step === 2) {
    const vis = visitorsOf(store.T.q); const left = leftIn(store.T.date, store.T.hour); const max = Math.min(10, left);
    const tourSlot = TOUR_TIMES.includes(store.T.hour);
    const rows = TICKETS.map((t) => {
      const v = store.T.q[t.key];
      const plusDis = t.addon ? (!tourSlot || v >= vis) : vis >= max;
      return `<div class="type">
        <div><b>${esc(t.name)}</b><p>${esc(t.addon && !tourSlot ? 'Guided tours run at 10:00 and 14:00 – choose one of these slots to add a tour' : t.desc)}</p></div>
        <div class="price">${money(t.price)}</div>
        <div class="stepper" role="group" aria-label="${esc(t.name)}"><button type="button" data-act="qty" data-k="${t.key}" data-d="-1" aria-label="Fewer" ${v <= 0 ? 'disabled' : ''}>−</button><output aria-live="polite">${v}</output><button type="button" data-act="qty" data-k="${t.key}" data-d="1" aria-label="More" ${plusDis ? 'disabled' : ''}>+</button></div>
      </div>`;
    }).join('');
    return `<div>
      <h2>How many visitors?</h2>
      <div class="types">${rows}</div>
      <p class="small muted" style="margin-top:14px">Up to ${max} visitors per booking in this slot. Coming with a school class? <a href="#/page/groups">Book through the education office</a> – free of charge.</p>
      <div class="navrow"><button class="btn ghost" type="button" data-act="tk-back">Back</button><button class="btn arrow" type="button" data-act="tk-next" ${vis > 0 ? '' : 'disabled'}>Continue </button></div>
    </div>`;
  }
  if (store.T.step === 3) {
    const total = totalOf(store.T.q); const e = store.T.err;
    const pay = total === 0
      ? `<label><input type="radio" name="pay" checked disabled><span><b>No payment needed</b><small>Your visit is free of charge.</small></span></label>`
      : `<label><input type="radio" name="pay" value="desk" ${store.T.pay === 'desk' ? 'checked' : ''}><span><b>Pay at the museum on arrival</b><small>Cash or card at the front desk</small></span></label>
         <label class="off"><input type="radio" name="pay" disabled><span><b>Mobile money</b><small>Orange Money, MyZaka, Smega – planned integration</small></span></label>
         <label class="off"><input type="radio" name="pay" disabled><span><b>Card online</b><small>Payment provider to be selected with the museum</small></span></label>`;
    return `<div>
      <h2>Your details</h2>
      <div class="formgrid">
        <div class="field full"><label for="f-name">Full name</label><input id="f-name" type="text" autocomplete="name" value="${esc(store.T.name)}" ${e.name ? 'aria-invalid="true" aria-describedby="e-name"' : ''}>${e.name ? `<span class="hint" id="e-name" style="color:var(--full)">${e.name}</span>` : ''}</div>
        <div class="field"><label for="f-email">E-mail</label><input id="f-email" type="email" autocomplete="email" value="${esc(store.T.email)}" ${e.email ? 'aria-invalid="true" aria-describedby="e-email"' : ''}><span class="hint" id="e-email" ${e.email ? 'style="color:var(--full)"' : ''}>${e.email || 'Your e-ticket is sent here'}</span></div>
        <div class="field"><label for="f-phone">Mobile number <span class="muted" style="font-weight:400">(optional)</span></label><input id="f-phone" type="tel" autocomplete="tel" placeholder="+267 7x xxx xxx" value="${esc(store.T.phone)}"></div>
        <div class="field"><label for="f-country">Country of residence</label><select id="f-country">${['Botswana', 'South Africa', 'Namibia', 'Zimbabwe', 'Zambia', 'Germany', 'Other'].map((c) => `<option ${store.T.country === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      </div>
      <h2 style="margin-top:36px">Payment</h2>
      <div class="pay">${pay}</div>
      <label class="check" style="margin-top:24px"><input type="checkbox" id="f-agree" ${store.T.agree ? 'checked' : ''}><span>I accept the house rules and the privacy notice.${e.agree ? ` <b style="color:var(--full)">${e.agree}</b>` : ''}</span></label>
      <div class="navrow"><button class="btn ghost" type="button" data-act="tk-back">Back</button><button class="btn" type="button" data-act="tk-confirm">Confirm booking</button></div>
    </div>`;
  }
  const b = store.T.done;
  const lines = TICKETS.filter((t) => b.q[t.key]).map((t) => `${b.q[t.key]} × ${t.name}`).join('<br>');
  return `<div>
    <div class="eyebrow" style="margin-bottom:8px">Booking confirmed</div>
    <h2 class="h2" style="font-size:34px;margin-bottom:10px">Re a leboga – see you soon!</h2>
    <p class="lede" style="margin:0 0 28px">Your e-ticket has been sent to ${esc(b.email)}. Show the QR code at the entrance.</p>
    <div class="eticket">
      <div class="l">
        <div class="flagrule" aria-hidden="true"></div>
        <div><div class="eyebrow">Botswana National Museum · E-ticket</div><div class="h3" style="margin-top:6px">${esc(fmtDate(b.date))}</div></div>
        <dl><dt>Entry</dt><dd>${hh(b.hour)} – ${hh(b.hour + 1)}</dd><dt>Visitors</dt><dd>${lines}</dd><dt>Name</dt><dd>${esc(b.name)}</dd><dt>Total</dt><dd>${money(b.total)}${b.total ? ' · pay on arrival' : ''}</dd></dl>
      </div>
      <div class="r">${qrSVG(`BNM-TICKET|${b.code}|${b.date}|${hh(b.hour)}|${b.visitors}`, 'Ticket QR code')}<span class="code">${b.code}</span></div>
    </div>
    <div class="navrow" style="justify-content:flex-start"><button class="btn" type="button" data-act="tk-new">Book another visit</button><a class="btn ghost" href="#/staff/bookings">See this booking in the staff area</a></div>
  </div>`;
}
export function tkSummary() {
  if (store.T.step === 4) {
    return `<aside class="summary" aria-label="Before your visit"><h3>Before your visit</h3>
      <ul class="small" style="margin:0;padding-left:18px;display:grid;gap:8px"><li>Arrive within your entry hour – you can stay until closing.</li><li>Bring your Omang or residence permit for free admission.</li><li>Guided tours meet at the front desk.</li></ul>
      <p class="fine">Prototype: no e-mail is sent and no payment is taken. Bookings are stored only in this browser.</p></aside>`;
  }
  const vis = visitorsOf(store.T.q); const total = totalOf(store.T.q);
  const lines = TICKETS.filter((t) => store.T.q[t.key]).map((t) => `<dt>${store.T.q[t.key]} × ${esc(t.name)}</dt><dd>${money(t.price * store.T.q[t.key])}</dd>`).join('');
  return `<aside class="summary" aria-label="Your booking">
    <h3>Your booking</h3>
    <dl>
      <dt>Day</dt><dd>${store.T.date ? esc(fmtDate(store.T.date, { weekday: 'short', day: 'numeric', month: 'short' })) : '–'}</dd>
      <dt>Entry</dt><dd>${store.T.hour !== null ? `${hh(store.T.hour)} – ${hh(store.T.hour + 1)}` : '–'}</dd>
      <dt>Visitors</dt><dd>${vis || '–'}</dd>
      ${lines}
    </dl>
    <div class="total"><span>Total</span><span>${vis ? money(total) : '–'}</span></div>
    <p class="fine">Prototype: no payment is taken and no data leaves this browser.</p>
  </aside>`;
}
export function tkConfirm() {
  store.T.name = $('#f-name').value.trim(); store.T.email = $('#f-email').value.trim(); store.T.phone = $('#f-phone').value.trim(); store.T.country = $('#f-country').value; store.T.agree = $('#f-agree').checked;
  const err = {};
  if (store.T.name.length < 2) err.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.T.email)) err.email = 'Please enter a valid e-mail address, e.g. name@example.com.';
  if (!store.T.agree) err.agree = 'Please accept to continue.';
  store.T.err = err;
  if (Object.keys(err).length) { tkRerender(); const first = err.name ? '#f-name' : err.email ? '#f-email' : '#f-agree'; $(first).focus(); return; }
  const code = 'BNM-' + Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  const b = { code, date: store.T.date, hour: store.T.hour, q: { ...store.T.q }, visitors: visitorsOf(store.T.q), total: totalOf(store.T.q), name: store.T.name, email: store.T.email, phone: store.T.phone, country: store.T.country, created: Date.now(), checkedIn: false };
  store.S.bookings.push(b); save();
  store.T.done = b; store.T.step = 4; tkRerender(true);
}
