"""Static server for the frontend during development.

    python3 tools/devserver.py [port]      # then open http://localhost:5173/html/

`python -m http.server` sends Last-Modified but no Cache-Control, so browsers
apply heuristic caching and keep using old ES modules after a change. When a
module is deleted or renamed, a cached importer still asks for the old file,
the import fails, and the app shows a blank page. This sends
`Cache-Control: no-cache` (revalidate before use) for everything -- the same
rule src/backend/app/static.py applies to .js/.css/.html/.json -- so a normal
reload always runs the current code.
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src" / "frontend"


class NoCacheHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".mjs": "text/javascript",
                      ".webp": "image/webp", ".svg": "image/svg+xml"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    handler = partial(NoCacheHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("", port), handler) as httpd:
        print(f"Serving {ROOT} at http://localhost:{port}/html/")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
