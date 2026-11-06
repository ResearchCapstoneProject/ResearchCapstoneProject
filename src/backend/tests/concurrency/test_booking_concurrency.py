"""CT-01 to CT-04  Concurrency and load on the booking API (NFR-01, NFR-02).

These re-run the three tests of 21 October 2026 against the current backend.
The October run was invalidated by the move to configurable slot lengths,
which put the start minute of a slot into the locked index range, so the
tests are repeated here -- and this time as code, so they can be run again.

NFR-02 has two clauses, and they are asserted separately because they are not
equally well met:

  * the number of confirmed visitors in a slot must never exceed its
    capacity -- asserted strictly in every test below;
  * no request may fail with a server error -- counted and written to the
    evidence file rather than asserted, because a transaction aborted by an
    InnoDB deadlock still answers 500 until the retry recommended in
    Chapter~9 is implemented.

MySQL only: the capacity lock is SELECT ... FOR UPDATE, which SQLite ignores,
so on SQLite this suite would prove nothing.
"""
import concurrent.futures
import json
import statistics
import time
from datetime import date, datetime, timezone
from pathlib import Path

import httpx
import pytest

from app.models import Booking
from app.services.availability import put_setting

from tests.conftest import booking_payload, make_booking

pytestmark = pytest.mark.mysql

EVIDENCE = (Path(__file__).resolve().parents[4] / "doc" / "test-evidence")
RESULTS: list[dict] = []


def fire(base: str, payloads: list[dict]) -> list[dict]:
    """Send every payload at once and record status and elapsed time."""
    barrier = __import__("threading").Barrier(len(payloads))

    def one(payload):
        with httpx.Client(timeout=30) as client:
            barrier.wait()                      # release them together
            started = time.perf_counter()
            res = client.post(f"{base}/api/bookings", json=payload)
            elapsed = time.perf_counter() - started
        # A transaction aborted by a deadlock comes back as a plain-text 500,
        # not as JSON, so the body is decoded defensively: parsing it is not
        # what this test is about.
        try:
            body = res.json() if res.content else None
        except ValueError:
            body = res.text[:200]
        return {"status": res.status_code, "seconds": elapsed, "body": body}

    with concurrent.futures.ThreadPoolExecutor(max_workers=len(payloads)) as pool:
        return list(pool.map(one, payloads))


def confirmed(db, day: date, hour: int, minute: int = 0) -> int:
    db.commit()                                  # end this session's snapshot
    rows = db.query(Booking).filter(
        Booking.visit_date == day, Booking.visit_hour == hour,
        Booking.visit_minute == minute, Booking.status == "confirmed").all()
    return sum(r.visitors for r in rows)


def record(name: str, **data) -> None:
    RESULTS.append({"test": name, **data})


def summarise(results: list[dict]) -> dict:
    by_status: dict[str, int] = {}
    for r in results:
        by_status[str(r["status"])] = by_status.get(str(r["status"]), 0) + 1
    times = sorted(r["seconds"] for r in results)
    p95 = times[min(len(times) - 1, int(round(0.95 * len(times))) - 1)]
    return {"requests": len(results), "by_status": by_status,
            "p95_seconds": round(p95, 3),
            "max_seconds": round(times[-1], 3),
            "server_errors": sum(1 for r in results if r["status"] >= 500)}


# ------------------------------------------------- CT-01  the capacity lock

def test_ct01_thirty_simultaneous_requests_fill_a_slot_exactly(
        live_server, db, open_day):
    """Test 1 of 21 October, repeated.

    A slot with 16 free places of 40, then 30 simultaneous requests for two
    places each: eight must be accepted and the slot must end on exactly 40.
    """
    make_booking(db, open_day, 10, visitors=24, code="BNM-SEED1")
    assert confirmed(db, open_day, 10) == 24

    results = fire(live_server,
                   [booking_payload(open_day, hour=10, q={"res": 2})
                    for _ in range(30)])
    stats = summarise(results)
    total = confirmed(db, open_day, 10)
    record("CT-01", **stats, free_before=16, final_visitors=total, capacity=40)

    assert total <= 40, "the slot was oversold"
    assert total == 40, f"the slot did not fill: {total}"
    assert stats["by_status"].get("201") == 8
    assert stats["by_status"].get("409") == 22


def test_ct01b_no_request_is_both_rejected_and_written(
        live_server, db, open_day):
    """Accepted requests and stored visitors have to agree exactly."""
    results = fire(live_server,
                   [booking_payload(open_day, hour=11, q={"res": 2})
                    for _ in range(20)])
    stats = summarise(results)
    accepted = stats["by_status"].get("201", 0)
    total = confirmed(db, open_day, 11)
    record("CT-01b", **stats, final_visitors=total, capacity=40)

    assert total <= 40
    assert total == accepted * 2


# ----------------------------------------- CT-02  the empty-slot deadlock

def test_ct02_concurrent_first_bookings_never_oversell(
        live_server, db, open_day):
    """Test 3 of 21 October, repeated over five runs of ten requests.

    When a slot is still empty, the locking reads take next-key locks on the
    same empty index range, so concurrent inserts wait for one another and
    InnoDB aborts some of the transactions. The October run lost 21 of 50
    requests to server errors. The capacity invariant held then and is
    asserted here; the server errors are counted for the record.
    """
    hours = [9, 12, 13, 14, 15]
    runs, errors = [], 0
    for hour in hours:
        results = fire(live_server,
                       [booking_payload(open_day, hour=hour, q={"res": 1})
                        for _ in range(10)])
        stats = summarise(results)
        total = confirmed(db, open_day, hour)
        accepted = stats["by_status"].get("201", 0)
        errors += stats["server_errors"]
        runs.append({**stats, "hour": hour, "final_visitors": total})

        assert total <= 40, f"slot {hour}:00 was oversold ({total})"
        assert total == accepted, "a rejected request was written anyway"

    record("CT-02", runs=runs, requests=50,
           server_errors=errors,
           october_server_errors=21,
           note="capacity invariant held in every run")
    assert all(r["final_visitors"] <= 40 for r in runs)


