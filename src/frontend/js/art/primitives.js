import { store } from '../state/store.js';
/* Geometry helpers shared by the SVG artwork generators. */

/* ------------------------------------------------------------------
   Illustrations (stand-ins until the museum's digitised photos arrive)
   All generated as inline SVG — no external images.
------------------------------------------------------------------- */
export const uid = (p) => p + (++store.uid);
export const f1 = (n) => Math.round(n * 10) / 10;
export const polar = (cx, cy, r, a) => [f1(cx + r * Math.cos(a)), f1(cy + r * Math.sin(a))];

export function ringTriangles(cx, cy, r0, r1, n, fill, offset = 0, inward = false) {
  let s = '';
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step + offset;
    const base0 = polar(cx, cy, inward ? r1 : r0, a);
    const base1 = polar(cx, cy, inward ? r1 : r0, a + step);
    const tip = polar(cx, cy, inward ? r0 : r1, a + step / 2);
    s += `<polygon points="${base0} ${base1} ${tip}" fill="${fill}"/>`;
  }
  return s;
}
export function ringDiamonds(cx, cy, r, len, n, fill, width = 0.07, offset = 0) {
  let s = '';
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step + offset;
    const p1 = polar(cx, cy, r - len / 2, a);
    const p2 = polar(cx, cy, r, a - width);
    const p3 = polar(cx, cy, r + len / 2, a);
    const p4 = polar(cx, cy, r, a + width);
    s += `<polygon points="${p1} ${p2} ${p3} ${p4}" fill="${fill}"/>`;
  }
  return s;
}
