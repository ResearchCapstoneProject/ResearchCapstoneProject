# Automated tests

474 tests in three levels. They run on every push through
`.github/workflows/ci.yml`, and that run history is the dated record that
they were executed.

```bash
# unit + the portable integration tests (no server, no database needed)
pip install -r src/backend/requirements.txt -r src/backend/tests/requirements-test.txt
pytest

# the whole suite, including the capacity lock and the concurrency tests
docker run -d --name bnm-test-mysql \
  -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=bnm_test \
  -e MYSQL_USER=bnm -e MYSQL_PASSWORD=bnm -p 3399:3306 mysql:8.0
BNM_TEST_DB="mysql+pymysql://bnm:bnm@127.0.0.1:3399/bnm_test?charset=utf8mb4" pytest
```

## The levels

| Level | Where | Tests | Needs |
| --- | --- | --- | --- |
| Unit | `src/backend/tests/unit` | 189 | nothing |
| Integration | `src/backend/tests/integration` | 277 | MySQL for 16 of them |
| Concurrency and load | `src/backend/tests/concurrency` | 8 | MySQL + a live server |

Results: **473 passed, 1 xfailed** on MySQL 8.0; **457 passed, 16 skipped,
1 xfailed** on SQLite. Statement coverage of `app` is 72 % overall and 90–100 %
on the modules the requirements turn on (`deps`, `security`, `routers/auth`,
`routers/staff/bookings`, `schemas/bookings`, `services/availability`,
`services/retention`, `services/inventory`, `services/privacy`).

## Why two databases

The default is a throwaway SQLite file, which is enough for the unit tests and
for most of the integration tests, and it keeps the suite runnable with no
services at all. Two things the system relies on have no SQLite equivalent:

- `SELECT ... FOR UPDATE`, the lock that stops a slot being oversold
  (`services/availability.remaining_for_update`). SQLite ignores the clause.
- `LAST_INSERT_ID()`, which makes inventory numbers atomic and monotonic
  (`services/inventory.allocate`).

Tests that need them carry `@pytest.mark.mysql` and are skipped elsewhere.
On MySQL the schema is built from `src/backend/sql/001_schema.sql` — the file
the database container applies on first boot — so the suite exercises the
production DDL rather than a second schema inferred from the ORM. That matters:
SQLAlchemy makes a single-column integer primary key `AUTO_INCREMENT` on MySQL,
and a metadata-built `opening_hours` silently rewrote Sunday (weekday 0) to 1.

## Findings

| # | Finding | Where | Status |
| --- | --- | --- | --- |
| F-01 | A booking that **omits** `agree` is accepted, so the house rules need not be accepted (FR-06). Pydantic v2 does not run field validators on default values; sending `agree=false` *is* refused. | `schemas/bookings.py` | open; recorded as a strict `xfail`, so the suite turns green by itself once fixed |
| F-02 | A public holiday is labelled but not blocked, and the server does not check the booking window (FR-01). | `routers/bookings.py` | known, already in the report |
| F-03 | Concurrent first bookings into an **empty** slot still fail with 500 after an InnoDB deadlock — 45 of 50 requests in `CT-02`, against 21 of 50 measured on 21 October 2026. The capacity was never exceeded in any run. | `services/availability.py` | open; the retry of go-live step 1 is now measurably more urgent |

## Evidence

`doc/test-evidence/concurrency-results.json` is written by the concurrency
suite on every run: per test the request count, the statuses, the 95th
percentile response time and the final occupancy of the slot. CI uploads it,
together with the JUnit XML and the coverage report, as build artefacts.
