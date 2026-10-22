import { pagehead } from '../ui/cards.js';
import { $ } from '../core/dom.js';
import { DAYNAME } from '../core/time.js';
import { HOURS, TICKETS } from '../data/constants.js';
import { esc } from '../core/dom.js';
import { hh, money } from '../core/format.js';

export function pageVisit() {
  const today = new Date().getDay();
  const order = [2, 3, 4, 5, 6, 0, 1];
  return `${pagehead([['#/', 'Home'], ['', 'Visit']], 'Plan your visit', 'Everything you need for your visit to the National Museum and Art Gallery in Gaborone. Opening hours and prices on this page are placeholders to be confirmed with the museum.')}
  <div class="wrap placeholder" style="padding-block:48px 80px">
    <div>
      <h2 class="h3" style="margin-bottom:14px">Opening hours</h2>
      <table class="hours">${order.map((d) => `<tr class="${d === today ? 'today' : ''}"><td>${DAYNAME[d]}${d === today ? ' (today)' : ''}</td><td>${HOURS[d] ? `${hh(HOURS[d][0])} – ${hh(HOURS[d][1])}` : 'Closed'}</td></tr>`).join('')}</table>
      <p class="small muted">Last entry one hour before closing. Closed on selected public holidays.</p>
      <h2 class="h3" style="margin:36px 0 14px">Admission</h2>
      <table class="hours">${TICKETS.map((t) => `<tr><td>${esc(t.name)}</td><td>${money(t.price)}</td></tr>`).join('')}<tr><td>School groups (booked via the education office)</td><td>Free</td></tr></table>
      <div style="margin-top:28px"><a class="btn" href="#/tickets">Book a time slot</a></div>
    </div>
    <div>
      <h2 class="h3" style="margin-bottom:14px">Getting here</h2>
      <p class="prose">331 Independence Avenue, Gaborone. The museum is in the city centre and can be reached by taxi or combi. Parking information will follow.</p>
      <h2 class="h3" style="margin:28px 0 14px">Accessibility</h2>
      <p class="prose">Information on step-free access, seating and assistance will be added together with the museum team.</p>
      <h2 class="h3" style="margin:28px 0 14px">Groups &amp; schools</h2>
      <p class="prose">School classes visit free of charge. The education office plans guided visits and workshops for all school levels.</p>
    </div>
  </div>`;
}
