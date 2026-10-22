# Architecture

How the National Museum of Botswana site is put together, and why the
non-obvious decisions were made that way.

```
src/frontend/            no build step, plain ES modules
  html/index.html        the only page; the router is hash-based
  css/{base,layout,components,pages}/
  js/  core/   dom, format, hash, time, qr        (no museum specifics)
       art/    procedural SVG artwork + registry
       data/   constants, seed, opening hours, api, local, repo
       state/  store (the holder), selectors, booking, query, analytics
       ui/     shell, cards, modal, lightbox, tour player, floor plan, charts
       views/  one module per route
       router/ routes + route()
       events/ document-level delegation
  assets/fonts/          woff2 extracted from the prototype
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
python3 -m http.server 5173 -d src/frontend   # then open /html/
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

## Online and offline

`data/repo.js` probes `GET /api/health` **once** per page load and latches the
result. Every later call branches on `store.api.mode`; there is no per-call
timeout and no probe storm.

A later failure calls `degrade()`: flip to offline, snapshot state to
localStorage, one toast, re-render. It is idempotent and **never flips back
automatically** — flapping mid-booking would corrupt the wizard. The prototype
bar has a Reconnect button.

`401`/`403` never degrade: the API is up and you are not authorised. Clear the
user and redirect to the login. Conflating those with unreachability is the
classic bug in this pattern. Other 4xx do not degrade either — a `409` on a
full slot is a business answer, rendered as a form error.

To see it: `docker compose --profile demo up`, then `:8080` (no API) versus
`:8000` (live). Same files, two origins.

## What is still simulated

Payments (Orange Money, MyZaka, Smega and card are disabled placeholders),
e-mail, the newsletter, the audio guide, Setswana, AR and the virtual tour.
`core/config.js` has a `FEATURES` object listing them in one place — that list
is also the answer to several questions in `doc/TODO.md`.

Scan statistics are **real rows** now, but the seeded history carries
`source='seed'` and the staff simulate button carries `source='staff_demo'`,
so nobody mistakes generated demo data for measurement. Only `source='qr'` is
a visitor.

## Things that cost an afternoon if you do not know

- `/docker-entrypoint-initdb.d` runs **only when the `dbdata` volume is
  empty**. After changing the schema: `docker compose down -v`.
- `innodb_ft_min_token_size` applies when a FULLTEXT index is *built*, so it
  must be in `docker/mysql/conf.d/bnm.cnf` on that same first boot.
- `002_reference_data.sql` must stay **UTF-8 with no BOM**. Location labels
  contain U+00B7 MIDDLE DOT and the frontend keys on the exact string.
- Archivo's **width axis is load-bearing**. A truncated or subset woff2 falls
  back to the 100% instance with no console error; the headings just look
  subtly wrong. The hero headline measures 545px at a 1440px viewport.
