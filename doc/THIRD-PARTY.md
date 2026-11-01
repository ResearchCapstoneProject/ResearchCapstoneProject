# Third-party components

## qrcode-generator

`src/frontend/js/vendor/qrcode.js` — QR Code Generator for JavaScript by **Kazuhiko Arase**,
MIT licence. Vendored verbatim from the original prototype (lines 645–2942 of
`doc/prototype/botswana-museum-prototype.html`); only the trailing UMD footer was replaced with an
ES module export. The MIT header comment must stay in the file.

Used by `js/core/qr.js` to render the QR codes on object labels and e-tickets.

## Leaflet and OpenStreetMap

The maps on the Explore and Visit & About pages use **Leaflet 1.9.4** (BSD-2-Clause), loaded at
runtime from cdnjs by `js/ui/maps.js` — not vendored, since the map tiles need a connection anyway.
Tiles are from **OpenStreetMap** (© OpenStreetMap contributors, ODbL); the attribution shown on
every map is required. The OSM tile servers are for light use only; if traffic grows, switch to a
commercial or self-hosted tile provider.

## Museum content

Texts, photographs and publications in `js/data/{about,departments,explore,publications}.js`,
`assets/img/` and `assets/publications/` belong to the Botswana National Museum (DNMM). Providing
them does not transfer copyright. The iNaturalist photo in the Insect of the Month draft
(`assets/img/natural-history/pix/insect-of-the-month-july-2025-image3.jpg`) is third-party and is
deliberately not shown on the website.

## Fonts

Both are **SIL Open Font License 1.1**, which requires the licence to travel with the files.

| Family | File | Axes |
|---|---|---|
| Archivo | `src/frontend/assets/fonts/archivo-variable.woff2` | weight 100–900, width 62%–125% |
| Source Serif 4 | `src/frontend/assets/fonts/source-serif-4-variable.woff2` | weight 200–900 |

Extracted from the base64 `@font-face` blobs in the prototype by `tools/extract_fonts.sh`.
Archivo's **width axis is load-bearing** — the headings set `font-stretch` between 62% and 125%.
A truncated or subset font falls back to the 100% instance silently, with no console error, so
`tools/extract_fonts.sh` verifies the WOFF2 magic bytes and the plan's regression check is to
compare the rendered width of the hero headline's second line, "National Museum" (789px at a
1440px viewport).

## Python dependencies

See `src/backend/requirements.txt`. Notable: `cryptography` is not used directly — it is required
by PyMySQL to speak MySQL 8's default `caching_sha2_password` authentication.
