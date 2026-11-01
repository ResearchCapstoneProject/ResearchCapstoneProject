import { esc } from './dom.js';
import qrcode from '../vendor/qrcode.js';

export function qrSVG(text, label = 'QR code') {
  try {
    const q = qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(); let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c},${r}h1v1h-1z`;
    return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="${esc(label)}"><rect width="${n}" height="${n}" fill="#fff"/><path d="${d}" fill="#121417"/></svg>`;
  } catch (e) {
    return `<svg viewBox="0 0 10 10" role="img" aria-label="QR code unavailable"><rect width="10" height="10" fill="#fff"/><text x="5" y="6" font-size="2" text-anchor="middle">QR</text></svg>`;
  }
}
