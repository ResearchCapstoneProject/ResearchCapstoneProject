# ResearchCapstoneProject
Research Capstone Project created in collaboration with the National Museum of Botswana.

A website for the museum with online ticketing (timed slots), a searchable collection
database, QR-coded gallery labels, the museum's departments, publications and heritage sites
(Explore, with maps and heritage trails) and a staff area for curators and the
front desk.

**Contents** — [Quick start](#quick-start) · [Local vs. server](#local-vs-server) ·
[Running locally](#running-locally) · [Running on the server](#running-on-the-server) ·
[Content](#content) · [Layout](#layout) · [Pitfalls](#things-that-will-otherwise-cost-you-an-afternoon) ·
[Status](#status)


## Quick start
You need Docker. Nothing else — no Node, no local Python, no MySQL install.

```bash
cp .env.example .env
```

Then fill in two secrets in `.env`:

| key | value |
| --- | --- |
| `SESSION_SECRET` | the **output** of `openssl rand -hex 32` — not the command itself |
| `ADMIN_BOOTSTRAP_PASSWORD` | the first staff account's password |

Change the two MySQL passwords from their placeholders too. Leave `COMPOSE_FILE`
commented out — that line is for the server only, see below.

```bash
docker compose up --build
```

The site is at **http://localhost:8000**, the API docs at http://localhost:8000/docs.
Sign in to the staff area at `#/staff` with `ADMIN_BOOTSTRAP_USER` and the password you
set.


## Local vs. server
Both run the same stack from the same `docker-compose.yml`. The server adds
`compose.prod.yaml` on top, and that one file is every difference between them:

| | local | server |
| --- | --- | --- |
| compose files | `docker-compose.yml` alone | `+ compose.prod.yaml` |
| in front of the app | nothing | Caddy on port 80 |
| port 8000 (API) | published on every interface | `127.0.0.1` only |
| port 3307 (MySQL) | published on every interface | `127.0.0.1` only |
| uvicorn | `--reload` | no reload, `--proxy-headers` |
| a schema change arrives by | `docker compose down -v` | a migration from `doc/migrations/` |
| `COOKIE_SECURE` in `.env` | `0` | `1` once served over HTTPS |

`compose.prod.yaml` is **not** applied automatically. The server opts in with one line in
its own `.env`, which is machine-specific and never committed:

```bash
COMPOSE_FILE=docker-compose.yml:compose.prod.yaml
```

Compose reads `COMPOSE_FILE` from `.env`, so every plain `docker compose …` command on
that machine picks it up with no `-f` flags — and a machine without the line gets the
development stack. Nothing has to be remembered at the command line, which is the point.

> The file used to be called `compose.override.yaml`, a name Compose *does* apply on its
> own. Committed by mistake, it quietly gave every development machine the server's
> settings: no `--reload`, Caddy on port 80, and 8000 bound to loopback only. The name is
> now in `.gitignore` so it cannot come back.


## Running locally

### The full stack
`docker compose up --build`, as in [Quick start](#quick-start). The backend source is a
bind mount and uvicorn runs with `--reload`, so a change to a `.py` file restarts the API
by itself. Frontend files are served straight off disk — a reload in the browser is
enough.

### Frontend on its own
The frontend is plain ES modules with no build step, so a static server is enough — but it
must be **served over HTTP**, not opened as a file. `<script type="module">` is subject to
CORS and `file://` is an opaque origin, so double-clicking `index.html` will not work.

```bash
python3 tools/devserver.py 5173    # then open http://localhost:5173/html/
```

With no API reachable the site runs from `src/frontend/assets/seed/*.json` and keeps
changes in the browser's localStorage. Everything works except the things that need a
server: real sign-in, uploads and shared data.

### Trying the confirmation e-mail
No mail account needed, and nothing leaves the machine:

```bash
docker compose --profile mail up -d
```

Then in `.env`:

```
MAIL_MODE=smtp
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_STARTTLS=0
MAIL_FROM=Botswana National Museum <no-reply@example.org>
```

```bash
docker compose up -d && docker compose restart api
```

> **A changed `.env` needs `up -d`, not `restart`.** The API reads its settings from the
> container's environment, and Compose sets that **when the container is created** (`env_file: .env`
> in `docker-compose.yml`); the repository root is not mounted into the container, so there is no
> `.env` file in there to re-read. `docker compose restart api` therefore keeps the old values and
> looks exactly like "nothing happened". `docker compose up -d` recreates the container with the new
> ones; `docker compose exec api env | grep MAIL` says which values it actually has.

Book a visit, then open **http://localhost:8025**: the confirmation is there, with its code and the
link to the ticket. The same inbox catches the test message from Staff → Settings → E-mail. This is
also the honest way to show the museum what a visitor receives before anyone asks their IT for an
account.

`MAIL_MODE=outbox` is the smaller variant: messages are written to `MAIL_OUTBOX_DIR` as files
(`docker compose exec api sh -c 'ls -t /data/outbox | head'`), with no extra container. Keep that
directory out of `UPLOAD_DIR` — uploads are served at `/uploads`.

Both of those are local only, and `no-reply@example.org` above is a placeholder for exactly that
reason. Real sending uses the project's own mailbox, `botswana-national-museum@gmx.net`; that
account, and why it is an interim arrangement rather than the destination, is in `doc/DEPLOY.md`.

### Showing the offline fallback
```bash
docker compose --profile demo up
```

`:8080` serves the frontend with **no API behind it**; `:8000` is the live site. Same
files, two origins — which is the honest way to demonstrate that the site still works if
the museum's connection drops during a presentation.

### After a schema change
`src/backend/sql/` runs **only when the database volume is empty**, so editing it does
nothing to a volume you already have. Two ways out, depending on whether you want your
local data back:

```bash
# throw the database away and rebuild it from src/backend/sql/
docker compose down -v && docker compose up --build
```

```bash
# or keep your objects, bookings and uploads: apply the migrations instead,
# oldest first, then restart the API (see the server section for why)
docker compose exec -T db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  < doc/migrations/2026-11-05-site-content.sql
docker compose restart api
```

`doc/migrations/README.md` lists every file and what it does.


## Running on the server

### One-time setup
```bash
git clone <repo> && cd ResearchCapstoneProject
cp .env.example .env
```

In `.env`:

1. fill `SESSION_SECRET` and `ADMIN_BOOTSTRAP_PASSWORD`, and change the MySQL passwords;
2. **uncomment** `COMPOSE_FILE=docker-compose.yml:compose.prod.yaml`;
3. set `PUBLIC_BASE_URL` to the address printed QR labels should carry — every new label
   follows it, with no code change;
4. set `COOKIE_SECURE=1` if you serve over HTTPS (see the bottom of `Caddyfile` for
   certificates on a bare IP, no domain needed).

```bash
docker compose up -d --build
docker compose logs api --tail=30     # must end in "Application startup complete"
```

A first boot runs `src/backend/sql/` against the empty volume, so the schema is correct
from the start and **no migrations are needed**.

### Deploying an update
Two things differ from a local run, and both have cost us a broken site already.

- **The database keeps its data.** `src/backend/sql/` runs only on an empty volume, so a
  schema change reaches a server that already has data **only** as a migration from
  `doc/migrations/`.
- **There is no `--reload`.** The source tree is a bind mount, so `git pull` changes the
  frontend visitors get *immediately*, while the API keeps running the old code until its
  container is restarted. In between, a new frontend talks to an old API.

`doc/DEPLOY.md` is the full procedure, including the backup to take first and the two-step HTTPS
switch. The short version, and the order that matters:

```bash
git pull

# every migration new since the last deploy, in the order doc/migrations/README.md
# lists them -- NOT a *.sql glob: they share a date, so alphabetical is a different
# order. Each one is safe to run twice.
docker compose exec -T db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  < doc/migrations/2026-11-05-slot-minutes.sql
# ... then site-content, booking-event, text-overrides

docker compose up -d --build        # restarts api on the new code
docker compose restart api          # the startup seeder must run AFTER the migration
docker compose logs api --tail=30   # must end in "Application startup complete"
```

The second restart is not redundant. The startup seeder runs once per process and
swallows its own failure — `main.py` prints `[startup] database not ready` and carries on
— so whatever it could not do against the old schema, such as creating the first staff
account, stays undone until the API starts again *after* the migration. `up -d --build`
only replaces a container when the image changed, which a database change does not.

### When the site comes up but pages stay empty
This is the signature of a skipped migration, and it is not obvious from the browser:
`GET /api/health` returns a static dict, so the frontend's probe reports "online", but the
next call fails. Every 5xx is mapped to "unreachable", so the site silently drops into
offline mode on every load.

```bash
docker compose logs api | grep -E "Unknown column|doesn't exist|\[startup\]"
```

Anything there means the database is behind the code. Apply the missing migrations, then
`docker compose restart api`.

### HTTPS
A booking sends the visitor's name, e-mail address and phone number, and the staff sign-in sends a
password; on plain HTTP both are readable by every network in between. Switch it on from the
server's `.env` — neither config file needs editing:

```
CADDY_CONFIG=Caddyfile.https
SITE_ADDRESS=138.2.190.25     # or the museum's domain, once there is one
COOKIE_SECURE=1
```

Then `docker compose up -d`. Caddy obtains the certificate itself and plain HTTP is redirected, so
QR codes already printed with an `http://` address keep working. Let's Encrypt issues certificates
for a bare IP only as short-lived ones, which is what the `tls` block in `Caddyfile.https` asks
for; with a domain name that block can go. `COOKIE_SECURE=1` without HTTPS would lock the staff out
of their own sign-in, so the two belong together.

### Going live
There is nothing left to switch. The site carried a demonstration until November 2026 — invented
bookings, a generated scan history, the prototype's exhibitions and themed tours, and a note on
several pages saying that none of it was real — and a **Going live** button in Staff → Settings
that deleted all of it in one step. That step has been applied to the code itself: the seeder no
longer creates any of those records, the notes are gone, and the button with them. A database that
was already running catches up with `doc/migrations/2026-11-06-remove-demonstration.sql`.

Everything that is the museum's was never part of it and is untouched: all 60 objects of the
*Art and Crafts of Botswana* catalogue (every one carries its catalogue page), the events from the
museum's own material, publications, texts, pictures, colours and fonts, visitor groups, settings,
staff accounts, and every booking a visitor actually made.

What still belongs to the step, because it is not the app's to change:

- **`SEED_ON_START=0`** once the museum's own content is in, so nothing is topped up behind them.

And set a **retention period** for booking data in Staff → Settings. It is 0 (keep) by default, because
no deployment should start deleting records on a number a developer picked; the privacy notice states
whichever is set.

### Backups
Nothing in this repository backs the database up — the museum's records live in one Docker volume.
A dump is one command, and restoring it is the reason to take it:

```bash
# on the server, keeps 14 days
docker compose exec -T db sh -c \
  'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines "$MYSQL_DATABASE"' \
  | gzip > ~/backups/bnm-$(date +%F).sql.gz
find ~/backups -name 'bnm-*.sql.gz' -mtime +14 -delete

# restoring
gunzip -c ~/backups/bnm-2026-11-06.sql.gz | docker compose exec -T db \
  sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
```

Uploaded images and PDFs are in the `uploads` volume, not in the dump: `docker run --rm -v
researchcapstoneproject_uploads:/data -v ~/backups:/out alpine tar czf /out/uploads-$(date +%F).tar.gz -C /data .`


## Content
The texts and images of the museum's previous website (DNMM) are in the app:
- `src/frontend/js/data/about.js`, `departments.js`, `explore.js`, `publications.js` hold the texts.
  Passages quoted from the museum's collaboration brief (October 2026) are marked in the file
  headers and must not be edited without the museum.
- `src/frontend/assets/img/` holds **every** image of the old site, including ones the website does
  not show (PSD sources, sprites, banners). `assets/img/web/` has web-sized copies of the very
  large photos; the originals stay next to the others.
- `src/frontend/assets/publications/` holds the brochures, the Zebra's Voice, the heritage trail
  maps, the Plant/Insect of the Month posters and event flyers. One PDF is 68 MB, above GitHub's
  50 MB warning — consider Git LFS before pushing more of these.
- The collection includes the 60 entries of the museum's catalogue *Art and Crafts of Botswana*
  (`BNM-ETH-0301`–`0357`, `BNM-ARC-0501`–`0503` in `assets/seed/objects.json`, photos in
  `assets/img/collection/acb/`). The catalogue gives no accession numbers, sizes or gallery
  locations, so those are placeholders to replace with the museum's register. Each record names
  its catalogue page (`catalogue`, a column added after the first release — see
  [After a schema change](#after-a-schema-change) when pulling onto an existing database).
- `assets/img/svg/` holds vector redraws of the old site's drawn graphics (the Cultural/Natural
  Heritage badges and the Botswana locator outline). Photos stay raster: converting a photo to SVG
  cannot add resolution — sharper photos have to come from the museum's originals.
- Maps use Leaflet (loaded from cdnjs) with OpenStreetMap tiles; positions are approximate unless
  the text gives coordinates (see the header of `explore.js`).

### The appearance kit
Staff → **Appearance** (admin only) is where the museum changes how the site looks, without us:

- the name and the line under it in the header;
- three colours — the museum colour, the colour of links and buttons, and an accent. Every tint,
  border and hover shade is derived from those three in `core/theme.js`, and a colour that carries
  text is darkened until it reaches WCAG AA on white, so a pale accent cannot turn into unreadable
  body text. The page shows each colour's contrast ratio while you pick it;
- the two typefaces (headings and interface, running text), either one of the faces the site
  carries or a `.woff2` the museum has a licence for. Nothing is ever loaded from a font service:
  the galleries have no reliable connection, and the site must not depend on a third party;
- the logo and the photograph on the home page, uploaded through the same pipeline as object
  photographs, with "back to the original" for both.

It also holds the **footer**: the department line, the address, the telephone line and the two
notes in the last row. The link columns next to them follow the site's own sections, so they stay
in step by themselves.

Every control previews on the page as you change it; only *Save* writes it. It is stored as
`theme.*` rows in the `setting` table — no schema change, and "reset" is a deleted row rather than
a remembered original. `GET /api/config` carries the result to every page load, so visitors see it
on their next load without a deployment.

### What else the staff area owns
- **Events** (`#/staff/events`, curators): add, edit, withdraw and delete events, with the
  speaker, a description and a flyer PDF. The events page splits on today's date by itself, so a
  past event needs no tidying up. The programme comes from `museum_event` through `GET /api/events`;
  offline the bundled programme is shown read-only.
- **Publications** (`#/staff/publications`, curators): add a publication to one of the existing
  sections with a title, a date, a cover picture and a PDF. It appears above the bundled items of
  that section. The bundled catalogue itself — the brochures, the Zebra's Voice issues and the
  Plant and Insect of the Month posters with their transcribed texts — stays as published and is
  deliberately not editable here.
- **Pictures** (`#/staff/images`, curators): replace any photograph the content pages show, and put
  the museum's own file back at any time. The list is scanned out of the content modules rather than
  hand-kept, so a photo added to a monument next year appears here by itself. Object photographs
  stay with the object; the logo and the home-page picture are in Appearance.
- **Texts** (`#/staff/texts`, curators): every text the site carries as content — page
  introductions, the history, the vision and mission, every monument, museum and trail, the
  publication sections. A few hundred of them, so the page is a search: pick a section, type a word,
  edit what comes back. "Back to the original" always works, because the museum's own wording stays
  in the site's modules underneath. Not editable on purpose: the words the interface is made of
  (buttons, table headings, step names) — a half-rewritten interface is worse than a fixed one.

### Booking an event
"Book" on an event leads to `#/tickets/event/<id>`: the ticket page says which event is being
booked, preselects that day and the slot the event starts in, and the booking carries the event to
the front desk, which sees "for &lt;the event&gt;" next to the code. An event on a closed day says so
instead of silently preselecting nothing. The visitor booking goes to `POST /api/bookings`, so the
code, the total and the capacity check come from the server — offline it still stays in the
browser, which is what the demo profile shows.


## Layout
```
README.md          this file
TODO.md            open questions for the museum
docker-compose.yml the stack: db + api (+ static, under the demo profile)
compose.prod.yaml  what the server adds on top; opted into via COMPOSE_FILE in .env
Caddyfile          the reverse proxy, server only -- plain HTTP
Caddyfile.https    the same over HTTPS; picked by CADDY_CONFIG in .env
doc/               ARCHITECTURE, SMOKE-TEST, THIRD-PARTY
doc/migrations/    one dated .sql per schema change, for databases with data
doc/prototype/     the original single-file prototype, kept for reference
src/frontend/      html/ css/ js/ assets/   (no build step)
src/backend/       FastAPI app + sql/
docker/            MySQL configuration
tools/             dev server (devserver.py) and one-off scripts
```

`doc/ARCHITECTURE.md` explains how it fits together and, more usefully, why the
non-obvious decisions were made that way. Read it before changing the data layer, the
inventory numbering or the auth.

`doc/SMOKE-TEST.md` is the checklist to run after touching the frontend — 17 routes and 29
interactions, with a console snippet that fingerprints every page so you can diff a change
against the prototype.

`doc/migrations/README.md` has the rules for writing a migration, and a table of the ones
that exist.


## Things that will otherwise cost you an afternoon
- **After changing anything in `src/backend/sql/`**, run `docker compose down -v`. Those
  scripts run only when the database volume is empty, so otherwise your change is silently
  ignored. A database that already holds data — the server, or a local volume you do not
  want to lose — needs the same change as a migration in `doc/migrations/`.
- **A blank or empty-looking page usually means the database is behind the code**, not a
  frontend bug. See [when the site comes up but pages stay
  empty](#when-the-site-comes-up-but-pages-stay-empty).
- **Do not apply migrations with a `*.sql` glob.** They share a date, so alphabetical order
  is not the intended order. Follow `doc/migrations/README.md`.
- **`SESSION_SECRET` must be the output of `openssl rand -hex 32`**, not the string
  `openssl rand -hex 32`. Nothing fails loudly if you paste the command.
- **Never name a compose file `compose.override.yaml`.** Compose applies that name
  automatically on every machine; the server's configuration belongs in `compose.prod.yaml`
  behind `COMPOSE_FILE`. The name is in `.gitignore`.
- **`002_reference_data.sql` must stay UTF-8 with no BOM.** The gallery names contain
  `·` (U+00B7) and the frontend matches on the exact string.
- **The prototype is not the app.** `doc/prototype/` is a reference copy; nothing loads
  from it.


## Status
Working: the collection database and search, timed-slot ticketing with real capacity
limits (admission is free, slot length and visitor groups are set in the staff area), QR labels and scan statistics, the Departments / Explore / Publications sections with the
content of the museum's previous website, the museum map, and the staff area with
sign-in, object CRUD, image upload and booking check-in.

Payment is taken at the front desk only; the site never charges online, by
decision rather than for lack of a provider.

E-mail works, and is off until the museum's mail account is in the server's `.env` (`MAIL_MODE`,
`SMTP_HOST`, user and password — `doc/DEPLOY.md` has the lines and a test button in the staff area).
Until then the ticket page promises no confirmation rather than claiming one was sent. A booking
confirmation carries the code, the day, the slot, the tickets, the event if there was one, and a link
to `#/ticket/<code>` — the same e-ticket with its QR code, looked up by the code alone.

Still simulated, and deliberately labelled as such in the interface: the newsletter, the audio guide,
Setswana, and the AR page. They are listed in one place, `FEATURES` in
`src/frontend/js/core/config.js`.

Open questions for the museum are in `TODO.md`.
