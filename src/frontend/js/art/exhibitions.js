/* ---------- exhibition key visuals (800 × 600) ---------- */
export function exAt60() {
  let top = '', bot = '';
  for (let x = 0; x < 800; x += 40) {
    top += `<polygon points="${x},212 ${x + 40},212 ${x + 20},180" fill="#121417"/>`;
    bot += `<polygon points="${x},388 ${x + 40},388 ${x + 20},420" fill="#121417"/>`;
  }
  return `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Botswana at 60 key visual">
    <rect width="800" height="600" fill="#6DA9D2"/>
    <rect y="225" width="800" height="150" fill="#fff"/>
    <rect y="245" width="800" height="110" fill="#121417"/>
    ${top}${bot}
    <text x="400" y="322" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-size="64" font-weight="900" font-stretch="125%" fill="#fff" letter-spacing="2">1966 — 2026</text>
    <text x="400" y="120" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-size="28" font-weight="700" fill="#121417" letter-spacing="8">PULA</text>
  </svg>`;
}
export function exTsodilo() {
  const fig = (x, y) => `<g transform="translate(${x} ${y})" stroke="#F4E6D0" stroke-linecap="round" fill="none"><circle cx="0" cy="-26" r="5" fill="#F4E6D0" stroke="none"/><line x1="0" y1="-20" x2="1" y2="4" stroke-width="4"/><line x1="1" y1="4" x2="-8" y2="24" stroke-width="3"/><line x1="1" y1="4" x2="10" y2="22" stroke-width="3"/><line x1="0" y1="-14" x2="12" y2="-6" stroke-width="3"/></g>`;
  return `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Tsodilo Hills silhouette with rock art figures">
    <rect width="800" height="600" fill="#E3A96A"/>
    <circle cx="610" cy="170" r="70" fill="#F1C98E"/>
    <path d="M0,420 C80,400 120,250 200,210 C270,176 330,260 380,330 C420,380 460,350 500,300 C560,230 610,280 660,340 C710,400 760,410 800,405 L800,600 L0,600 Z" fill="#9C4E1E"/>
    <path d="M0,470 C120,440 220,430 330,450 C460,470 600,430 800,450 L800,600 L0,600 Z" fill="#6E3512"/>
    <g fill="#F4E6D0"><ellipse cx="220" cy="300" rx="34" ry="16"/><ellipse cx="196" cy="288" rx="14" ry="10"/><polygon points="186,294 170,270 178,264 198,284"/></g>
    <g stroke="#F4E6D0" stroke-width="4" stroke-linecap="round"><line x1="204" y1="312" x2="202" y2="340"/><line x1="236" y1="312" x2="240" y2="340"/></g>
    ${fig(290, 330)}${fig(312, 336)}
  </svg>`;
}
export function exArt() {
  return `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Paintings in the national art gallery">
    <rect width="800" height="600" fill="#ECEFF1"/>
    <rect y="470" width="800" height="130" fill="#C9B79C"/>
    <rect x="90" y="140" width="220" height="280" fill="#2F2A26"/><rect x="104" y="154" width="192" height="252" fill="#B5652B"/><circle cx="200" cy="250" r="54" fill="#EAD2A0"/><rect x="104" y="330" width="192" height="76" fill="#4A2E1D"/>
    <rect x="360" y="180" width="170" height="130" fill="#2F2A26"/><rect x="372" y="192" width="146" height="106" fill="#6DA9D2"/><rect x="372" y="262" width="146" height="36" fill="#121417"/>
    <rect x="580" y="120" width="140" height="190" fill="#2F2A26"/><rect x="592" y="132" width="116" height="166" fill="#EAD2A0"/><path d="M592,260 C630,220 670,250 708,210 L708,298 L592,298 Z" fill="#8C4617"/>
    <rect x="380" y="430" width="200" height="20" fill="#4A2E1D"/><rect x="396" y="450" width="10" height="40" fill="#4A2E1D"/><rect x="554" y="450" width="10" height="40" fill="#4A2E1D"/>
  </svg>`;
}
export function exKalahari() {
  return `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Kalahari dunes with acacia tree">
    <rect width="800" height="600" fill="#F2DDB6"/>
    <circle cx="220" cy="190" r="64" fill="#D0692E"/>
    <path d="M0,360 C160,300 300,330 420,300 C560,264 680,300 800,280 L800,600 L0,600 Z" fill="#D9A866"/>
    <path d="M0,440 C180,390 340,430 500,400 C620,378 720,400 800,390 L800,600 L0,600 Z" fill="#C98A4B"/>
    <path d="M0,520 C200,480 420,520 800,480 L800,600 L0,600 Z" fill="#B5652B"/>
    <rect x="596" y="250" width="10" height="90" fill="#3B2A1C"/><path d="M601,300 L570,262 M601,286 L632,256" stroke="#3B2A1C" stroke-width="6"/>
    <ellipse cx="600" cy="250" rx="92" ry="20" fill="#3E4A2C"/>
  </svg>`;
}

// Exhibition key visuals, resolved by name from EXHIBITIONS[].art.
// The prototype looked these up as globals on the window object, which stops
// working under module scope -- so the mapping is explicit.
