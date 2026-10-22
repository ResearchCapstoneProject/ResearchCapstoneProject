import { f1, polar, ringDiamonds, ringTriangles, uid } from './primitives.js';
import { $ } from '../core/dom.js';

/* The basket: coiled mokola palm with named pattern bands */
export function basketArt({ bg = '#EADFCB', size = 400, label = 'Coiled basket, top view' } = {}) {
  const c = 200;
  let rings = '';
  for (let r = 10; r <= 178; r += 6.5) rings += `<circle cx="${c}" cy="${c}" r="${f1(r)}" fill="none" stroke="#B98F57" stroke-width="1.1" opacity=".75"/>`;
  return `<svg viewBox="0 0 400 400" role="img" aria-label="${label}">
    ${bg ? `<rect width="400" height="400" fill="${bg}"/>` : ''}
    <circle cx="${c}" cy="${c}" r="180" fill="#D9B882"/>
    ${rings}
    ${ringTriangles(c, c, 142, 170, 40, '#4A2E1D')}
    ${ringDiamonds(c, c, 118, 22, 30, '#7A3F1B', 0.075)}
    ${ringTriangles(c, c, 62, 90, 22, '#4A2E1D', 0.14, true)}
    <circle cx="${c}" cy="${c}" r="26" fill="#4A2E1D"/>
    <circle cx="${c}" cy="${c}" r="12" fill="#D9B882"/>
    <circle cx="${c}" cy="${c}" r="180" fill="none" stroke="#7E532A" stroke-width="7"/>
  </svg>`;
}

export function emblem() {
  const c = 24;
  return `<svg viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="23" fill="#121417"/>
    ${ringTriangles(c, c, 13, 21, 14, '#6DA9D2')}
    <circle cx="24" cy="24" r="11" fill="#fff"/>
    <circle cx="24" cy="24" r="4.5" fill="#121417"/>
  </svg>`;
}

