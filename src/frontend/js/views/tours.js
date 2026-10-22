import { pagehead } from '../ui/cards.js';
import { tourCard, tourPlan } from '../ui/tours.js';
import { pageNotFound } from './notfound.js';
import { esc } from '../core/dom.js';
import { TOURS } from '../data/constants.js';
import { tourById, tourStops } from '../state/selectors.js';
import { pic } from '../art/registry.js';
import { $ } from '../core/dom.js';
import { store } from '../state/store.js';

export function pageTours() {
  return `${pagehead([['#/', 'Home'], ['', 'Tours']], 'Themed tours', 'Short routes through the galleries. Follow them on your phone – each stop is one object, and you can scan the QR code next to it at any time.')}
  <div class="wrap" style="padding-block:32px 72px"><div class="tourgrid">${TOURS.map(tourCard).join('')}</div></div>`;
}
export function pageTour(id) {
  const t = tourById(id);
  if (!t) return pageNotFound();
  const stops = tourStops(t);
  return `${pagehead([['#/', 'Home'], ['#/tours', 'Tours'], ['', t.title]], esc(t.title), esc(t.intro))}
  <div class="wrap tourhead">
    <div>
      <dl class="tourfacts"><dt>Duration</dt><dd>${t.mins} minutes</dd><dt>Stops</dt><dd>${stops.length} objects</dd><dt>Start</dt><dd>${esc(t.start)}</dd><dt>Good for</dt><dd>${esc(t.who)}</dd></dl>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px"><button class="btn" type="button" data-act="tour-start" data-id="${t.id}">Start the tour on a phone</button><a class="btn ghost" href="#/map">Museum map</a></div>
    </div>
    <div class="planbox">${tourPlan(t)}<p class="small muted" style="margin:10px 0 0">The numbers show the order of the stops.</p></div>
  </div>
  <div class="wrap" style="padding-bottom:72px">
    <div class="stops">
      ${stops.map((o, i) => `<a class="stop" href="#/object/${o.id}">
        <span class="num">${i + 1}</span>
        <span class="pic">${pic(o)}</span>
        <span class="txt"><span class="eyebrow">${esc(o.onDisplay ? o.location : 'In the store')}</span><b>${esc(o.title)}</b><span class="muted small">${esc(o.date || '')}${o.date ? ' · ' : ''}${esc(o.id)}</span></span>
      </a>`).join('')}
    </div>
  </div>`;
}
