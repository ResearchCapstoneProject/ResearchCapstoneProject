# Third-party components

## qrcode-generator

`src/frontend/js/vendor/qrcode.js` — QR Code Generator for JavaScript by **Kazuhiko Arase**,
MIT licence. Vendored verbatim from the original prototype (lines 645–2942 of
`doc/prototype/botswana-museum-prototype.html`); only the trailing UMD footer was replaced with an
ES module export. The MIT header comment must stay in the file.

Used by `js/core/qr.js` to render the QR codes on object labels and e-tickets.

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
compare the rendered width of the hero headline (545px at 1440px viewport).

## Python dependencies

See `src/backend/requirements.txt`. Notable: `cryptography` is not used directly — it is required
by PyMySQL to speak MySQL 8's default `caching_sha2_password` authentication.
