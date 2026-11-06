# Deploying to the server

The server runs the same `docker compose` stack as a laptop, with
`compose.prod.yaml` on top: Caddy in front on ports 80 and 443, the API
bound to loopback, MySQL bound to loopback. Nothing is built on the server
beyond the API image.

That second file is **not** applied on its own; the server opts in with
`COMPOSE_FILE=docker-compose.yml:compose.prod.yaml` in its `.env`. Every plain
`docker compose …` below therefore needs no `-f` flags, and a machine without
that line gets the development stack instead. `.env` is not committed, so a
`git pull` never restores it: `docker compose config | grep -c caddy` says
whether this machine is actually running the server's configuration.

Two things about it are easy to get wrong and both have cost us a broken site
already:

- **The database keeps its data.** `src/backend/sql/` runs only on an empty
  volume, so a schema change reaches a running server **only** as a migration
  from `doc/migrations/`.
- **There is no `--reload`.** The source tree is a bind mount, so `git pull`
  changes the frontend visitors get *immediately*, while the API keeps running
  the old code until its container restarts. In between, a new frontend talks
  to an old API.

Everything below is run in an SSH session on the server, in the project
folder (the one with `docker-compose.yml` in it).

## 0. Back up first

```bash
mkdir -p ~/backups
docker compose exec -T db sh -c \
  'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines "$MYSQL_DATABASE"' \
  | gzip > ~/backups/bnm-$(date +%F-%H%M).sql.gz
ls -lh ~/backups | tail -3
```

Uploaded pictures and PDFs live in a volume, not in the dump:

```bash
docker run --rm -v researchcapstoneproject_uploads:/data -v ~/backups:/out \
  alpine tar czf /out/uploads-$(date +%F).tar.gz -C /data .
```

## 1. Bring the code over

```bash
git status
git branch --show-current
```

The branch has to be the one that was merged (`main`, if the server follows
`main`). If `git status` shows local changes to `Caddyfile` or
`compose.prod.yaml` — both were created by hand on the server before they
were committed — put them aside, pull, and compare:

```bash
mv Caddyfile Caddyfile.local && mv compose.prod.yaml compose.prod.yaml.local
git pull
diff Caddyfile.local Caddyfile && diff compose.prod.yaml.local compose.prod.yaml \
  && echo "identical, the .local copies can go"
```

With a clean status, just `git pull`.

## 2. Migrations

All of them are idempotent, so running one that has already been applied does
nothing. Oldest first:

```bash
for m in doc/migrations/*.sql; do
  echo "== $m"
  docker compose exec -T db \
    sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' < "$m" || break
done
```

## 3. Restart and check

```bash
docker compose up -d --build
docker compose restart api          # the startup seeder must run AFTER the migrations
docker compose logs api --tail=30
```

The log must end in `Application startup complete` and must **not** contain
`database not ready`. Then, from the server itself (port 8000 is loopback
only):

```bash
curl -s -o /dev/null -w "config:       %{http_code}\n" http://localhost:8000/api/config
curl -s -o /dev/null -w "availability: %{http_code}\n" "http://localhost:8000/api/availability?days=3"
curl -s -o /dev/null -w "events:       %{http_code}\n" http://localhost:8000/api/events
curl -s -o /dev/null -w "publications: %{http_code}\n" http://localhost:8000/api/publications
```

Four times `200`. A `500` here means a migration did not run — check
`docker compose logs api` for `Unknown column` or a missing table.

## 4. HTTPS, in two steps

Do not switch the cookie and the certificate on together: if the certificate
fails while `COOKIE_SECURE=1`, the staff cannot sign in at all.

**First the certificate.** In `.env`:

```
CADDY_CONFIG=Caddyfile.https
SITE_ADDRESS=138.2.190.25
```

```bash
docker compose up -d
docker compose logs caddy --tail=40          # watch the ACME exchange
curl -sI https://138.2.190.25 | head -1      # expect HTTP/2 200
curl -sI http://138.2.190.25 | head -1       # expect 301 to https
```

Let's Encrypt issues certificates for a bare IP only as short-lived ones,
which is what the `tls` block in `Caddyfile.https` asks for. Caddy calls that
profile experimental, so if the log shows it failing, set `CADDY_CONFIG=Caddyfile`,
`docker compose up -d`, and the site is back on plain HTTP while you sort it
out — a domain name makes the whole block unnecessary.

**Then the cookie**, once HTTPS answers:

```
COOKIE_SECURE=1
PUBLIC_BASE_URL=https://138.2.190.25
```

```bash
docker compose up -d && docker compose restart api
```

`PUBLIC_BASE_URL` is what gets printed into new QR codes, so it should be the
address visitors will actually open. Labels printed earlier keep working: plain
HTTP is redirected.

## 5. E-mail

Nothing is sent until the museum's mail account is in the server's `.env`.
`MAIL_MODE=off` is the default, and the ticket page then promises no
confirmation -- so switching this on is a configuration step, not a code
change.