export function rockArt(o = {}) {
  const fig = (x, y, s = 1, bow = true) => `
    <g transform="translate(${x} ${y}) scale(${s})" stroke="#8E3B1F" stroke-linecap="round" fill="none">
      <circle cx="0" cy="-34" r="6" fill="#8E3B1F" stroke="none"/>
      <line x1="0" y1="-27" x2="2" y2="4" stroke-width="5"/>
      <line x1="2" y1="4" x2="-9" y2="30" stroke-width="4"/>
      <line x1="2" y1="4" x2="14" y2="28" stroke-width="4"/>
      <line x1="0" y1="-20" x2="14" y2="-10" stroke-width="3"/>
      ${bow ? '<path d="M14,-28 Q30,-10 14,8" stroke-width="2.5"/>' : '<line x1="0" y1="-20" x2="-12" y2="-6" stroke-width="3"/>'}
    </g>`;
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Rock painting: eland and human figures">
    <rect width="400" height="400" fill="#C9A07A"/>
    <ellipse cx="80" cy="70" rx="110" ry="60" fill="#BE9470" opacity=".55"/>
    <ellipse cx="330" cy="330" rx="120" ry="80" fill="#B88C66" opacity=".5"/>
    <ellipse cx="300" cy="80" rx="70" ry="40" fill="#D4AE88" opacity=".6"/>
    <polyline points="0,250 60,238 110,262 170,252" fill="none" stroke="#A67A55" stroke-width="2" opacity=".7"/>
    <polyline points="250,40 272,90 262,140" fill="none" stroke="#A67A55" stroke-width="2" opacity=".6"/>
    <g fill="#8E3B1F">
      <ellipse cx="200" cy="190" rx="80" ry="38"/>
      <ellipse cx="160" cy="166" rx="36" ry="24"/>
      <polygon points="136,178 104,132 122,120 166,160"/>
      <ellipse cx="104" cy="126" rx="18" ry="10" transform="rotate(-28 104 126)"/>
      <path d="M130,190 Q124,214 138,222 L150,206 Z"/>
    </g>
    <g stroke="#8E3B1F" stroke-linecap="round">
      <line x1="104" y1="118" x2="114" y2="86" stroke-width="3.5"/>
      <line x1="97" y1="120" x2="100" y2="88" stroke-width="3.5"/>
      <line x1="156" y1="218" x2="150" y2="292" stroke-width="8"/>
      <line x1="178" y1="222" x2="182" y2="296" stroke-width="8"/>
      <line x1="232" y1="222" x2="238" y2="292" stroke-width="8"/>
      <line x1="256" y1="216" x2="268" y2="288" stroke-width="8"/>
      <line x1="278" y1="182" x2="296" y2="220" stroke-width="3"/>
    </g>
    <ellipse cx="205" cy="200" rx="52" ry="14" fill="#EBD9C2" opacity=".7"/>
    ${fig(318, 312, 1)} ${fig(352, 322, 0.9)} ${fig(62, 330, 0.8, false)}
  </svg>`;
}

export function stoneToolArt() {
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Stone hand axe">
    <rect width="400" height="400" fill="#E6E1D8"/>
    <ellipse cx="200" cy="344" rx="84" ry="10" fill="#000" opacity=".08"/>
    <path d="M200,58 C258,92 292,204 272,292 C260,338 140,338 128,292 C108,204 142,92 200,58 Z" fill="#91877A"/>
    <g fill="#A29889"><polygon points="200,62 232,120 196,170 168,112"/><polygon points="160,190 204,228 180,300 136,270"/><polygon points="236,180 268,250 232,318 214,248"/></g>
    <g fill="#7D7467"><polygon points="232,120 262,190 236,180 196,170"/><polygon points="168,112 196,170 160,190 136,168"/><polygon points="204,228 236,180 214,248 180,300"/></g>
    <path d="M200,58 C258,92 292,204 272,292 C260,338 140,338 128,292 C108,204 142,92 200,58 Z" fill="none" stroke="#6C645A" stroke-width="2"/>
    <g font-family="Archivo, Arial, sans-serif" font-size="12" fill="#5E6770"><line x1="300" y1="370" x2="356" y2="370" stroke="#5E6770" stroke-width="2"/><line x1="300" y1="365" x2="300" y2="375" stroke="#5E6770" stroke-width="2"/><line x1="356" y1="365" x2="356" y2="375" stroke="#5E6770" stroke-width="2"/><text x="328" y="360" text-anchor="middle">5 cm</text></g>
  </svg>`;
}

export function beadsArt() {
  let b = '';
  const n = 36;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const [x, y] = polar(200, 196, 128, a);
    const [x2, y2] = [x, f1(196 + (y - 196) * 0.82)];
    b += `<circle cx="${x2}" cy="${y2}" r="11.5" fill="#F7EFE2" stroke="#B9A487" stroke-width="2"/><circle cx="${x2}" cy="${y2}" r="3" fill="#A58F70"/>`;
  }
  return `<svg viewBox="0 0 400 400" role="img" aria-label="String of ostrich eggshell beads">
    <rect width="400" height="400" fill="#E9DFCE"/>
    <ellipse cx="200" cy="196" rx="128" ry="105" fill="none" stroke="#7A5B3A" stroke-width="2"/>
    ${b}
    <path d="M200,301 q-6,30 -18,48 M200,301 q6,30 20,44" stroke="#7A5B3A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

export function potArt() {
  const id = uid('pc');
  let zig = '';
  for (let x = 80, up = true; x <= 320; x += 14, up = !up) zig += `${x},${up ? 152 : 172} `;
  let dots = '';
  for (let x = 96; x <= 304; x += 12) dots += `<circle cx="${x}" cy="186" r="2.6" fill="#5B2F18"/>`;
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Clay storage pot">
    <defs><clipPath id="${id}"><path d="M140,110 L260,110 L256,128 C330,160 338,262 280,318 C250,346 150,346 120,318 C62,262 70,160 144,128 Z"/></clipPath></defs>
    <rect width="400" height="400" fill="#E8D8C2"/>
    <ellipse cx="200" cy="340" rx="104" ry="12" fill="#000" opacity=".09"/>
    <path d="M140,110 L260,110 L256,128 C330,160 338,262 280,318 C250,346 150,346 120,318 C62,262 70,160 144,128 Z" fill="#9A5A36"/>
    <g clip-path="url(#${id})">
      <rect x="236" y="100" width="120" height="260" fill="#7E4426" opacity=".45"/>
      <rect x="60" y="100" width="46" height="260" fill="#7E4426" opacity=".3"/>
      <polyline points="${zig}" fill="none" stroke="#5B2F18" stroke-width="3.5" stroke-linejoin="round"/>
      ${dots}
    </g>
    <ellipse cx="200" cy="110" rx="60" ry="12" fill="#7A4027"/>
    <ellipse cx="200" cy="110" rx="49" ry="8" fill="#3A2016"/>
  </svg>`;
}

