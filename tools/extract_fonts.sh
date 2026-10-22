#!/usr/bin/env bash
# Decode the two base64 @font-face blobs out of the original single-file
# prototype into real .woff2 files. Run once; kept for provenance.
#
#   ./tools/extract_fonts.sh [path-to-prototype.html]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${1:-$ROOT/botswana-museum-prototype (1).html}"
OUT="$ROOT/src/frontend/assets/fonts"

[ -f "$SRC" ] || { echo "prototype not found: $SRC" >&2; exit 1; }
mkdir -p "$OUT"

# macOS/BSD base64 decodes with -D, GNU coreutils with -d.
if base64 -D </dev/null >/dev/null 2>&1; then D=(-D); else D=(-d); fi

extract() {          # $1 = source line number, $2 = output filename
  sed -n "${1}p" "$SRC" \
    | sed -E 's/^.*base64,//; s/\).*$//' \
    | tr -d '[:space:]' \
    | base64 "${D[@]}" > "$OUT/$2"
}

extract 10 archivo-variable.woff2
extract 12 source-serif-4-variable.woff2

# A truncated woff2 fails silently in the browser (it falls back to the
# default 100% width instance with no console error), so verify the magic.
for f in archivo-variable source-serif-4-variable; do
  magic=$(head -c 4 "$OUT/$f.woff2" | xxd -p)
  [ "$magic" = "774f4632" ] || { echo "$f.woff2: bad magic $magic (expected 774f4632 'wOF2')" >&2; exit 1; }
  printf '  %-32s %8s bytes  OK\n' "$f.woff2" "$(wc -c < "$OUT/$f.woff2" | tr -d ' ')"
done
