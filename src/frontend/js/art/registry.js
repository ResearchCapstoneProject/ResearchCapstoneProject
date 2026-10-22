/* Maps an object/exhibition `art` key to its generator, and derives
   the detail-crop and in-gallery views from a base illustration. */
import { exArt, exAt60, exKalahari, exTsodilo } from './exhibitions.js';
import { basketArt, beadsArt, flagArt, genericArt, locomotiveArt, paintingArt, potArt, rockArt, segabaArt, stoneToolArt, stoolArt, tapestryArt, zebraArt } from './objects.js';
import { $, esc } from '../core/dom.js';

export const ART = { basket: basketArt, rockart: rockArt, stonetool: stoneToolArt, beads: beadsArt, pot: potArt, segaba: segabaArt, stool: stoolArt, painting: paintingArt, tapestry: tapestryArt, zebra: zebraArt, locomotive: locomotiveArt, flag: flagArt, generic: genericArt };

export const EX_ART = { exAt60, exTsodilo, exArt, exKalahari };
export function exArtwork(e) { return (EX_ART[e.art] || genericArt)(e); }

/* ---------- derived views: detail crop and gallery scene ---------- */
export function innerOf(svg) { return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''); }
export function cropArt(svg) { return svg.replace('viewBox="0 0 400 400"', 'viewBox="116 116 168 168"'); }
export function roomScene(svg, o = null) {
  return `<svg viewBox="0 0 400 400" role="img" aria-label="${esc(o && o.location ? `The object on display in ${o.location}` : 'The object on display in the gallery')}">
    <rect width="400" height="400" fill="#E6E8EA"/>
    <rect y="300" width="400" height="100" fill="#CFC7BA"/>
    <rect y="296" width="400" height="6" fill="#B6AE9F"/>
    <polygon points="148,0 252,0 316,296 84,296" fill="#FFF6DF" opacity=".5"/>
    <rect x="96" y="272" width="208" height="28" fill="#9BA3AA"/>
    <rect x="96" y="266" width="208" height="8" fill="#B4BBC1"/>
    <g transform="translate(104 80) scale(0.48)">${innerOf(svg)}</g>
    <rect x="104" y="80" width="192" height="192" fill="#BCD3E4" opacity=".16"/>
    <rect x="104" y="80" width="192" height="192" fill="none" stroke="#8E979F" stroke-width="3"/>
    <rect x="318" y="150" width="56" height="42" rx="2" fill="#fff" stroke="#C4C9CD"/>
    <rect x="324" y="158" width="32" height="5" fill="#8E979F"/><rect x="324" y="169" width="44" height="3" fill="#C4C9CD"/><rect x="324" y="176" width="38" height="3" fill="#C4C9CD"/>
    <g fill="#5E6770" opacity=".5"><circle cx="46" cy="214" r="17"/><path d="M24,300 C24,248 68,248 68,300 Z"/></g>
  </svg>`;
}


/* ---------------- object views (several images per object) -------- */
export function viewsOf(o) {
  if (o.images && o.images.length) {
    return o.images.map((src, i) => ({ html: `<img src="${src}" alt="${esc(o.title)}">`, cap: i === 0 ? 'Museum photo' : `Museum photo ${i + 1}` }));
  }
  const base = () => (ART[o.art] || ART.generic)(o);
  return [
    { html: base(), cap: 'Overall view' },
    { html: cropArt(base()), cap: 'Detail' },
    { html: roomScene(base(), o), cap: o.onDisplay ? `On display · ${o.location}` : 'Kept in the store' },
  ];
}

export function pic(o) { const src = (o.images && o.images[0]) || o.image; if (src) return `<img src="${esc(src)}" alt="${esc(o.title)}">`; return (ART[o.art] || ART.generic)(o); }