export function segabaArt() {
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Segaba, a one-string fiddle">
    <rect width="400" height="400" fill="#E9DCC6"/>
    <line x1="84" y1="336" x2="322" y2="70" stroke="#6B4226" stroke-width="11" stroke-linecap="round"/>
    <line x1="104" y1="300" x2="316" y2="80" stroke="#2A2A2A" stroke-width="1.6"/>
    <g transform="translate(126 290) rotate(-48)">
      <rect x="-44" y="-34" width="88" height="68" rx="6" fill="#A7ABAF"/>
      <rect x="-44" y="-34" width="88" height="68" rx="6" fill="none" stroke="#7E8387" stroke-width="2"/>
      <line x1="-44" y1="-14" x2="44" y2="-14" stroke="#8C9195" stroke-width="3"/>
      <line x1="-44" y1="14" x2="44" y2="14" stroke="#8C9195" stroke-width="3"/>
      <ellipse cx="44" cy="0" rx="8" ry="34" fill="#C3C6C9"/>
    </g>
    <path d="M150,110 Q280,120 338,258" fill="none" stroke="#6B4226" stroke-width="6" stroke-linecap="round"/>
    <line x1="152" y1="116" x2="334" y2="252" stroke="#D8CBB3" stroke-width="2"/>
    <circle cx="318" cy="76" r="8" fill="#4A2E1D"/>
  </svg>`;
}

export function stoolArt() {
  let notches = '';
  for (let x = 92; x <= 308; x += 18) notches += `<line x1="${x}" y1="164" x2="${x + 9}" y2="178" stroke="#4E2C17" stroke-width="2.5"/>`;
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Carved wooden stool">
    <rect width="400" height="400" fill="#E8DCCB"/>
    <ellipse cx="200" cy="330" rx="130" ry="16" fill="#000" opacity=".08"/>
    <polygon points="120,176 150,176 136,318 104,318" fill="#6E4125"/>
    <polygon points="250,176 280,176 296,318 264,318" fill="#6E4125"/>
    <polygon points="186,176 214,176 214,322 186,322" fill="#7A4A2A"/>
    <ellipse cx="200" cy="318" rx="110" ry="14" fill="#5F371F"/>
    <path d="M80,150 L80,172 C80,196 320,196 320,172 L320,150 Z" fill="#6E4125"/>
    <ellipse cx="200" cy="150" rx="120" ry="30" fill="#8A5530"/>
    <ellipse cx="200" cy="146" rx="96" ry="20" fill="#9A6239"/>
    ${notches}
  </svg>`;
}