```
MAIL_MODE=smtp
MAIL_FROM=Botswana National Museum <botswana-national-museum@gmx.net>
MAIL_REPLY_TO=<the museum's own address>      # where a visitor's reply goes
SMTP_HOST=mail.gmx.net
SMTP_PORT=587
SMTP_USER=botswana-national-museum@gmx.net
SMTP_PASSWORD=…
SMTP_STARTTLS=1
```

```bash
docker compose up -d && docker compose restart api
```

`up -d` matters here and `restart` alone is not enough: the API reads its settings from the
container's environment, which Compose fills from `.env` **when the container is created**. A
restart keeps the old values. `docker compose exec api env | grep MAIL` shows what the container
really has.

Then **Staff → Settings → E-mail**, enter your own address and send the test
message. It says plainly what happened; if it did not go, the reason is in
`docker compose logs api` (a refused login and a blocked port look very
different there).

### The project address

The mailbox in use for now is `botswana-national-museum@gmx.net`, set up for
the project rather than belonging to a person, so that it can be handed over
or retired. Swapping it for the museum's own account later is a handful of
lines in `.env` plus `docker compose up -d`; nothing in the code knows which
account is behind it.

Two settings keep that handover painless:

- `MAIL_FROM` carries a display name, so visitors read
  `Botswana National Museum` rather than an address that looks like a
  stranger. It is one global setting for every message the site sends, so the
  name has to fit a newsletter as well as a ticket confirmation.
- `MAIL_REPLY_TO` should be the museum's own address as soon as there is one.
  A visitor who replies to a confirmation then reaches the museum, even while
  the sender is still the project's mailbox.

Two things about this mailbox in particular:

- GMX refuses SMTP logins until POP3/IMAP is switched on once in the
  mailbox's own settings. A refused login in `docker compose logs api` with
  credentials that are demonstrably correct is almost always this.
- `mail.gmx.net` is the host for a `gmx.net` or `gmx.de` address; GMX's
  international pages list `mail.gmx.com`. Both reach the same service.

### Why that stays an interim arrangement

A free mailbox cannot be domain-authenticated, and Brevo states the
consequence plainly: a free sender domain has no DKIM or DMARC of its own. So
a transactional provider buys very little for as long as the sender is
`@gmx.net` -- the warnings stay, and so does the mediocre deliverability.
What improves it is a sender address on the museum's own domain.

The ask of the museum is therefore two things, and the second is the one that
tends to stall:

1. a role address on `national-museum.gov.bw` -- `tickets@`, or `no-reply@`
   with `MAIL_REPLY_TO` pointing at a staffed address, and
2. whoever can add DNS records for that domain. Without those, SPF, DKIM and
   DMARC cannot be set up, and the site stays in free-mailbox mode however
   good the sending service is.

A Brevo account can be prepared before any of that: register it with the
project mailbox rather than a student's address, verify that address with the
code Brevo sends to it, send one test message, and put `.env` back. The move
to the museum's domain is then a sender change plus some DNS records, rather
than a first encounter with the tool.

Three things worth knowing before you ask the museum for an account:

- `MAIL_FROM` has to be an address the provider actually accepts, which is
  usually the same one as `SMTP_USER`.
- `MAIL_MODE=outbox` writes the messages to `MAIL_OUTBOX_DIR` as files
  instead of sending them. Useful for reading the wording, and for showing
  the museum what a visitor receives, without an account at all. Keep that
  directory out of `UPLOAD_DIR`: uploads are served at `/uploads`, so an
  outbox underneath it would publish every visitor's confirmation. Read them
  with `docker compose exec api sh -c 'ls -t /data/outbox | head'`.
- A message that cannot be sent never fails a booking: the visitor has their
  code and their ticket on screen either way, and the failure is logged.

## 6. Before the museum enters real records

In this order:

1. **Apply `doc/migrations/2026-11-06-remove-demonstration.sql`** if this
   database was created before November 2026. It deletes the records the
   project invented for the demonstration and drops what held them;
   `doc/ARCHITECTURE.md` lists what goes and what stays. A database created
   from `001_schema.sql` after that date never had them and needs nothing.
2. **Set a retention period** for booking data in Staff → Settings. 0 means
   keep; the privacy notice states whichever is set.
3. **`SEED_ON_START=0`**, so nothing is topped up behind the museum.

Step 3 is the one to do *after* the last presentation on this server, not
before it.

## 7. If something is wrong

The code can go back without touching the database — the migrations only add
columns and tables, and nothing that was deployed before them minds:

```bash
git log --oneline -5
git checkout <the commit that worked>
docker compose up -d --build && docker compose restart api
```

## 8. Keep doing this

A dump a day, kept for two weeks, in the server's crontab:

```cron
17 2 * * * cd /path/to/ResearchCapstoneProject && docker compose exec -T db sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines "$MYSQL_DATABASE"' | gzip > ~/backups/bnm-$(date +\%F).sql.gz && find ~/backups -name 'bnm-*.sql.gz' -mtime +14 -delete
```

Restoring is the reason to take them:

```bash
gunzip -c ~/backups/bnm-2026-11-06.sql.gz \
  | docker compose exec -T db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
docker compose restart api
```
