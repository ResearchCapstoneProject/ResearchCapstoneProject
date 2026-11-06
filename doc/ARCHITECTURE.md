# Architecture

How the National Museum of Botswana site is put together, and why the
non-obvious decisions were made that way.

```
src/frontend/            no build step, plain ES modules
  html/index.html        the only page; the router is hash-based
  css/{base,layout,components,pages}/
  js/  core/   dom, format, hash, time, qr        (no museum specifics)
       art/    procedural SVG artwork + registry
       data/   constants, seed, opening hours, api, local, repo, and the
               static content: about, departments, explore, publications
       state/  store (the holder), selectors, booking, query, analytics
       ui/     shell, cards, content blocks, maps (Leaflet), modal, lightbox,
               charts
       views/  one module per route
       router/ routes + route()
       events/ document-level delegation
  assets/fonts/          woff2 extracted from the prototype
  assets/img/            all images of the museum's previous website
  assets/publications/   brochures, magazines, trail maps, posters (PDF)
  assets/seed/*.json     shared with the backend seeder

src/backend/
  sql/001_schema.sql     20 tables; DDL is the migration
  sql/002_reference_data.sql
  app/  models/ schemas/ services/ routers/ seed/
```

## Frontend

**Why the SPA stayed an SPA.** The prototype's hash router already worked, and
keeping it has a concrete payoff on the server: every URL the browser requests
is `/` plus a fragment the server never sees, so there is **no SPA catch-all
route** to get wrong. The cost is that `#/collection` is not a distinct URL for
search engines. Revisit if public SEO becomes a requirement.

**ES modules mean no `file://`.** `<script type="module">` is subject to CORS
and `file://` is an opaque origin, so the site must be served over HTTP:

```bash
python3 tools/devserver.py 5173   # then open /html/ (sends no-cache, see the file)
```

**The store.** `S`, `T`, `CQ` and nine others were top-level `let`s that
handlers *reassign*. An imported binding is read-only for the importer, so
`import { S }; S = fresh()` is a TypeError, and getter/setter pairs would turn
`T.step` into `getT().step` in about two hundred places. They live on one
holder object in `state/store.js` instead, which imports nothing and therefore
breaks every cycle between the data, view and event layers.

Two rules, both silent-breakage traps:

1. **Never `const { S } = store;` at module scope.** That captures the
   reference and goes stale the moment "Reset demo" or "New booking" replaces
   it. Inside a function body is fine.
2. `state/store.js` imports nothing, so values needing other modules
   (`store.SB`) are set by `initState()` in `main.js`.

**`main.js` imports `events/bind.js` for its side effects only.** That module
installs the delegated listeners and the `hashchange` hook. Nothing needs a
symbol from it, so nothing imported it, and the app rendered once and then
refused to navigate. Do not "tidy up" that import.

**Layering** runs one way and is checked, not just intended:

```
core/* ──→ state/store.js ──→ data/* ──→ state/*
                                  ↓
        art/* ──→ ui/* ──→ views/* ──→ router/* ──→ events/* ──→ main.js
```

`core/` holds nothing museum-specific. Opening hours read `HOURS`/`HOLIDAYS`,
so they live in `data/opening.js`, not `core/time.js`.

## Backend

**Session cookie, not JWT.** The SPA is same-origin with the API, so the usual
reason to reach for a token does not apply. This app builds pages with
`innerHTML` from staff-entered text, so a token readable by JavaScript is a
real XSS liability where an `HttpOnly` cookie is not. And revocation for a
handover — "the intern's laptop was stolen" — is one `DELETE`, where a
stateless JWT needs a blocklist table, which is a session table with extra
steps. Only `sha256(token)` is stored, so a database dump does not hand over
live sessions.

**The staff guard is structural.** `require_staff` is attached to the
`APIRouter` itself in `routers/staff/__init__.py`, not to each endpoint, so a
route added later cannot ship unauthenticated by omission.