export function paintingArt() {
  const id = uid('pa');
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Painting of a village kgotla at sunrise">
    <defs><clipPath id="${id}"><rect x="66" y="86" width="268" height="198"/></clipPath></defs>
    <rect width="400" height="400" fill="#EEF1F3"/>
    <rect x="44" y="306" width="312" height="10" fill="#000" opacity=".05"/>
    <rect x="50" y="70" width="300" height="230" fill="#3A2A1E"/>
    <g clip-path="url(#${id})">
      <rect x="66" y="86" width="268" height="198" fill="#EBC07A"/>
      <circle cx="274" cy="150" r="26" fill="#D0692E"/>
      <path d="M66,214 C120,188 170,200 214,190 C262,180 300,196 334,186 L334,284 L66,284 Z" fill="#9E7147"/>
      <rect x="66" y="232" width="268" height="52" fill="#B98E57"/>
      <rect x="146" y="176" width="8" height="64" fill="#3B2A1C"/>
      <ellipse cx="150" cy="172" rx="58" ry="14" fill="#3E4A2C"/>
      <g fill="#3B2A1C"><circle cx="118" cy="232" r="5"/><rect x="113" y="237" width="10" height="16"/><circle cx="140" cy="236" r="5"/><rect x="135" y="241" width="10" height="14"/><circle cx="170" cy="234" r="5"/><rect x="165" y="239" width="10" height="16"/><circle cx="192" cy="238" r="5"/><rect x="187" y="243" width="10" height="13"/></g>
      <rect x="250" y="222" width="36" height="24" fill="#C98A4B"/><polygon points="244,224 268,200 292,224" fill="#6B4E2E"/>
    </g>
    <rect x="170" y="324" width="60" height="14" fill="#D8DEE3"/>
  </svg>`;
}

export function tapestryArt() {
  let tassels = '';
  for (let x = 76; x <= 324; x += 8) tassels += `<line x1="${x}" y1="330" x2="${x}" y2="350" stroke="#8C4617" stroke-width="2"/>`;
  const cow = (x, y) => `<g transform="translate(${x} ${y})" fill="#4A2E1D"><rect x="0" y="0" width="44" height="20" rx="6"/><rect x="40" y="-6" width="14" height="12" rx="3"/><line x1="44" y1="-6" x2="40" y2="-14" stroke="#4A2E1D" stroke-width="3"/><line x1="52" y1="-6" x2="58" y2="-14" stroke="#4A2E1D" stroke-width="3"/><rect x="4" y="18" width="5" height="14"/><rect x="34" y="18" width="5" height="14"/></g>`;
  const hut = (x, y) => `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="46" height="34" fill="#B5652B"/><polygon points="-8,2 23,-26 54,2" fill="#4A2E1D"/><rect x="17" y="12" width="12" height="22" fill="#4A2E1D"/></g>`;
  const person = (x, y) => `<g transform="translate(${x} ${y})"><circle cx="0" cy="0" r="7" fill="#4A2E1D"/><polygon points="-12,34 0,8 12,34" fill="#1B5782"/></g>`;
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Woven tapestry showing village life">
    <rect width="400" height="400" fill="#E7DCCB"/>
    <rect x="60" y="50" width="280" height="8" rx="4" fill="#4A2E1D"/>
    <rect x="72" y="58" width="256" height="272" fill="#DCC6A2"/>
    <rect x="80" y="66" width="240" height="256" fill="none" stroke="#8C4617" stroke-width="6"/>
    <circle cx="270" cy="108" r="20" fill="#B5652B"/>
    <path d="M86,120 L130,120 M96,132 L150,132" stroke="#6DA9D2" stroke-width="6"/>
    ${hut(104, 168)} ${hut(186, 176)}
    <rect x="86" y="236" width="228" height="80" fill="#C9A06A"/>
    ${cow(106, 262)} ${cow(206, 272)}
    ${person(270, 196)} ${person(296, 204)}
    ${tassels}
  </svg>`;
}

