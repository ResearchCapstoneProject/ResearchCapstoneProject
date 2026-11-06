"""IT-09, IT-10  Authorisation across the whole staff area (NFR-09, FR-24).

The report verified this by *inspecting* that require_staff is attached to
the staff router rather than to each endpoint. These tests check it instead,
and they check it for every route the router carries -- including routes that
have not been written yet, because the parameter list is read off the
application at collection time. A new staff endpoint that forgets its
protection fails this suite.
"""
import re

import pytest

from app.config import settings

from tests.conftest import PASSWORD

# Plausible values, so a path parameter cannot be the reason a request fails.
PARAM_VALUES = {
    "code": "BNM-TEST1", "object_id": "BNM-ETH-0142", "event_id": "1",
    "pub_id": "1", "image_id": "1", "slot": "logo", "key": "res",
}


def staff_routes():
    from app.main import app

    out = []
    for route in app.routes:
        path = getattr(route, "path", "")
        if not path.startswith("/api/staff"):
            continue
        for method in sorted(getattr(route, "methods", set()) - {"HEAD", "OPTIONS"}):
            concrete = re.sub(r"\{(\w+)\}",
                              lambda m: PARAM_VALUES.get(m.group(1), "1"), path)
            out.append(pytest.param(method, concrete, id=f"{method} {path}"))
    return out


ROUTES = staff_routes()
WRITES = [p for p in ROUTES if p.values[0] != "GET"]


def test_the_sweep_actually_found_the_staff_endpoints():
    """Guards against a silently empty parameter list."""
    assert len(ROUTES) >= 40
    assert len(WRITES) >= 25


@pytest.mark.parametrize("method,path", ROUTES)
def test_no_staff_endpoint_answers_without_a_session(client, users, method, path):
    res = client.request(method, path)
    assert res.status_code == 401, f"{method} {path} answered {res.status_code}"


@pytest.mark.parametrize("method,path", ROUTES)
def test_no_staff_endpoint_accepts_an_invented_token(client, users, method, path):
    client.cookies.set(settings.cookie_name, "a" * 64)
    res = client.request(method, path)
    assert res.status_code == 401, f"{method} {path} answered {res.status_code}"


@pytest.mark.parametrize("method,path", WRITES)
def test_no_state_changing_endpoint_accepts_a_missing_csrf_token(
        client, users, method, path):
    """NFR-09: every state-changing staff request carries a CSRF token."""
    client.post("/api/auth/login", json={"username": "admin",
                                         "password": PASSWORD})
    res = client.request(method, path)      # no X-CSRF-Token header
    assert res.status_code == 403, f"{method} {path} answered {res.status_code}"


@pytest.mark.parametrize("method,path", WRITES)
def test_no_state_changing_endpoint_accepts_a_mismatched_csrf_token(
        client, users, method, path):
    client.post("/api/auth/login", json={"username": "admin",
                                         "password": PASSWORD})
    res = client.request(method, path, headers={"X-CSRF-Token": "not-the-cookie"})
    assert res.status_code == 403, f"{method} {path} answered {res.status_code}"


def test_a_read_only_request_needs_no_csrf_token(sign_in):
    client = sign_in("admin")
    del client.headers["X-CSRF-Token"]
    assert client.get("/api/staff/bookings").status_code == 200


# ------------------------------------------------------------- IT-10 the roles

def test_the_front_desk_may_check_a_visitor_in(sign_in, db, open_day):
    from tests.conftest import make_booking

    make_booking(db, open_day, 10, code="BNM-TEST1")
    client = sign_in("frontdesk")
    assert client.post("/api/staff/bookings/BNM-TEST1/check-in").status_code == 200


def test_a_curator_may_not_check_a_visitor_in(sign_in, db, open_day):
    from tests.conftest import make_booking

    make_booking(db, open_day, 10, code="BNM-TEST1")
    client = sign_in("curator")
    res = client.post("/api/staff/bookings/BNM-TEST1/check-in")
    assert res.status_code == 403
    assert "frontdesk" in res.json()["detail"]["message"]


def test_only_an_administrator_may_delete_a_booking(sign_in, db, open_day):
    from tests.conftest import make_booking

    make_booking(db, open_day, 10, code="BNM-TEST1")
    assert sign_in("frontdesk").delete(
        "/api/staff/bookings/BNM-TEST1").status_code == 403


def test_an_administrator_may_delete_a_booking(sign_in, db, open_day):
    from tests.conftest import make_booking

    make_booking(db, open_day, 10, code="BNM-TEST1")
    assert sign_in("admin").delete(
        "/api/staff/bookings/BNM-TEST1").status_code == 204


def test_an_administrator_passes_every_role_check(sign_in, db, open_day):
    """FR-24: the administrator role is not one role among three."""
    from tests.conftest import make_booking

    make_booking(db, open_day, 10, code="BNM-TEST1")
    client = sign_in("admin")
    assert client.post(
        "/api/staff/bookings/BNM-TEST1/check-in").status_code == 200
    assert client.post("/api/staff/bookings/purge").status_code == 200


def test_a_curator_may_not_run_the_retention_purge(sign_in):
    assert sign_in("curator").post(
        "/api/staff/bookings/purge").status_code == 403


def test_there_is_no_self_registration(client):
    """FR-24: accounts are created by an administrator only."""
    for path in ("/api/auth/register", "/api/auth/signup",
                 "/api/staff/users"):
        assert client.post(path, json={}).status_code in (404, 401, 405)
