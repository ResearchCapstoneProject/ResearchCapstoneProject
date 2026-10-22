"""Static file serving.

Starlette's StaticFiles sends `last-modified` and an `etag` but no
`Cache-Control`. Browsers then apply a heuristic freshness lifetime and will
happily serve a stale module for hours without revalidating -- which, with
uvicorn --reload and a frontend edited in place, means you change a file, hard
reload, and still run the old code. It is a genuinely confusing hour to lose.

`no-cache` does not mean "do not cache": it means "revalidate before use", so
the browser still gets a cheap 304 when nothing changed.

Fonts and uploaded images are content-addressed enough to cache properly --
uploads get a UUID filename, and the fonts change only when someone replaces
them deliberately.
"""
from starlette.staticfiles import StaticFiles
from starlette.types import Scope

REVALIDATE = {".js", ".mjs", ".css", ".html", ".json"}
IMMUTABLE = {".woff2", ".woff", ".ttf"}


class AppStatic(StaticFiles):
    def file_response(self, *args, **kwargs):
        response = super().file_response(*args, **kwargs)
        path = str(getattr(response, "path", ""))
        suffix = path[path.rfind("."):].lower() if "." in path else ""
        if suffix in REVALIDATE:
            response.headers["Cache-Control"] = "no-cache"
        elif suffix in IMMUTABLE:
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        else:
            response.headers["Cache-Control"] = "public, max-age=3600"
        return response
