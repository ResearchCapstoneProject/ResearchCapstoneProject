# Smoke test

Run after **every** frontend step of the refactor. The whole point is that the prototype stays
available at `doc/prototype/botswana-museum-prototype.html` so you can open both and compare.

```bash
python3 -m http.server 5173 -d src/frontend      # then open http://localhost:5173/html/
```

**The console must be free of errors at the end.** That is not a formality — most breakage in this
refactor (a missing export, a stale destructure, `window[e.art]` under module scope) shows up as a
single console error and an empty section, not as an obviously broken page.

## Routes — all 17 must render

```
#/                              #/tours
#/visit                         #/tour/highlights
#/exhibitions                   #/object/BNM-ETH-0142
#/events                        #/staff
#/tickets                       #/staff/add
#/collection                    #/staff/edit/BNM-ETH-0142
#/map                           #/staff/bookings
#/page/about                    #/staff/stats
#/nonsense   (must show "Not found", not a blank page)
```

## Actions — the 29 `data-act` verbs

| Group | Verbs | How to reach them |
|---|---|---|
| chrome | `reset` `lang-tn` `toast` `search-toggle` `menu` `close` | prototype bar, utility bar, masthead |
| object | `scan` `view` `light` `lb` `label` `print` | `#/object/BNM-ETH-0142` |
| tours | `tour-start` `tour-go` `close-nav` | `#/tour/highlights` |
| tickets | `day` `slot` `qty` `tk-next` `tk-back` `tk-confirm` `tk-new` | `#/tickets`, all four steps |
| collection | `dept` `dept-link` `room` `display` `clear-search` | `#/collection`, `#/map` |
| staff | `del` `rm-img` `checkin` `sday` | `#/staff`, `#/staff/add`, `#/staff/bookings` |

Plus: the four form submits (`#topsearch`, `#teasersearch`, `#colsearch`, newsletter), live input on
`#cq` and the `f-name`/`f-email`/`f-phone` fields, `change` on `#sort` and `#locf`, and `Escape` /
`ArrowLeft` / `ArrowRight` in both the lightbox and the tour player.

## Checks that have caught real regressions

- **Header search → room filter.** Search from the masthead, land on `#/collection`, then change
  "Where in the museum". Results must filter. This was broken (bug 2: the reset omitted `room`,
  leaving it `undefined`).
- **Booking keeps the phone number.** Book with a phone number, then
  `JSON.parse(localStorage['bnm-prototype-v1']).bookings[0].phone` must be non-empty (bug 3).
- **Exhibition cards render.** On `#/` and `#/exhibitions`. They resolve their artwork through a
  lookup map; under module scope the old `window[e.art]()` throws (bug 1).
- **Hero headline width.** At a 1440px viewport the `#/` `h1` must measure **545px**. A font that
  lost its width axis renders wider, with no console error.

## Automated layout fingerprint

Paste into the console on both builds and diff the two objects — element counts, rendered heights
and text lengths must match per route.

```js
const ROUTES = ['', 'visit', 'exhibitions', 'events', 'tickets', 'collection', 'map', 'tours',
  'tour/highlights', 'object/BNM-ETH-0142', 'staff', 'staff/add', 'staff/edit/BNM-ETH-0142',
  'staff/bookings', 'staff/stats', 'page/about', 'nonsense'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = {};
for (const r of ROUTES) {
  location.hash = '#/' + r;
  await sleep(120);
  const app = document.querySelector('#app');
  out[r || '(home)'] = {
    title: document.title,
    h: Math.round(app.getBoundingClientRect().height),
    els: app.querySelectorAll('*').length,
    txt: app.textContent.replace(/\s+/g, ' ').trim().length,
    svg: app.querySelectorAll('svg').length,
    links: app.querySelectorAll('a').length,
  };
}
location.hash = '#/'; out;
```

The one expected difference between the two builds is the object page's "QR links to:" line, which
embeds the page's own path. After the backend lands it comes from `PUBLIC_BASE_URL` instead.
