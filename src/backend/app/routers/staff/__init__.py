"""Staff router.

require_staff is attached to the APIRouter itself rather than to each
endpoint, so a new route added here cannot accidentally ship unauthenticated.
That is the single most important line in this package.
"""
from fastapi import APIRouter, Depends

from ...deps import require_staff
from . import (
    bookings, events, images, objects, publications, settings, stats, texts,
    theme,
)

router = APIRouter(prefix="/api/staff", dependencies=[Depends(require_staff)])
router.include_router(objects.router)
router.include_router(bookings.router)
router.include_router(stats.router)
router.include_router(settings.router)
router.include_router(theme.router)
router.include_router(events.router)
router.include_router(publications.router)
router.include_router(images.router)
router.include_router(texts.router)
