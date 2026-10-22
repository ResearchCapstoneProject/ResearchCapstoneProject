"""Model -> schema conversion shared by the public and staff routers."""
from ..models import MuseumObject
from ..schemas.objects import ImageOut, ObjectOut
from ..services import images


def object_out(o: MuseumObject) -> ObjectOut:
    return ObjectOut(
        id=o.id,
        art=o.art_key,
        dept=o.department,
        title=o.title,
        origin=o.origin,
        date=o.object_date,
        material=o.material,
        dims=o.dims,
        location=o.location.label if o.location else "",
        text=o.body,
        status=o.status,
        on_display=o.on_display,
        # ms since epoch, so the client's `added` sort keeps working unchanged
        added=int(o.added_at.timestamp() * 1000),
        seed=o.is_seed,
        images=[
            ImageOut(id=i.id, url=images.url_for(i.filename), position=i.position)
            for i in o.images
        ],
    )
