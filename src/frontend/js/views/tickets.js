import { pagehead } from '../ui/cards.js';
import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
import { dkey, fmtDate, fromKey, hh, money } from '../core/format.js';
import { qrSVG } from '../core/qr.js';
import { isPast, nextDays } from '../core/time.js';
import { CAPACITY, SLOT_MINUTES, TICKETS, TOUR_TIMES } from '../data/constants.js';
import { holiday, hoursFor, slotEnd, slotLabel, slotStarts } from '../data/opening.js';
import { leftIn, newT, totalOf, visitorsOf } from '../state/booking.js';
import { eventsAll } from '../state/selectors.js';
import { createBooking } from '../data/repo.js';
import { toast } from '../ui/toast.js';
import { taken } from '../state/booking.js';
import { fill, PAGE_COPY } from '../data/pagecopy.js';

/* The event the visitor pressed "Book" on, if any. */
const bookingEvent = () => (store.T.eventId
  ? eventsAll().find((e) => String(e.id) === String(store.T.eventId)) || null
  : null);

/* Arriving from an event: the wizard starts on that event's day, with the
   slot the event begins in already chosen when it is still bookable. */
export function startEventBooking(id) {
  store.T = newT();
  const ev = eventsAll().find((e) => String(e.id) === String(id));
  if (!ev) return;
  store.T.eventId = ev.id;

  const starts = slotStarts(ev.d);
  if (!hoursFor(ev.d) || starts.every(({ h, m }) => isPast(ev.d, h, m))) return;
  store.T.date = ev.d;

  /* '14:00' or '09:30–12:30' -- the first time in the label is the start. */
  const t = (ev.time || '').match(/(\d{1,2})[:.](\d{2})/);
  if (!t) return;
  const minutes = Number(t[1]) * 60 + Number(t[2]);
  const exact = starts.find(({ h, m }) => h * 60 + m === minutes);
  const containing = starts.filter(({ h, m }) => h * 60 + m <= minutes).pop();
  const slot = exact || containing;
  if (slot && !isPast(ev.d, slot.h, slot.m) && leftIn(ev.d, slot.h, slot.m) > 0) {
    store.T.hour = slot.h;
    store.T.min = slot.m;
  }
}

/* ---------------- tickets ---------------- */

export function pageTickets() {
  if (store.T.step === 4 && !store.T.done) store.T = newT();
  const steps = ['Date & time', 'Tickets', 'Your details', 'Confirmation'];
  return `${pagehead([['#/', 'Home'], ['', esc(PAGE_COPY.tickets.title)]], esc(PAGE_COPY.tickets.title), esc(fill(PAGE_COPY.tickets.lede, { minutes: SLOT_MINUTES, capacity: CAPACITY })))}
  <div class="wrap">
    ${eventStrip()}
    <ol class="steps" aria-label="Booking steps">${steps.map((s, i) => `<li class="${i + 1 === store.T.step ? 'on' : i + 1 < store.T.step ? 'done' : ''}" ${i + 1 === store.T.step ? 'aria-current="step"' : ''}>${s}</li>`).join('')}</ol>
    <div class="tk" id="tk">${tkBody()}${tkSummary()}</div>
  </div>`;
}
/* The wizard used to let "Next" through on an empty step, which ended in a
   booking with no day at all -- visible the moment an event fell on a Monday,
   when the museum is closed and nothing could be preselected. */
export function tkNext() {
  if (store.T.step === 1 && (store.T.date === null || store.T.hour === null)) {
    toast(store.T.date === null
      ? 'Please choose a day first.'
      : 'Please choose an entry time.');
    return;
  }
  if (store.T.step === 2 && visitorsOf(store.T.q) < 1) {
    toast('Please choose at least one ticket.');
    return;
  }
  store.T.step += 1;
  tkRerender(true);
}

function eventStrip() {
  const ev = bookingEvent();
  if (!ev) return '';
  /* An event on a closed day, or one that has been and gone: say so, rather
     than leaving the visitor wondering why no day is selected. */
  const closed = !hoursFor(ev.d)
    ? 'The museum is closed that day – a time slot cannot be booked for it.'
    : (slotStarts(ev.d).every(({ h, m }) => isPast(ev.d, h, m))
      ? 'That day has passed. You can still book another visit.' : '');
  return `<div class="evstrip">
    <div><div class="eyebrow">Booking for this event</div>
      <b>${esc(ev.title)}</b>
      <span class="small muted">${esc(fmtDate(ev.d))}${ev.time ? ` · ${esc(ev.time)}` : ''}${ev.place ? ` · ${esc(ev.place)}` : ''}</span>
      ${closed ? `<span class="small" style="color:var(--warn)">${esc(closed)}</span>` : ''}</div>
    <button class="btn link" type="button" data-act="tk-noevent">Book a plain visit instead</button>
  </div>`;
}

