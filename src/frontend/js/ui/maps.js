/* Interactive maps for the Explore and Visit pages.

   Leaflet is loaded from cdnjs the first time a page with a map is shown,
   and the tiles come from OpenStreetMap -- both need a connection anyway, so
   there is nothing to gain from bundling the library. If either fails, the
   plain list of places that ui/content.js rendered inside the box stays,
   with a link to OpenStreetMap for each. */
import { esc } from '../core/dom.js';

const LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4';
let loading = null;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${LEAFLET}/leaflet.min.css`;
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = `${LEAFLET}/leaflet.min.js`;
    js.onload = () => resolve(window.L);
    js.onerror = () => { loading = null; reject(new Error('Leaflet unavailable')); };
    document.head.appendChild(js);
  });
  return loading;
}

/* Marker colours follow the logo: blue for monuments and sites, orange for
   museums, dark for everything else. */
const COLOURS = { monuments: '#009BE4', 'world-heritage': '#009BE4', museums: '#E28E2C', trails: '#E28E2C' };
const pin = (L, kind) => L.divIcon({
  className: 'mappin',
  html: `<span style="background:${COLOURS[kind] || '#121417'}"></span>`,
  iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -10],
});

export function mountMaps(root = document) {
  const boxes = [...root.querySelectorAll('[data-map]')];
  if (!boxes.length) return;
  loadLeaflet().then((L) => {
    boxes.forEach((box) => {
      if (!document.contains(box) || box.dataset.mounted) return;
      box.dataset.mounted = '1';
      const pts = JSON.parse(box.dataset.map);
      box.innerHTML = '';
      const map = L.map(box, { scrollWheelZoom: false, attributionControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const ll = pts.map((p) => {
        const m = L.marker(p.pos, { icon: pin(L, p.kind), title: p.name, alt: p.name }).addTo(map);
        m.bindPopup(p.href ? `<a href="${esc(p.href)}">${esc(p.name)}</a>` : `<b>${esc(p.name)}</b>`);
        return p.pos;
      });
      if (ll.length === 1) map.setView(ll[0], 9);
      else map.fitBounds(ll, { padding: [36, 36], maxZoom: 11 });
    });
  }).catch(() => {
    boxes.forEach((b) => b.classList.add('offline'));
  });
}
