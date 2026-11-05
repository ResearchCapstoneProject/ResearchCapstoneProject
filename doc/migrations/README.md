# Migrations

`src/backend/sql/001_schema.sql` is the schema. MySQL runs it only when the
data volume is empty, so it reaches a fresh database and nothing else.

Every schema change therefore gets written twice:

1. into `001_schema.sql`, so a new database is correct from the start, and
2. into a dated file here, so a database that already holds data can catch up.

Rules for a file in this folder:

- name it `YYYY-MM-DD-<what-it-does>.sql`;
- make it safe to run twice (check `information_schema` before an `ALTER`,
  use `INSERT ... ON DUPLICATE KEY UPDATE`);
- never delete data a running site still serves -- deactivate instead, the way
  the free-admission change deactivates the old visitor groups rather than
  dropping them, so existing bookings keep the price they were sold at.

Applying them on the server, oldest first:

```bash
docker compose exec -T db \
  sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  < doc/migrations/2026-11-05-slot-minutes.sql
```

Then restart the API, which does not reload by itself in a deployment:
`docker compose up -d --build`, followed by `docker compose restart api`.

The second command is not redundant. The startup seeder runs once per process
and swallows its own failure (`main.py` prints `[startup] database not ready`
and carries on), so whatever it could not do against the old schema -- create
the first staff account, among other things -- stays undone until the API
starts again *after* the migration. `up -d --build` only replaces a container
when the image changed, which a database change does not. `README.md` has the full deploy order.

| file | what it does |
| --- | --- |
| `2026-11-05-slot-minutes.sql` | `booking.visit_minute`, the `slot_minutes` setting, free admission as one visitor group |
| `2026-11-05-site-content.sql` | event fields (speaker, text, flyer), the `publication` table, the `image_override` table |
