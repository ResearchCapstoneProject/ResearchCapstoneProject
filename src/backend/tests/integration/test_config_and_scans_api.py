"""IT-18, IT-19  GET /api/config and POST /api/scans
(FR-19, NFR-11, NFR-13)."""
from app.models import MuseumObject, ScanEvent
from app.services.availability import put_setting

SECRETS = ("test-secret-0123456789abcdef", "SESSION_SECRET", "password_hash")


# ------------------------------------------------------------- IT-19 the config

def test_the_config_answers(client):
    assert client.get("/api/config").status_code == 200


def test_the_config_carries_the_museum_s_visit_settings(client):
    body = client.get("/api/config").json()
    assert body["capacity"] == 40
    assert body["slotMinutes"] == 60
    assert body["bookingWindowDays"] == 14
    assert body["tourTimes"] == [10, 14]
    assert body["currency"] == "BWP"


def test_the_config_follows_a_change_in_the_staff_area(client, db):
    """NFR-13: these values are data, not code."""
    put_setting(db, "capacity_per_hour", "25")
    put_setting(db, "slot_minutes", "30")
    db.commit()
    body = client.get("/api/config").json()
    assert body["capacity"] == 25
    assert body["slotMinutes"] == 30


def test_the_config_carries_the_opening_hours_and_holidays(client):
    body = client.get("/api/config").json()
    assert body["hours"]["1"] is None            # Monday
    assert body["hours"]["6"] == [9, 17]         # Saturday
    assert body["holidays"]["09-30"] == "Botswana Day"


def test_only_active_visitor_groups_are_published(client):
    keys = {t["key"] for t in client.get("/api/config").json()["tickets"]}
    assert "res" in keys
    assert "old" not in keys                     # is_active = False


def test_the_config_tells_the_client_whether_email_works(client):
    assert client.get("/api/config").json()["emailEnabled"] is True


def test_the_config_never_leaks_a_secret(client):
    """It is a public, unauthenticated endpoint."""
    raw = client.get("/api/config").text
    for secret in SECRETS:
        assert secret not in raw


def test_the_config_does_not_expose_the_database_url(client):
    raw = client.get("/api/config").text.lower()
    assert "sqlite" not in raw and "mysql" not in raw
    assert "database_url" not in raw


def test_the_health_endpoint_answers(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


# -------------------------------------------------------------- IT-18 the scans

def an_object(db):
    db.add(MuseumObject(id="BNM-ETH-0142", dept_code="ETH", seq=142,
                        title="Basket", body="", status="published"))
    db.commit()


def test_a_scan_is_recorded(client, db):
    an_object(db)
    res = client.post("/api/scans", json={"objectId": "BNM-ETH-0142"})
    assert res.status_code == 201
    assert db.query(ScanEvent).count() == 1


def test_a_scan_of_an_unknown_object_is_not_found(client, db):
    assert client.post("/api/scans",
                       json={"objectId": "BNM-XXX-9999"}).status_code == 404


def test_no_raw_ip_address_is_ever_stored(client, db):
    """NFR-11: the system keeps no raw IP addresses."""
    an_object(db)
    client.post("/api/scans", json={"objectId": "BNM-ETH-0142"})
    row = db.query(ScanEvent).one()
    assert row.ip_hash is not None
    assert len(row.ip_hash) == 64
    assert "." not in row.ip_hash            # not an address in any form
    assert ":" not in row.ip_hash


def test_no_raw_user_agent_is_stored(client, db):
    an_object(db)
    client.post("/api/scans", json={"objectId": "BNM-ETH-0142"},
                headers={"User-Agent": "Mozilla/5.0 (iPhone)"})
    row = db.query(ScanEvent).one()
    assert "Mozilla" not in (row.ua_hash or "")
    assert len(row.ua_hash) == 64


def test_the_same_visitor_hashes_to_the_same_value_within_a_day(client, db):
    """So repeat scans of one label can be de-duplicated in the statistics."""
    an_object(db)
    for _ in range(2):
        client.post("/api/scans", json={"objectId": "BNM-ETH-0142"})
    hashes = {row.ip_hash for row in db.query(ScanEvent).all()}
    assert len(hashes) == 1


def test_a_visitor_scan_is_separated_from_a_staff_demonstration(client, db):
    """FR-19."""
    an_object(db)
    client.post("/api/scans", json={"objectId": "BNM-ETH-0142"})
    client.post("/api/scans", json={"objectId": "BNM-ETH-0142",
                                    "source": "staff_demo"})
    sources = sorted(r.source for r in db.query(ScanEvent).all())
    assert sources == ["qr", "staff_demo"]


def test_an_invented_source_is_filed_as_a_visitor_scan(client, db):
    an_object(db)
    res = client.post("/api/scans", json={"objectId": "BNM-ETH-0142",
                                          "source": "not-a-source"})
    assert res.json()["source"] == "qr"


def test_the_scan_statistics_need_a_session(client, db):
    assert client.get("/api/staff/stats/scans").status_code == 401
