# ResearchCapstoneProject

Research Capstone Project created in collaboration with the National Museum of Botswana.

A website for the museum with online ticketing (timed slots), a searchable collection
database, QR-coded gallery labels, self-guided tours and a staff area for curators and the
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
python3 -m http.server 5173 -d src/frontend    # then open http://localhost:5173/html/
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

## Layout

```
doc/            README, TODO, ARCHITECTURE, SMOKE-TEST, THIRD-PARTY
doc/prototype/  the original single-file prototype, kept for reference
src/frontend/   html/ css/ js/ assets/   (no build step)
src/backend/    FastAPI app + sql/
docker/         MySQL configuration
tools/          one-off scripts
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
limits, QR labels and scan statistics, tours, the museum map, and the staff area with
sign-in, object CRUD, image upload and booking check-in.

Still simulated, and deliberately labelled as such in the interface: online payment (the
provider is not chosen yet — Orange Money, MyZaka, Smega and card are disabled
placeholders), e-ticket e-mail, the newsletter, the audio guide, Setswana, and the AR and
virtual-tour pages. They are listed in one place, `FEATURES` in
`src/frontend/js/core/config.js`.

Open questions for the museum are in `doc/TODO.md`.
