"""Shared fixtures.

The environment is set here, before anything imports ``app``: ``app.config``
reads it once at import time into a module-level ``settings`` singleton, and
``app.db`` builds its engine from that. Importing the application first would
bind it to the developer's own .env and to /data.

``BNM_TEST_DB`` selects the database. The default is a throwaway SQLite file,
which is what the unit tests and most integration tests need. The pipeline
also runs the whole suite a second time against MySQL 8, because two things
this system relies on have no SQLite equivalent: ``SELECT ... FOR UPDATE``
(the slot capacity lock) and ``LAST_INSERT_ID()`` (inventory numbers). Tests
that need those carry ``@pytest.mark.mysql`` and are skipped elsewhere.
"""
import os
import tempfile
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

TMP = Path(tempfile.mkdtemp(prefix="bnm-tests-"))
DEFAULT_DB = f"sqlite+pysqlite:///{TMP / 'test.db'}"

os.environ.update(
    DATABASE_URL=os.environ.get("BNM_TEST_DB", DEFAULT_DB),
    UPLOAD_DIR=str(TMP / "uploads"),
    MAIL_OUTBOX_DIR=str(TMP / "outbox"),
    MAIL_MODE="outbox",
    SEED_ON_START="0",
    SESSION_SECRET="test-secret-0123456789abcdef",
    ADMIN_BOOTSTRAP_PASSWORD="",
    COOKIE_SECURE="0",
    PUBLIC_BASE_URL="http://testserver",
    SEARCH_MODE="like",
)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app import models  # noqa: E402
from app.db import Base, SessionLocal, engine  # noqa: E402
from app.security import hash_password  # noqa: E402

IS_MYSQL = engine.dialect.name == "mysql"


def pytest_collection_modifyitems(config, items):
    if IS_MYSQL:
        return
    skip = pytest.mark.skip(reason="needs MySQL 8 (FOR UPDATE / LAST_INSERT_ID)")
    for item in items:
        if "mysql" in item.keywords:
            item.add_marker(skip)


# --------------------------------------------------------------- reference data

# Tuesday to Friday 09:00-18:00, Saturday and Sunday 09:00-17:00, Monday shut.
# The schema counts weekdays like JavaScript: Sunday is 0.
HOURS = {0: (9, 17), 1: None, 2: (9, 18), 3: (9, 18), 4: (9, 18), 5: (9, 18),
         6: (9, 17)}

TICKETS = [
    # key, name, price in thebe, add-on
    ("res", "Admission", 0, False),
    ("intl", "Admission (international)", 5000, False),
    ("child", "Child", 2000, False),
    ("tour", "Guided tour", 1000, True),
]


def seed_reference(db) -> None:
    """The smallest set of rows the API needs to answer at all."""
    for weekday, rng in HOURS.items():
        db.add(models.OpeningHours(
            weekday=weekday,
            open_hour=None if rng is None else rng[0],
            close_hour=None if rng is None else rng[1],
        ))
    db.add(models.Holiday(md="09-30", label="Botswana Day", closed=True))
    for key, name, price, addon in TICKETS:
        db.add(models.TicketType(ticket_key=key, name=name, price_thebe=price,
                                 is_addon=addon, is_active=True))
    db.add(models.TicketType(ticket_key="old", name="Retired group",
                             price_thebe=9900, is_active=False))
    for code, name, order in (("ETH", "Ethnology", 1), ("ARC", "Archaeology", 2)):
        db.add(models.Department(code=code, name=name, sort_order=order))
    db.add(models.Room(id="g1", name="Main gallery", kind="gallery",
                       x=0, y=0, w=10, h=10))
    # Flushed before the rows that reference them: MySQL enforces the foreign
    # keys that SQLite leaves to the application.
    db.flush()
    for code in ("ETH", "ARC"):
        db.add(models.InventoryCounter(dept_code=code, next_seq=1))
    db.add(models.Location(id=1, label="Main gallery", room_id="g1",
                           is_store=False, sort_order=1))
    db.add(models.Location(id=2, label="Store A", room_id=None,
                           is_store=True, sort_order=2))
    for key, value in (("capacity_per_hour", "40"), ("slot_minutes", "60"),
                       ("booking_window_days", "14"), ("tour_times", "10,14"),
                       ("booking_retention_days", "0")):
        db.add(models.Setting(setting_key=key, value=value))
    db.commit()
    models.DEPT_NAMES.update({"ETH": "Ethnology", "ARC": "Archaeology"})


SCHEMA_SQL = Path(__file__).resolve().parents[1] / "sql" / "001_schema.sql"


@pytest.fixture(scope="session", autouse=True)
def schema():
    """Build the schema once, from the same DDL the server uses.

    On MySQL the schema comes from ``sql/001_schema.sql`` -- the file the
    database container applies on first boot -- so the suite exercises the
    production DDL, its CHECK constraints and its indexes, and not a second
    schema inferred from the ORM. That turned out to matter: SQLAlchemy makes
    a single-column integer primary key AUTO_INCREMENT on MySQL, so a
    metadata-built opening_hours silently rewrote Sunday (weekday 0) to 1.

    SQLite cannot read that file (it is MySQL-specific), so there the schema
    is built from the ORM metadata, which is adequate for the unit tests and
    for the portable integration tests.
    """
    _wipe_schema()
    _create_schema()
    yield
    _wipe_schema()


def _create_schema():
    if not IS_MYSQL:
        Base.metadata.create_all(engine)
        return
    with engine.begin() as conn:
        for statement in _statements(SCHEMA_SQL.read_text(encoding="utf-8")):
            conn.execute(text(statement))


