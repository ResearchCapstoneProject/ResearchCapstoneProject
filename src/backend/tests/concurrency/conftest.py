"""A real HTTP server, for tests that need genuine concurrency.

TestClient runs the application in-process and serialises requests, which is
useless for a lock test. These tests therefore run uvicorn in a background
thread and fire simultaneous requests at it over TCP, exactly as Appendix~B
describes: "send the requests simultaneously to POST /api/bookings".
"""
import socket
import threading
import time

import httpx
import pytest
import uvicorn


def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="session")
def live_server(schema):
    from app.main import app

    port = _free_port()
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="error",
                            access_log=False)
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    base = f"http://127.0.0.1:{port}"
    deadline = time.monotonic() + 30
    while time.monotonic() < deadline:
        try:
            if httpx.get(f"{base}/api/health", timeout=1).status_code == 200:
                break
        except httpx.HTTPError:
            time.sleep(0.1)
    else:
        raise RuntimeError("the test server did not come up")

    yield base

    server.should_exit = True
    thread.join(timeout=10)