export function tkRerender(scroll = false) {
  const a = document.activeElement; let sel = null;
  if (a && a.dataset && a.dataset.act) sel = `[data-act="${a.dataset.act}"]` + ['k', 'h', 'm', 'd'].map((x) => (a.dataset[x] !== undefined ? `[data-${x}="${a.dataset[x]}"]` : '')).join('');
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
      const allPast = !closed && slotStarts(k).every(({ h, m }) => isPast(k, h, m));
      const dis = closed || allPast;
      const em = closed ? 'Closed' : allPast ? 'Closed for today' : hol ? `<span class="hol">${esc(hol)}</span>` : isToday ? 'Today' : d.toLocaleDateString('en-GB', { month: 'short' });
      return `<button type="button" class="day" data-act="day" data-k="${k}" aria-pressed="${store.T.date === k}" ${dis ? 'disabled' : ''}><small>${d.toLocaleDateString('en-GB', { weekday: 'short' })}</small><b>${d.getDate()}</b><em>${em}</em></button>`;
    }).join('');
    let slots = '<p class="muted">Choose a day to see available time slots.</p>';
    if (store.T.date) {
      slots = `<div class="slots">${slotStarts(store.T.date).map(({ h, m }) => {
        const past = isPast(store.T.date, h, m); const left = leftIn(store.T.date, h, m); const full = left <= 0;
        const pct = Math.round((taken(store.T.date, h, m) / CAPACITY) * 100);
        const few = !full && left <= 8;
        const tour = TOUR_TIMES.includes(h);
        return `<button type="button" class="slot ${few ? 'few' : ''}" data-act="slot" data-h="${h}" data-m="${m}" aria-pressed="${store.T.hour === h && store.T.min === m}" ${past || full ? 'disabled' : ''}>
          <b>${slotLabel(h, m)}</b>
          <span class="small muted">to ${slotEnd(h, m)}</span>
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
    const vis = visitorsOf(store.T.q); const left = leftIn(store.T.date, store.T.hour, store.T.min); const max = Math.min(10, left);
    /* No configured tour times means an add-on is available in every slot. */
    const tourSlot = !TOUR_TIMES.length || TOUR_TIMES.includes(store.T.hour);
    const rows = TICKETS.map((t) => {
      const v = store.T.q[t.key];
      const plusDis = t.addon ? (!tourSlot || v >= vis) : vis >= max;
      return `<div class="type">
        <div><b>${esc(t.name)}</b><p>${esc(t.addon && !tourSlot ? `Only at ${TOUR_TIMES.map((x) => slotLabel(x, 0)).join(' and ')} – choose one of these slots` : t.desc)}</p></div>
        <div class="price">${t.price ? money(t.price) : 'Free'}</div>
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
    /* The museum takes payment at the front desk only; nothing is charged
       online. A booking therefore reserves a place, it never settles a bill. */
    const pay = total === 0
      ? `<label><input type="radio" name="pay" checked disabled><span><b>No payment needed</b><small>Admission is free of charge.</small></span></label>`
      : `<label><input type="radio" name="pay" value="desk" checked disabled><span><b>Pay at the museum on arrival</b><small>Cash or card at the front desk · nothing is charged online</small></span></label>`;
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
      <label class="check" style="margin-top:24px"><input type="checkbox" id="f-agree" ${store.T.agree ? 'checked' : ''}><span>I accept the house rules and the <a href="#/privacy" target="_blank" rel="noopener">privacy notice</a>.${e.agree ? ` <b style="color:var(--full)">${e.agree}</b>` : ''}</span></label>
      <div class="navrow"><button class="btn ghost" type="button" data-act="tk-back">Back</button><button class="btn" type="button" data-act="tk-confirm" ${store.T.busy ? 'disabled' : ''}>${store.T.busy ? 'Booking…' : 'Confirm booking'}</button></div>
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
        <dl><dt>Entry</dt><dd>${slotLabel(b.hour, b.min || 0)} – ${slotEnd(b.hour, b.min || 0)}</dd>${b.eventTitle ? `<dt>Event</dt><dd>${esc(b.eventTitle)}</dd>` : ''}<dt>Visitors</dt><dd>${lines}</dd><dt>Name</dt><dd>${esc(b.name)}</dd><dt>Total</dt><dd>${b.total ? `${money(b.total)} · pay on arrival` : 'Free'}</dd></dl>
      </div>
      <div class="r">${qrSVG(`BNM-TICKET|${b.code}|${b.date}|${slotLabel(b.hour, b.min || 0)}|${b.visitors}`, 'Ticket QR code')}<span class="code">${b.code}</span></div>
    </div>
    <div class="navrow" style="justify-content:flex-start"><button class="btn" type="button" data-act="tk-new">Book another visit</button><a class="btn ghost" href="#/staff/bookings">See this booking in the staff area</a></div>
  </div>`;
}
export function tkSummary() {
  if (store.T.step === 4) {
    return `<aside class="summary" aria-label="Before your visit"><h3>Before your visit</h3>
      <ul class="small" style="margin:0;padding-left:18px;display:grid;gap:8px"><li>Arrive within your entry slot – you can stay until closing.</li><li>Show this code at the front desk; admission is free.</li><li>Anything that is not free is paid at the front desk.</li></ul>
      <p class="fine">E-mail confirmations are not available yet, and nothing is charged online.</p></aside>`;
  }
  const vis = visitorsOf(store.T.q); const total = totalOf(store.T.q);
  const lines = TICKETS.filter((t) => store.T.q[t.key]).map((t) => `<dt>${store.T.q[t.key]} × ${esc(t.name)}</dt><dd>${money(t.price * store.T.q[t.key])}</dd>`).join('');
  return `<aside class="summary" aria-label="Your booking">
    <h3>Your booking</h3>
    <dl>
      <dt>Day</dt><dd>${store.T.date ? esc(fmtDate(store.T.date, { weekday: 'short', day: 'numeric', month: 'short' })) : '–'}</dd>
      <dt>Entry</dt><dd>${store.T.hour !== null ? `${slotLabel(store.T.hour, store.T.min || 0)} – ${slotEnd(store.T.hour, store.T.min || 0)}` : '–'}</dd>
      <dt>Visitors</dt><dd>${vis || '–'}</dd>
      ${bookingEvent() ? `<dt>Event</dt><dd>${esc(bookingEvent().title)}</dd>` : ''}
      ${lines}
    </dl>
    <div class="total"><span>Total</span><span>${vis ? (total ? money(total) : 'Free') : '–'}</span></div>
    <p class="fine">Nothing is charged online. Anything payable is settled at the front desk.</p>
  </aside>`;
}
export async function tkConfirm() {
  if (store.T.date === null || store.T.hour === null) {
    store.T.step = 1;
    toast('Please choose a day and an entry time first.');
    tkRerender(true);
    return;
  }
  store.T.name = $('#f-name').value.trim(); store.T.email = $('#f-email').value.trim(); store.T.phone = $('#f-phone').value.trim(); store.T.country = $('#f-country').value; store.T.agree = $('#f-agree').checked;
  const err = {};
  if (store.T.name.length < 2) err.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.T.email)) err.email = 'Please enter a valid e-mail address, e.g. name@example.com.';
  if (!store.T.agree) err.agree = 'Please accept to continue.';
  store.T.err = err;
  if (Object.keys(err).length) { tkRerender(); const first = err.name ? '#f-name' : err.email ? '#f-email' : '#f-agree'; $(first).focus(); return; }

  /* This used to invent a code and write the booking into localStorage, which
     meant an online booking never reached the museum: the front desk's list
     and the check-in read from the server. The code and the total now come
     from the API, which also re-checks the capacity under a row lock -- the
     one place where two visitors can race for the last places. Offline,
     repo.createBooking() still keeps it in the browser, so a demo without a
     server behaves as before. */
  store.T.busy = true;
  tkRerender();
  try {
    const b = await createBooking({
      date: store.T.date,
      hour: store.T.hour,
      minute: store.T.min || 0,
      q: { ...store.T.q },
      eventId: store.T.eventId || null,
      name: store.T.name,
      email: store.T.email,
      phone: store.T.phone,
      country: store.T.country,
      agree: true,
    });
    store.T.busy = false;
    store.T.done = b;
    store.T.step = 4;
    tkRerender(true);
  } catch (e) {
    store.T.busy = false;
    if (e && e.code === 'slot_full') {
      /* Somebody else took the last places while this form was open. Back to
         the slot grid rather than a dead end. */
      store.T.hour = null;
      store.T.step = 1;
      toast('Those places have just been taken. Please choose another time.');
    } else {
      toast((e && e.message) || 'The booking could not be saved. Please try again.');
    }
    tkRerender(true);
  }
}