def _statements(sql: str) -> list[str]:
    """Split a plain DDL script into executable statements.

    Comments are removed before splitting and quoted text is tracked, because
    the schema file contains both a ';' inside a trailing comment
    ("sha256(ip + daily salt); no raw IPs") and ';' characters inside string
    defaults. Splitting naively on ';' cuts those statements in half.

    The file holds no stored programs, so there are no DELIMITER blocks to
    worry about.
    """
    out, buf, quote, i = [], [], None, 0
    while i < len(sql):
        ch = sql[i]
        if quote:
            buf.append(ch)
            if ch == "\\" and i + 1 < len(sql):          # escaped character
                buf.append(sql[i + 1])
                i += 2
                continue
            if ch == quote:
                quote = None
            i += 1
            continue
        if ch in "'\"`":
            quote = ch
            buf.append(ch)
            i += 1
            continue
        if sql.startswith("--", i) or sql.startswith("#", i):
            newline = sql.find("\n", i)
            i = len(sql) if newline == -1 else newline
            continue
        if sql.startswith("/*", i):
            end = sql.find("*/", i)
            i = len(sql) if end == -1 else end + 2
            continue
        if ch == ";":
            out.append("".join(buf))
            buf = []
            i += 1
            continue
        buf.append(ch)
        i += 1
    out.append("".join(buf))

    statements = []
    for statement in out:
        statement = statement.strip()
        if not statement:
            continue
        # The file is also the database container's first-boot script, so it
        # creates and selects its own database. The test user owns one
        # database already and is connected to it.
        if statement.upper().startswith(("CREATE DATABASE", "USE ")):
            continue
        statements.append(statement)
    return statements


def _wipe_schema():
    """Drop every table.

    MySQL refuses to drop a table another table still references, and no
    single order satisfies every foreign key, so the constraints are switched
    off for the drop rather than an order being guessed.
    """
    if IS_MYSQL:
        with engine.begin() as conn:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
            for table in reversed(Base.metadata.sorted_tables):
                conn.execute(text(f"DROP TABLE IF EXISTS `{table.name}`"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
    else:
        Base.metadata.drop_all(engine)


def _empty_every_table():
    """Between tests: the schema stays, the rows go."""
    with engine.begin() as conn:
        if IS_MYSQL:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        if IS_MYSQL:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))


@pytest.fixture
def db(schema):
    """A session on an empty database carrying only the reference data."""
    _empty_every_table()
    session = SessionLocal()
    seed_reference(session)
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    """The real application, wired to the same throwaway database."""
    from app.main import app

    with TestClient(app) as c:
        yield c


# ------------------------------------------------------------------ staff users

PASSWORD = "correct horse battery staple"


@pytest.fixture
def users(db):
    """One account per role, all with the same password."""
    out = {}
    for role in ("admin", "curator", "frontdesk"):
        user = models.StaffUser(
            username=role, display_name=role.title(),
            password_hash=hash_password(PASSWORD), role=role, is_active=True,
        )
        db.add(user)
        out[role] = user
    db.commit()
    return out


@pytest.fixture
def sign_in(client, users):
    """Sign a role in and return a client carrying its cookies and CSRF header."""
    def _sign_in(role: str = "admin"):
        res = client.post("/api/auth/login",
                          json={"username": role, "password": PASSWORD})
        assert res.status_code == 200, res.text
        client.headers["X-CSRF-Token"] = client.cookies["bnm_csrf"]
        return client

    return _sign_in


# ----------------------------------------------------------------- test helpers

def next_weekday(target_js_dow: int, after: date | None = None) -> date:
    """The next date whose JS weekday (Sunday = 0) is ``target_js_dow``."""
    d = (after or date.today()) + timedelta(days=1)
    for _ in range(14):
        if (d.weekday() + 1) % 7 == target_js_dow:
            return d
        d += timedelta(days=1)
    raise AssertionError("unreachable")


@pytest.fixture
def open_day() -> date:
    """A Saturday inside the booking window: open 09:00-17:00, never today."""
    return next_weekday(6)


@pytest.fixture
def closed_day() -> date:
    """A Monday inside the booking window: the museum is shut."""
    return next_weekday(1)


def booking_payload(day: date, hour: int = 10, **over) -> dict:
    payload = {
        "date": day.isoformat(), "hour": hour, "minute": 0,
        "q": {"res": 2}, "name": "Kagiso Molefe",
        "email": "kagiso.molefe@example.com", "phone": "+267 71 000 000",
        "country": "Botswana", "agree": True,
    }
    payload.update(over)
    return payload


def make_booking(db, day: date, hour: int = 10, minute: int = 0,
                 visitors: int = 2, code: str = "BNM-TEST1",
                 status: str = "confirmed", **over) -> models.Booking:
    """A booking written straight to the database, bypassing the API."""
    fields = dict(
        code=code, visit_date=day, visit_hour=hour, visit_minute=minute,
        visitors=visitors, total_thebe=0, visitor_name="Test Visitor",
        email="test@example.com", phone="+267 70 000 000", country="Botswana",
        source="online", status=status,
    )
    fields.update(over)
    booking = models.Booking(**fields)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    # The refresh opens a fresh transaction, and InnoDB's REPEATABLE READ
    # would hold that snapshot for the rest of the test, hiding rows the
    # API commits afterwards on its own connection. Closing it here keeps
    # later reads through this session current on MySQL too.
    db.commit()
    return booking


def utc_naive(**delta) -> datetime:
    return (datetime.now(timezone.utc) + timedelta(**delta)).replace(tzinfo=None)