export function zebraArt() {
  const id = uid('zb');
  let stripes = '';
  for (let x = 58, i = 0; x <= 350; x += 21, i++) stripes += `<path d="M${x},50 C${x + 22},140 ${x - 18},240 ${x + (i % 2 ? 8 : -6)},350" stroke="#1A1B1D" stroke-width="${i % 3 ? 11 : 14}" fill="none"/>`;
  const shape = 'M110,80 C150,96 250,96 290,80 L322,120 C302,160 302,240 322,280 L290,320 C250,304 150,304 110,320 L78,280 C98,240 98,160 78,120 Z';
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Zebra hide">
    <defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs>
    <rect width="400" height="400" fill="#E9E6DF"/>
    <path d="${shape}" fill="#FAF9F5"/>
    <g clip-path="url(#${id})">${stripes}</g>
    <path d="${shape}" fill="none" stroke="#CFC9BC" stroke-width="2"/>
  </svg>`;
}

export function locomotiveArt() {
  let sleepers = '';
  for (let x = 10; x < 400; x += 26) sleepers += `<rect x="${x}" y="304" width="14" height="6" fill="#8A7A62"/>`;
  const wheel = (cx, cy, r) => `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="#1F2326" stroke="#9E3527" stroke-width="4"/><line x1="${cx - r + 4}" y1="${cy}" x2="${cx + r - 4}" y2="${cy}" stroke="#555" stroke-width="2"/><line x1="${cx}" y1="${cy - r + 4}" x2="${cx}" y2="${cy + r - 4}" stroke="#555" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="4" fill="#9E3527"/></g>`;
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Steam locomotive">
    <rect width="400" height="400" fill="#DDEBF5"/>
    <rect y="300" width="400" height="100" fill="#E4D6BE"/>
    ${sleepers}
    <line x1="0" y1="302" x2="400" y2="302" stroke="#5B5B5B" stroke-width="3"/>
    <g fill="#fff" opacity=".85"><circle cx="126" cy="128" r="16"/><circle cx="104" cy="108" r="20"/><circle cx="76" cy="92" r="24"/></g>
    <rect x="128" y="146" width="20" height="46" fill="#1F2326"/><rect x="122" y="142" width="32" height="8" fill="#1F2326"/>
    <rect x="118" y="190" width="150" height="70" rx="12" fill="#1F2326"/>
    <rect x="96" y="196" width="32" height="60" rx="4" fill="#2B3034"/>
    <ellipse cx="200" cy="190" rx="15" ry="13" fill="#2B3034"/>
    <rect x="262" y="148" width="74" height="112" fill="#2B3034"/>
    <rect x="256" y="142" width="86" height="10" fill="#1F2326"/>
    <rect x="280" y="166" width="38" height="34" fill="#DDEBF5"/>
    <rect x="96" y="258" width="248" height="12" fill="#111"/>
    <polygon points="96,258 70,290 96,290" fill="#9E3527"/>
    ${wheel(112, 286, 13)} ${wheel(160, 280, 22)} ${wheel(214, 280, 22)} ${wheel(268, 280, 22)} ${wheel(320, 286, 14)}
    <line x1="160" y1="280" x2="268" y2="280" stroke="#8A8F94" stroke-width="5"/>
  </svg>`;
}

export function flagArt() {
  const x = 104, y = 76, w = 240, h = 160, u = h / 24;
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Flag of Botswana">
    <rect width="400" height="400" fill="#EEF1F3"/>
    <rect x="92" y="54" width="10" height="300" fill="#70757A"/>
    <circle cx="97" cy="52" r="8" fill="#A8AEB3"/>
    <rect x="72" y="348" width="50" height="10" fill="#70757A"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#6DA9D2"/>
    <rect x="${x}" y="${y + 9 * u}" width="${w}" height="${6 * u}" fill="#fff"/>
    <rect x="${x}" y="${y + 10 * u}" width="${w}" height="${4 * u}" fill="#121417"/>
    <rect x="${x + 70}" y="${y}" width="36" height="${h}" fill="#000" opacity=".05"/>
    <rect x="${x + 168}" y="${y}" width="30" height="${h}" fill="#fff" opacity=".08"/>
  </svg>`;
}

export function genericArt(o = {}) {
  const letter = (o.dept || 'O').slice(0, 1);
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Object without photo">
    <rect width="400" height="400" fill="#E3E8EC"/>
    <rect x="110" y="270" width="180" height="70" fill="#C7D0D7"/>
    <rect x="96" y="262" width="208" height="12" fill="#B3BEC6"/>
    <path d="M170,120 C150,150 150,230 176,262 L224,262 C250,230 250,150 230,120 Z" fill="#9FACB6"/>
    <rect x="176" y="104" width="48" height="18" rx="3" fill="#9FACB6"/>
    <text x="200" y="215" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-size="46" font-weight="800" fill="#E3E8EC">${letter}</text>
    <text x="200" y="372" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-size="14" fill="#5E6770">Photo to follow (digitisation)</text>
  </svg>`;
}
