"""IT-07  GET /api/bookings/{code} -- the public e-ticket (FR-12).

The report verified this by looking at the page (TC-06). The page is not the
protection: the endpoint is public, because it is the link in the
confirmation e-mail, so the *response body* is what must not carry contact
data. Anyone who guesses a code gets whatever this returns.
"""
from tests.conftest import booking_payload

PRIVATE = ("kagiso.molefe@example.com", "+267 71 000 000", "Botswana")


def book(client, open_day):
    res = client.post("/api/bookings", json=booking_payload(open_day))
    assert res.status_code == 201
    return res.json()["code"]


def test_a_ticket_can_be_opened_again_with_its_code(client, open_day):
    code = book(client, open_day)
    res = client.get(f"/api/bookings/{code}")
    assert res.status_code == 200
    assert res.json()["code"] == code


def test_the_response_carries_no_email_address(client, open_day):
    code = book(client, open_day)
    body = client.get(f"/api/bookings/{code}").json()
    assert "email" not in body
    assert "kagiso.molefe@example.com" not in str(body)


def test_the_response_carries_no_phone_number(client, open_day):
    code = book(client, open_day)
    body = client.get(f"/api/bookings/{code}").json()
    assert "phone" not in body
    assert "+267 71 000 000" not in str(body)


def test_the_response_carries_no_country(client, open_day):
    code = book(client, open_day)
    assert "country" not in client.get(f"/api/bookings/{code}").json()


def test_no_private_field_appears_anywhere_in_the_raw_response(
        client, open_day):
    code = book(client, open_day)
    raw = client.get(f"/api/bookings/{code}").text
    for value in PRIVATE:
        assert value not in raw


def test_the_name_stays_because_it_is_printed_on_the_ticket(client, open_day):
    code = book(client, open_day)
    assert client.get(f"/api/bookings/{code}").json()["name"] == "Kagiso Molefe"


def test_the_ticket_shows_what_the_visitor_needs(client, open_day):
    code = book(client, open_day)
    body = client.get(f"/api/bookings/{code}").json()
    assert body["date"] == open_day.isoformat()
    assert body["hour"] == 10
    assert body["visitors"] == 2
    assert body["q"] == {"res": 2}
    assert body["checkedIn"] is False


def test_a_lowercase_code_from_a_mail_client_still_works(client, open_day):
    code = book(client, open_day)
    assert client.get(f"/api/bookings/{code.lower()}").json()["code"] == code


def test_an_unknown_code_is_not_found(client):
    res = client.get("/api/bookings/BNM-ZZZZZ")
    assert res.status_code == 404
    assert res.json()["detail"]["code"] == "not_found"


def test_the_staff_list_does_carry_the_contact_data(sign_in, client, open_day):
    """The front desk needs it; the public endpoint does not get it."""
    book(client, open_day)
    rows = sign_in("admin").get("/api/staff/bookings").json()
    assert rows[0]["email"] == "kagiso.molefe@example.com"
    assert rows[0]["phone"] == "+267 71 000 000"
