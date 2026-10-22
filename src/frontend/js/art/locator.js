/* Locator map: where in Botswana a place is, as a small inline SVG.

   Redrawn from the previous DNMM website's monument_map.gif (one raster per
   site). The outline is the same schematic polygon as
   assets/img/svg/botswana-outline.svg -- keep the two in step. The dot is
   placed from [lat, lng] with a linear fit to the dots the old site drew for
   Tsodilo, Lobatse, Kanye, Baines' Baobabs and Francistown (within a few
   pixels); the outline is schematic, so this shows the region, not the spot. */
import { esc } from '../core/dom.js';

const OUTLINE = '15,5 60,5 64,2 90,2 135,62 88,118 46,119 36,132 12,133 12,110 2,104 2,61 16,61';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function locatorXY([lat, lng]) {
  return [clamp(13.002 * lng + 1.667 * lat - 214.758, 8, 128), clamp(-0.093 * lng - 13.124 * lat - 224.033, 8, 126)];
}

export function locator(pos, label = '') {
  const [x, y] = locatorXY(pos);
  return `<svg class="locator" viewBox="-4 -4 148 144" role="img" aria-label="${esc(label ? `Location of ${label} in Botswana` : 'Location in Botswana')}">
    <polygon points="${OUTLINE}" fill="#FFFFFF" stroke="#0B0C0E" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#E28E2C" stroke="#0B0C0E" stroke-width="2"/>
  </svg>`;
}