**Inventory numbers come from a counter, never `MAX(seq)+1`.** The old way
races between two curators saving at once, and it recycles: delete
`BNM-ETH-0143` and the next object created takes that number — a different
object wearing a retired one, which is the thing an accession register exists
to prevent. `UPDATE inventory_counter SET next_seq = LAST_INSERT_ID(next_seq+1)`
takes an InnoDB row lock and is atomic and monotonic.

Counters are **not** reset by the demo reset. That is deliberate and looks
like a bug if you do not know.

**A slot is a start time, not an hour.** `setting.slot_minutes` is set in the
staff area, so `booking.visit_minute` is part of the slot identity and of the
capacity lock. Slots tile the opening hours from opening time; a remainder
shorter than one slot is dropped rather than letting the last slot overrun
closing time. `slot_starts()` in the backend and `slotStarts()` in
`js/data/opening.js` must stay in agreement, or the offline demo offers a slot
the API then rejects.

**Visitor groups are data, not code.** The museum starts with one free
`Admission` group and adds priced groups in the staff area. A group that has
been booked is deactivated, never deleted, so `booking_line.unit_price_thebe`
keeps meaning what somebody actually paid.

**Booking codes** use `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — no I, O, 0 or 1,
because a visitor reads the code out at the front desk. Generation inserts and
retries on the UNIQUE index rather than checking first, which would be a
TOCTOU race.

**Money is stored in thebe as `INT`.** Never floats, never Pula. `money()` on
the client divides by 100.

**`on_display` is derived**, `location.is_store = 0 AND location_id IS NOT NULL`,
replacing `label.startsWith('Store')` — which breaks the moment a curator
types "Storeroom B".

**Search ships as `LIKE`.** It reproduces the prototype's `matches()` exactly:
split on whitespace, every word must appear. `FULLTEXT` is indexed and ready,
but is not the default because it surprises people in a demo — the default
`innodb_ft_min_token_size` of 3 drops two-letter words, the stopword list
drops common English, and `BNM-ETH-0142` tokenises to `BNM`/`ETH`/`0142`, so
searching a full inventory number matches the whole department. Flip it with
`SEARCH_MODE=fulltext`.

**No Alembic.** For a capstone with a handover, `001_schema.sql` as reviewable
DDL plus "drop the volume and re-create" is the honest workflow, and it is
what the museum's IT department will actually read.

That workflow stops at the first deployed instance, because dropping the
volume there means losing the museum's data. So a schema change is written
twice: into `001_schema.sql` for a fresh database, and as a dated, idempotent
file in `doc/migrations/` for one that already exists. The server's deploy
step applies every migration it has not seen; `README.md` has the order. The
failure this prevents is specific: new code selecting `booking.visit_minute`
from a database that does not have it, which MySQL answers with error 1054 on
every booking query.

## The appearance kit

`css/base/tokens.css` already expressed every colour and face as a custom
property, which is what makes the staff area's Appearance page cheap: it sets
eight variables on `:root` and the whole site restyles, with no re-render and
no second stylesheet. `core/theme.js` owns that, `services/theme.py` owns the
server half, and the values live in `setting` rows under a `theme.` prefix --
so the kit needed no migration, and a missing row means "the shipped design".

Two rules are deliberate and worth keeping:

**Three colours, not eleven.** Staff pick the museum colour, the action
colour and an accent. `--sky-soft`, `--ochre-soft`, `--sand` and `--ochre-ink`
are derived from them in the browser, and anything that carries text is
darkened in a loop until it reaches 4.5:1 against white. A museum should not
be able to produce unreadable text by choosing a nice pastel for its logo.

**Fonts are either bundled or uploaded, never fetched.** The catalogue holds
the two faces in `assets/fonts/`, two device stacks that download nothing,
and whatever `.woff2` the museum uploads -- which is validated by its `wOF2`
magic bytes, not by the file name. No Google Fonts: the galleries have no
reliable connection, and an exhibition label should not wait on a CDN.

The masthead is the one piece that is markup rather than a variable, so
`applyTheme()` writes the name, the tagline and an uploaded logo's `src` into
it in place. That is also what makes the staff page's live preview reach the
header while someone is still typing in a field -- re-rendering the shell
would take the focus out of it.

## Personal data

A booking holds a name, an e-mail address, usually a phone number and the day
somebody was in the building; a staff session holds a password hash. Three
decisions carry that:

**Transport.** `Caddyfile.https` plus `COOKIE_SECURE=1` are the whole of it,
switched on by two lines in the server's `.env` (see `README.md`). Without
HTTPS everything above travels readable, and `COOKIE_SECURE=1` without HTTPS
locks the staff out instead -- which is why they are documented as one step.

**Retention.** `services/retention.py` deletes bookings whose visit is longer
ago than a period the museum sets, on every API start and whenever the staff
area asks. The default is 0, meaning keep: a deployment must not start
deleting records because a developer chose a number. The booking lines are
deleted explicitly rather than left to the foreign key -- MySQL cascades,
SQLite only does with foreign keys switched on, and a deletion that depends
on which database it runs against is not one to trust with personal data.

**Deletion on request.** An administrator can delete one booking, which is
the answer to "please remove my data". The audit entry keeps the booking code
and nothing else: a log that recorded who had been deleted would defeat the
deletion. Scan statistics never hold a person in the first place -- see
`services/privacy.py`, where the IP and user agent become a hash with a
daily-rotating salt.

What is deliberately not here: the demo reset. It deletes everything that is
*not* demo data, which is right for a presentation and catastrophic on a
server with the museum's records on it, so `DEMO_RESET_ENABLED=0` turns it
off and `GET /api/config` tells the staff area to stop offering the button.

## Going live

`services/golive.py` is the other direction, and the module's docstring is
the authoritative list: every row in the database is either the museum's own
record, a record the project invented so the site could be shown, or real
traffic -- and going live deletes exactly the middle group. The distinction
that matters is the collection: all 60 objects carry a catalogue page from
*Art and Crafts of Botswana*, so there is no such thing as a sample object to
delete, and the code never touches `museum_object` at all.

The notes that say "this is a demonstration" hang off a single setting,
`demo_mode`, which `GET /api/config` carries: the draft banner on the legal
pages, the footer's sample-content line, the staff area's wording and the
reset button all read it. One switch, no scattered flags -- and because it is
a setting rather than a schema change, going live needs no migration.

Both this and the demo reset delete booking lines explicitly instead of
leaving them to the foreign key, for the reason given under Personal data: the
cascade exists in MySQL and not in SQLite, and an orphaned line is a row
nobody ever looks at again.

## Rewriting a text

The museum can change any text the site carries as content, and the mechanism
is the same idea as the picture swaps: an override keyed by where the thing
lives, applied over the bundled original.

The key is the **path into the content modules** -- `pagecopy.events.lede`,
`explore.SITES.2.blocks.1.p.0`. `core/text.js` walks the modules once at load,
which gives every string a key and remembers the original, then writes the
museum's version over it before the first render. A named key per sentence was
the alternative and is worse: somebody has to invent and maintain it, and the
first text added without one is a text nobody can edit.

Three consequences worth knowing. A text goes back to the original by
deleting a row, with no second copy of the original anywhere. A key that has
moved on (a text renamed in a later version) is ignored rather than applied
somewhere random, because `assign()` only ever replaces a string that is
already there. And the walk skips fields that are an address rather than
prose -- `key`, `id`, `href`, `cover`, `pdf` and friends -- so the editor
cannot break a lookup or a link; `SKIP_FIELDS` in `core/text.js` is that
list, and it is the thing to extend when a new content field appears.

What this does not cover, deliberately: the words the interface is made of.
Those live in the templates, and an editor for them buys a half-rewritten
screen for no museum benefit. It is also why `data/pagecopy.js` exists -- the
page headings and introductions moved out of the templates and into a data
module, which is what made them editable at all.

## Replacing a picture

The site renders photographs in a dozen templates, and some build their path
from a constant, so a resolver each template had to call would be forgotten
exactly once and then be wrong on one page for a year. `core/assets.js`
therefore works on the DOM: `GET /api/config` carries a map of bundled path ->
upload, the router calls `applyImageOverrides($('#app'))` after every render,
and the shell does the same for the masthead and the footer. A replacement
reaches every page that shows that file, including pages written later.

Two details that are easy to get wrong: the swap also drops `srcset` and
`sizes`, because a leftover `srcset` wins over `src` in the browser's own
selection -- the original would then come back on exactly the wide screen
somebody is presenting on. And the stored key is checked against
`/assets/img/` and `/assets/publications/` on the way in: it is a lookup key
that every visitor's browser receives, not a URL, so it is not a place to
park a link.

The gallery in the staff area is scanned out of the content modules
(`collectAssets` walks `ABOUT`, `DEPARTMENTS`, `SECTIONS`, `PUB_TYPES` for
strings that look like an asset path) rather than being a list somebody keeps
up to date. Add a photo to a monument and it is offered for replacement
without a line of code.

## Online and offline

`data/repo.js` probes `GET /api/health` **once** per page load and latches the
result. Every later call branches on `store.api.mode`; there is no per-call
timeout and no probe storm.

A later failure calls `degrade()`: flip to offline, snapshot state to
localStorage, one toast, re-render. It is idempotent and **never flips back
automatically** — flapping mid-booking would corrupt the wizard. The prototype
bar has a Reconnect button.

During `bootstrap()` the same failure takes the quiet path: state flips to
offline, but the callback does not run, because the re-render it does needs a
shell that does not exist yet. `main.js` shows the toast once the page is up
instead. Getting this wrong is worth knowing about, because of how it looks:
the health probe succeeds, a later call answers 5xx, the exception escapes
boot before the seed is loaded, `store.S` stays `null`, and every view throws
on it. The site then serves a masthead and an empty `#app` — no hero image, no
active navigation item, no time slots, and clicking the logo does nothing,
because `route()` throws before it gets to any of them. That is one bad
response looking exactly like four unrelated CSS bugs.