# --------------------------- CT-03  the change that invalidated the old run

@pytest.mark.parametrize("length,minute", [(30, 30), (15, 45)])
def test_ct03_the_lock_still_holds_with_shorter_slots(
        live_server, db, open_day, length, minute):
    """The slot minute is now part of the locked range.

    This is the case the October tests could not cover, because slots were
    fixed at one hour then.
    """
    put_setting(db, "slot_minutes", str(length))
    db.commit()

    results = fire(live_server,
                   [booking_payload(open_day, hour=10, minute=minute,
                                    q={"res": 2}) for _ in range(25)])
    stats = summarise(results)
    total = confirmed(db, open_day, 10, minute)
    accepted = stats["by_status"].get("201", 0)
    record(f"CT-03 ({length} min)", **stats, slot_minutes=length,
           slot=f"10:{minute:02d}", final_visitors=total, capacity=40)

    assert total <= 40, "a short slot was oversold"
    assert total == accepted * 2


def test_ct03b_bookings_in_neighbouring_short_slots_do_not_interfere(
        live_server, db, open_day):
    """Two half-hour slots inside one hour are counted separately.

    Ten requests are fired at 13:00 and ten at 13:30 at the same moment. What
    is asserted is that each slot's stored visitors match the requests that
    slot accepted -- a booking must never be counted against the neighbouring
    slot, and neither slot may block the other outright. The absolute number
    accepted is not asserted: concurrent first bookings into an empty slot
    still lose some requests to deadlocks (CT-02).
    """
    put_setting(db, "slot_minutes", "30")
    db.commit()

    payloads = ([booking_payload(open_day, hour=13, minute=0, q={"res": 2})
                 for _ in range(10)]
                + [booking_payload(open_day, hour=13, minute=30, q={"res": 2})
                   for _ in range(10)])
    results = fire(live_server, payloads)
    stats = summarise(results)

    accepted_at = {0: 0, 30: 0}
    for r in results:
        if r["status"] == 201 and isinstance(r["body"], dict):
            accepted_at[r["body"]["minute"]] += 1

    first = confirmed(db, open_day, 13, 0)
    second = confirmed(db, open_day, 13, 30)
    record("CT-03b", **stats, slot_13_00=first, slot_13_30=second,
           accepted_13_00=accepted_at[0], accepted_13_30=accepted_at[30])

    assert first <= 40 and second <= 40
    assert first == accepted_at[0] * 2, "visitors landed in the wrong slot"
    assert second == accepted_at[30] * 2, "visitors landed in the wrong slot"
    # How many of the twenty are accepted is not asserted: with both slots
    # still empty, CT-02's deadlock decides that, and it is not deterministic.
    # The accepted counts are written to the evidence file instead.


# ------------------------------------------------------- CT-04  response time

def test_ct04_the_api_answers_within_the_required_two_seconds(
        live_server, db, open_day):
    """NFR-01: 95 % of booking requests answered within 2 s under 30 at once.

    Every slot is given one existing booking first. That is deliberate: it
    keeps the empty-slot deadlock of CT-02 out of the measurement, so this
    test times the booking path itself rather than the time taken to return
    an error. Test 2 of 21 October measured the same thing the same way, by
    spreading the requests over several slots.
    """
    for hour in range(9, 17):
        make_booking(db, open_day, hour, visitors=1,
                     code=f"BNM-S{hour:02d}ZZ")

    results = fire(live_server,
                   [booking_payload(open_day, hour=9 + (i % 8), q={"res": 1})
                    for i in range(30)])
    stats = summarise(results)
    record("CT-04 (bookings)", **stats, target_p95_seconds=2.0,
           note="one booking seeded per slot, so the measurement is not "
                "dominated by the CT-02 deadlock")

    assert stats["by_status"].get("201", 0) >= 27, stats
    assert stats["p95_seconds"] < 2.0, stats
    assert all(r["status"] != 409 for r in results)


def test_ct04b_availability_answers_within_two_seconds(live_server, db):
    """The other endpoint NFR-01 names, read by every visitor."""
    def one(_):
        with httpx.Client(timeout=30) as client:
            started = time.perf_counter()
            res = client.get(f"{live_server}/api/availability")
            return {"status": res.status_code,
                    "seconds": time.perf_counter() - started}

    with concurrent.futures.ThreadPoolExecutor(max_workers=30) as pool:
        results = list(pool.map(one, range(30)))
    stats = summarise(results)
    record("CT-04b (availability)", **stats, target_p95_seconds=2.0)
    assert stats["by_status"].get("200") == 30
    assert stats["p95_seconds"] < 2.0, stats


# ------------------------------------------------------------- the evidence file

@pytest.fixture(scope="session", autouse=True)
def write_evidence():
    yield
    if not RESULTS:
        return
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    out = EVIDENCE / "concurrency-results.json"
    out.write_text(json.dumps(
        {"run_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
         "database": "MySQL 8.0",
         "results": RESULTS}, indent=2) + "\n", encoding="utf-8")
    print(f"\n[evidence] {out}")
