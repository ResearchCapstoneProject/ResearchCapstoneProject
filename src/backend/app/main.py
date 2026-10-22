"""Botswana National Museum -- API and static host."""
import mimetypes
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from .static import AppStatic

from .config import FRONTEND_DIR, settings
from .db import SessionLocal
from .models import DEPT_NAMES, Department
from .routers import bookings, config, health, objects, programme, scans
from .routers import auth as auth_router
from .routers.staff import router as staff_router

# Some slim images are missing these, and a stylesheet served as text/plain is
# ignored by the browser with no obvious error.
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("text/javascript", ".js")


@asynccontextmanager
async def lifespan(app: FastAPI):
    with SessionLocal() as db:
        try:
            DEPT_NAMES.update({d.code: d.name for d in db.query(Department).all()})
            if settings.seed_on_start:
                from . import seed
                seed.run(db)
                DEPT_NAMES.update({d.code: d.name for d in db.query(Department).all()})
        except Exception as exc:  # noqa: BLE001
            # A missing database should not stop the process: the frontend
            # falls back to offline mode, and /api/health reports the failure.
            print(f"[startup] database not ready: {exc}")
    yield


app = FastAPI(
    title="Botswana National Museum",
    version="0.1.0",
    lifespan=lifespan,
)

if settings.cors_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_list,   # never "*" -- cookies are credentialed
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

for r in (health.router, config.router, objects.router, programme.router,
          bookings.router, scans.router, auth_router.router, staff_router):
    app.include_router(r)


# --- static ---------------------------------------------------------------
# No SPA catch-all is needed: the router is hash-based, so every URL the
# browser asks for is "/" plus a fragment the server never sees.
settings.upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/css", AppStatic(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/js", AppStatic(directory=FRONTEND_DIR / "js"), name="js")
app.mount("/assets", AppStatic(directory=FRONTEND_DIR / "assets"), name="assets")
app.mount("/uploads", AppStatic(directory=settings.upload_dir), name="uploads")


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "html" / "index.html",
                        headers={"Cache-Control": "no-cache"})


@app.get("/o/{object_id}", include_in_schema=False)
def short_link(object_id: str) -> FileResponse:
    """Short URL for printed gallery labels.

    Serves the app; the hash fragment in the printed QR takes it to the
    object page. Kept separate from "/" so the path can later redirect or
    log without touching the SPA.
    """
    return FileResponse(FRONTEND_DIR / "html" / "index.html",
                        headers={"Cache-Control": "no-cache"})
