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
- Maps use Leaflet (loaded from cdnjs) with OpenStreetMap tiles; positions are approximate unless
  the text gives coordinates (see the header of `explore.js`).

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
  ignored.
- **`002_reference_data.sql` must stay UTF-8 with no BOM.** The gallery names contain
  `·` (U+00B7) and the frontend matches on the exact string.
- **The prototype is not the app.** `doc/prototype/` is a reference copy; nothing loads
  from it.


## Status
Working: the collection database and search, timed-slot ticketing with real capacity
limits, QR labels and scan statistics, the Departments / Explore / Publications sections with the
content of the museum's previous website, the museum map, and the staff area with
sign-in, object CRUD, image upload and booking check-in.

Still simulated, and deliberately labelled as such in the interface: online payment (the
provider is not chosen yet — Orange Money, MyZaka, Smega and card are disabled
placeholders), e-ticket e-mail, the newsletter, the audio guide, Setswana, and the AR and
virtual-tour pages. They are listed in one place, `FEATURES` in
`src/frontend/js/core/config.js`.

Open questions for the museum are in `doc/TODO.md`.