`401`/`403` never degrade: the API is up and you are not authorised. Clear the
user and redirect to the login. Conflating those with unreachability is the
classic bug in this pattern. Other 4xx do not degrade either — a `409` on a
full slot is a business answer, rendered as a form error.

To see it: `docker compose --profile demo up`, then `:8080` (no API) versus
`:8000` (live). Same files, two origins.

## What is still simulated

Payments (Orange Money, MyZaka, Smega and card are disabled placeholders),
e-mail, the newsletter, the audio guide, Setswana and AR.
`core/config.js` has a `FEATURES` object listing them in one place — that list
is also the answer to several questions in `doc/TODO.md`.

Scan statistics are **real rows** now, but the seeded history carries
`source='seed'` and the staff simulate button carries `source='staff_demo'`,
so nobody mistakes generated demo data for measurement. Only `source='qr'` is
a visitor.

## Things that cost an afternoon if you do not know

- `/docker-entrypoint-initdb.d` runs **only when the `dbdata` volume is
  empty**. After changing the schema: `docker compose down -v` locally, and a
  migration from `doc/migrations/` anywhere the data has to survive.
- The server has **no `--reload`** (`compose.override.yaml`), and the source
  tree is a bind mount. `git pull` alone therefore ships the new frontend to
  visitors while the API still runs the old code: restart `api` in the same
  breath.
- `innodb_ft_min_token_size` applies when a FULLTEXT index is *built*, so it
  must be in `docker/mysql/conf.d/bnm.cnf` on that same first boot.
- `002_reference_data.sql` must stay **UTF-8 with no BOM**. Location labels
  contain U+00B7 MIDDLE DOT and the frontend keys on the exact string.
- Archivo's **width axis is load-bearing**. A truncated or subset woff2 falls
  back to the 100% instance with no console error; the headings just look
  subtly wrong. The hero headline measures 545px at a 1440px viewport.
