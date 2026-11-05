/* The appearance kit, applied at runtime.

   GET /api/config carries whatever the museum set in the staff area; this
   module turns it into CSS custom properties on :root, so one assignment
   restyles the whole site -- css/base/tokens.css already expresses every
   colour and face as a variable, and nothing has to be re-rendered.

   Staff choose three colours, not eleven. The tints, the hover shades and
   the readable version of the accent are derived here, which is the only
   way to guarantee that a colour picked for a logo cannot end up as pale
   text on a pale background. --ochre-ink in particular is darkened until it
   reaches WCAG AA against white, however light the chosen accent is. */

export const THEME = {
  siteName: 'Botswana National Museum',
  siteTagline: 'National Museum and Monuments · Gaborone',
  brand: '#009BE4',
  action: '#0072AB',
  accent: '#E28E2C',
  headingFont: 'archivo',
  bodyFont: 'archivo',
  headingStack: '"Archivo", "Helvetica Neue", Arial, sans-serif',
  bodyStack: '"Source Serif 4", Georgia, "Times New Roman", serif',
  logoUrl: '',
  heroUrl: '',
  customFontName: '',
  customFontUrl: '',
};

const HEX = /^#[0-9a-f]{6}$/i;

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
const toHex = ([r, g, b]) => `#${hex2(r)}${hex2(g)}${hex2(b)}`;

/* `amount` is how much white: 0.9 is a very light tint. */
export function mixWhite(hex, amount) {
  if (!HEX.test(hex)) return hex;
  return toHex(rgb(hex).map((c) => c + (255 - c) * amount));
}

export function darken(hex, amount) {
  if (!HEX.test(hex)) return hex;
  return toHex(rgb(hex).map((c) => c * (1 - amount)));
}

const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/* WCAG relative luminance, and the ratio against white. 4.5 is the AA
   threshold for body text, 3.0 for large text and UI borders. */
export function contrastOnWhite(hex) {
  if (!HEX.test(hex)) return 0;
  const [r, g, b] = rgb(hex).map((c) => channel(c / 255));
  return Math.round((1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05)) * 100) / 100;
}

/* The darkest the colour needs to be to be readable as text on white. */
export function readable(hex, target = 4.5) {
  let out = hex;
  for (let i = 0; i < 24 && contrastOnWhite(out) < target; i += 1) {
    out = darken(out, 0.08);
  }
  return out;
}

function fontFace(name, url) {
  const el = document.getElementById('bnm-theme-font')
    || Object.assign(document.createElement('style'), { id: 'bnm-theme-font' });
  el.textContent = name && url
    ? `@font-face{font-family:"${name}";src:url("${url}") format("woff2");`
      + 'font-weight:100 900;font-display:swap;}'
    : '';
  if (!el.parentNode) document.head.appendChild(el);
}

/* Applied before the first render (main.js boots the data layer first), so
   the site never flashes the default palette on the way to the museum's. */
export function applyTheme(theme) {
  if (theme) Object.keys(THEME).forEach((k) => {
    if (typeof theme[k] === 'string') THEME[k] = theme[k];
  });

  const root = document.documentElement;
  const set = (name, value) => root.style.setProperty(name, value);

  if (HEX.test(THEME.brand)) {
    set('--sky', THEME.brand);
    set('--sky-soft', mixWhite(THEME.brand, 0.88));
  }
  if (HEX.test(THEME.action)) set('--deep', readable(THEME.action));
  if (HEX.test(THEME.accent)) {
    set('--ochre', THEME.accent);
    set('--ochre-soft', mixWhite(THEME.accent, 0.9));
    set('--sand', mixWhite(THEME.accent, 0.8));
    /* The accent as text: AA on white whatever was picked. */
    set('--ochre-ink', readable(THEME.accent, 4.6));
  }

  set('--display', THEME.headingStack);
  set('--serif', THEME.bodyStack);
  fontFace(THEME.customFontName, THEME.customFontUrl);
  paintBrand();
}

/* The museum's name is markup, not a variable, so it is written into the
   masthead in place. Nothing happens at boot, when applyTheme runs before
   the shell exists; the shell then renders the name from THEME itself. The
   tagline is scoped to the masthead on purpose -- the footer's second line
   is the department, not the tagline. An uploaded logo's src is updated
   where the <img> is already there, which is what makes the staff area's
   live preview reach the header. */
function paintBrand() {
  const name = document.querySelector('.masthead .brand b');
  if (name) name.textContent = THEME.siteName;
  const tagline = document.querySelector('.masthead .brand span');
  if (tagline) tagline.textContent = THEME.siteTagline;
  if (THEME.logoUrl) {
    document.querySelectorAll('.brand img.brandmark').forEach((img) => {
      if (img.getAttribute('src') !== THEME.logoUrl) img.setAttribute('src', THEME.logoUrl);
    });
  }
}

/* Used by the staff area to show a change before it is saved, and to put it
   back when the editor is left without saving. */
export function previewTheme(patch) {
  applyTheme({ ...THEME, ...patch });
}
