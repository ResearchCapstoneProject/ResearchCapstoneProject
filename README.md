# ResearchCapstoneProject
Research Capstone Project created in collaboration with the National Museum of Botswana.

A website for the museum with online ticketing (timed slots), a searchable collection
database, QR-coded gallery labels, the museum's departments, publications and heritage sites
(Explore, with maps and heritage trails) and a staff area for curators and the
front desk.


## Run it
You need Docker. Nothing else — no Node, no local Python, no MySQL install.
```bash
cp .env.example .env
```
Then fill in two things in `.env`:
- `SESSION_SECRET` — `openssl rand -hex 32`
- `ADMIN_BOOTSTRAP_PASSWORD` — the first staff account's password
(and change the two MySQL passwords from their placeholders).
```bash
docker compose up --build
```
The site is at **http://localhost:8000**. The API docs are at
http://localhost:8000/docs. Sign in to the staff area at `#/staff` with
`ADMIN_BOOTSTRAP_USER` and the password you set.

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

### Showing the offline fallback
```bash
docker compose --profile demo up
```
`:8080` serves the frontend with **no API behind it**; `:8000` is the live site. Same
files, two origins — which is the honest way to demonstrate that the site still works if
the museum's connection drops during a presentation.


### Deploying an update to the server
The server runs the same stack with `compose.override.yaml` on top: Caddy in front on
port 80, nothing else published. Two things differ from a local run, and both have
cost us a broken site already.

- **The database keeps its data.** `src/backend/sql/` runs only on an empty volume, so
  a schema change reaches a server that already has data **only** as a migration from
  `doc/migrations/`.
- **There is no `--reload`.** The source tree is a bind mount, so `git pull` changes the
  frontend visitors get *immediately*, while the API keeps running the old code until
  its container is restarted. In between, a new frontend talks to an old API.

Deploy in this order and the three never disagree:
```bash
git pull
# every new file in doc/migrations/, oldest first; safe to run twice
docker compose exec -T db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  < doc/migrations/2026-11-05-slot-minutes.sql
docker compose up -d --build        # restarts api on the new code
docker compose restart api          # the startup seeder must run AFTER the migration
docker compose logs api --tail=30   # must end in "Application startup complete"
```
If the site comes up but pages stay empty, check `docker compose logs api` for
`Unknown column` — that is the migration step having been skipped.

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
Staff → Settings has a **Going live** section (admin only) that takes the demonstration out of the
site in one step. It deletes the records the project invented — the sample bookings
(`source='demo'`), the generated scan history (`source='seed'`) and what the staff area's simulate
button produced (`source='staff_demo'`), plus the prototype's exhibitions and themed tours, which no
page has rendered since Explore replaced them — and switches off every note that calls the site a
demonstration: the draft banner on the imprint and privacy pages, the sample-content line in the
footer, the wording in the staff area.

It keeps everything that is the museum's: all 60 objects of the *Art and Crafts of Botswana*
catalogue (every one carries its catalogue page, so none of them is sample content), the events from
the museum's own material, publications, rewritten texts, replaced pictures, colours and fonts,
visitor groups, settings, staff accounts, and every booking a visitor actually made. The deleted
records cannot be brought back; the notes can, for a presentation, with one click in the same place.

Two environment settings belong to the same step, because they are not the app's to change:

- **`DEMO_RESET_ENABLED=0`.** "Reset demo data" is the mirror image of going live: it deletes the
  real rows and keeps the invented ones, which is what makes it useful for a presentation and
  catastrophic afterwards. At 0 the API refuses it and the button is gone.
- **`SEED_ON_START=0`** once the museum's own content is in, so nothing is topped up behind them.

And set a **retention period** for booking data in the same page. It is 0 (keep) by default, because
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
  its catalogue page (`catalogue`, a new column — run `docker compose down -v` after pulling).
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
doc/            README, TODO, ARCHITECTURE, SMOKE-TEST, THIRD-PARTY
doc/prototype/  the original single-file prototype, kept for reference
src/frontend/   html/ css/ js/ assets/   (no build step)
src/backend/    FastAPI app + sql/
docker/         MySQL configuration
tools/          dev server (devserver.py) and one-off scripts
```
`doc/ARCHITECTURE.md` explains how it fits together and, more usefully, why the
non-obvious decisions were made that way. Read it before changing the data layer, the
inventory numbering or the auth.
`doc/SMOKE-TEST.md` is the checklist to run after touching the frontend — 17 routes and 29
interactions, with a console snippet that fingerprints every page so you can diff a change
against the prototype.


## Things that will otherwise cost you an afternoon
- **After changing anything in `src/backend/sql/`**, run `docker compose down -v`. Those
  scripts run only when the database volume is empty, so otherwise your change is silently
  ignored. A database that already holds data — the server, or a local volume you do not
  want to lose — needs the same change as a migration in `doc/migrations/`.
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

Still simulated, and deliberately labelled as such in the interface: e-ticket e-mail, the newsletter, the audio guide, Setswana, and the AR page. They are listed in one place, `FEATURES` in
`src/frontend/js/core/config.js`.

Open questions for the museum are in `doc/TODO.md`.
