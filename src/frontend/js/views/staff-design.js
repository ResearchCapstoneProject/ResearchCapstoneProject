/* The appearance kit: the museum changes how the site looks, without us.

   Three colours, two fonts, the logo, the picture on the home page and the
   wording in the masthead. Every control previews live -- the whole design
   hangs off CSS custom properties, so setting one variable restyles the page
   under the editor -- and only "Save" writes it to the server.

   Why so few knobs: a museum does not need eleven colour fields, it needs
   its logo blue and its orange to be right. The tints, hover shades and the
   readable version of the accent are derived in core/theme.js, which is also
   what keeps a well-meant pastel from becoming unreadable body text. */
import { emblem } from '../art/objects.js';
import { staffShell } from './staff-shell.js';
import { toast } from '../ui/toast.js';
import { $, esc } from '../core/dom.js';
import { contrastOnWhite, applyTheme, previewTheme, readable, THEME } from '../core/theme.js';
import { isOnline } from '../data/repo.js';
import * as repo from '../data/repo.js';

const state = { kit: null, loading: false };

const FIELDS = {
  siteName: '#d-name', siteTagline: '#d-tag',
  brand: '#d-brand', action: '#d-action', accent: '#d-accent',
  headingFont: '#d-hfont', bodyFont: '#d-bfont',
};

/* What the form currently says, whether or not it has been saved. */
function formValues() {
  const out = {};
  Object.entries(FIELDS).forEach(([key, sel]) => {
    const el = $(sel);
    if (el) out[key] = el.value;
  });
  return out;
}

function badge(ratio) {
  const ok = ratio >= 4.5;
  const large = !ok && ratio >= 3;
  const colour = ok ? 'var(--ok)' : large ? 'var(--warn)' : 'var(--full)';
  const label = ok ? 'AA for text' : large ? 'large text only' : 'too light for text';
  return `<span class="small" style="color:${colour}">${ratio.toFixed(1)}:1 · ${label}</span>`;
}

function colourRow(key, label, value, note) {
  const ratio = contrastOnWhite(value);
  const fixed = key === 'action' ? readable(value) : value;
  return `<div class="dsg-colour">
    <label for="d-${key}"><b>${esc(label)}</b><span class="small muted">${note}</span></label>
    <input id="d-${key}" type="color" value="${esc(value)}" data-dsg="colour" ${isOnline() ? '' : 'disabled'}>
    <code class="small">${esc(value)}</code>
    <span id="c-${key}">${badge(ratio)}</span>
    ${key === 'action' && fixed !== value
    ? `<span class="small muted">Shown as ${esc(fixed)} on the site, dark enough to read.</span>` : ''}
  </div>`;
}

function fontSelect(id, label, selected, fonts, note) {
  return `<div class="field">
    <label for="${id}">${esc(label)}</label>
    <select id="${id}" data-dsg="font" ${isOnline() ? '' : 'disabled'}>
      ${fonts.map((f) => `<option value="${esc(f.key)}" ${f.key === selected ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}
    </select>
    <span class="small muted">${esc(note)}</span>
  </div>`;
}

function imageBlock(slot, label, url, fallback, hint) {
  return `<div class="dsg-image">
    <div class="dsg-preview">${url
    ? `<img src="${esc(url)}" alt="">`
    : `<span class="small muted">${esc(fallback)}</span>`}</div>
    <div>
      <b>${esc(label)}</b>
      <p class="small muted" style="margin:2px 0 8px">${esc(hint)}</p>
      <div class="field"><label class="sr-only" for="d-${slot}">Upload a new ${esc(label.toLowerCase())}</label>
        <input id="d-${slot}" type="file" accept="image/png,image/jpeg,image/webp" data-dsg-img="${slot}" ${isOnline() ? '' : 'disabled'}></div>
      ${url ? `<button class="btn link" type="button" data-act="dsg-img-reset" data-slot="${slot}" ${isOnline() ? '' : 'disabled'}>Back to the original</button>` : ''}
    </div>
  </div>`;
}

export function pageStaffDesign() {
  const kit = state.kit;
  const t = kit ? kit.theme : THEME;
  const fonts = kit ? kit.fonts : [{ key: t.headingFont, name: 'Current font' }];

  const offline = !isOnline()
    ? `<p class="small" style="padding:12px 14px;background:var(--warn-soft);color:var(--warn);border-radius:4px">
         You are working offline, so the look can be read but not changed. Sign in to the live site to edit it.</p>`
    : '';

  const inner = `
    ${offline}
    <h2 class="h3" style="margin-bottom:6px">Appearance</h2>
    <p class="muted" style="margin:0 0 22px;max-width:70ch">Everything here is yours to change: the wording in the
      header, the museum's colours, the typefaces, the logo and the photograph on the home page. Changes preview on this
      page as you make them and reach visitors the moment you save.</p>

    ${kit === null ? '<p class="muted">Loading…</p>' : `
    <section class="dsg-section">
      <h3 class="h4">Name in the header</h3>
      <div class="formgrid" style="max-width:760px">
        <div class="field"><label for="d-name">Museum name</label>
          <input id="d-name" type="text" maxlength="120" value="${esc(t.siteName)}" data-dsg="text" ${isOnline() ? '' : 'disabled'}></div>
        <div class="field"><label for="d-tag">Line underneath</label>
          <input id="d-tag" type="text" maxlength="160" value="${esc(t.siteTagline)}" data-dsg="text" ${isOnline() ? '' : 'disabled'}></div>
      </div>
    </section>

    <section class="dsg-section">
      <h3 class="h4">Colours</h3>
      <p class="small muted" style="margin:0 0 14px;max-width:70ch">Three colours are enough: every lighter tint, border
        and hover shade on the site is calculated from them. The ratio behind each colour is its contrast against white —
        4.5:1 is the accessibility threshold for text, and the website uses the darkened version where a colour carries
        text.</p>
      ${colourRow('brand', 'Museum colour', t.brand, 'Header, highlights, the active menu item')}
      ${colourRow('action', 'Links and buttons', t.action, 'Anything a visitor clicks')}
      ${colourRow('accent', 'Accent', t.accent, 'Chips, quiet backgrounds, the second colour of the logo')}
    </section>

    <section class="dsg-section">
      <h3 class="h4">Typefaces</h3>
      <div class="formgrid" style="max-width:760px">
        ${fontSelect('d-hfont', 'Headings and interface', t.headingFont, fonts, 'Menu, buttons, headlines.')}
        ${fontSelect('d-bfont', 'Running text', t.bodyFont, fonts, 'Introductions, object descriptions, longer texts.')}
      </div>
      <div class="dsg-fontpreview" id="d-fontpreview">
        <p class="dsg-h" style="font-family:${t.headingStack}">Botswana at 60 · Tsodilo Hills</p>
        <p class="dsg-b" style="font-family:${t.bodyStack}">The rock paintings at Tsodilo were made over thousands of
          years, and the hills are still a place of prayer. 1234567890</p>
      </div>
      <details class="dsg-details">
        <summary>Use the museum's own font file</summary>
        <p class="small muted" style="max-width:70ch">A font the museum has a licence for, as a <b>.woff2</b> file —
          the compressed web format, usually a fifth of the size of a .ttf, which matters on a gallery connection.
          Nothing is loaded from a font service, so the site keeps working with no internet.</p>
        ${t.customFontUrl
    ? `<p class="small">In use: <b>${esc(t.customFontName)}</b>
           <button class="btn link" type="button" data-act="dsg-font-reset" ${isOnline() ? '' : 'disabled'}>Remove it</button></p>`
    : ''}
        <div class="formgrid" style="max-width:620px">
          <div class="field"><label for="d-fontname">Name of the typeface</label>
            <input id="d-fontname" type="text" maxlength="60" placeholder="e.g. Museum Grotesk" value="${esc(t.customFontName)}" ${isOnline() ? '' : 'disabled'}></div>
          <div class="field"><label for="d-fontfile">Font file (.woff2)</label>
            <input id="d-fontfile" type="file" accept=".woff2,font/woff2" data-dsg-font ${isOnline() ? '' : 'disabled'}></div>
        </div>
      </details>
    </section>

    <section class="dsg-section">
      <h3 class="h4">Logo and photograph</h3>
      ${imageBlock('logo', 'Logo', t.logoUrl, 'The drawn emblem', 'Square works best. PNG with a transparent background, JPEG or WebP.')}
      ${imageBlock('hero', 'Picture on the home page', t.heroUrl, 'The museum building', 'Wide, at least 1600 pixels across. Large files are resized on upload.')}
    </section>

    <div class="dsg-actions">
      <button class="btn primary" type="button" data-act="dsg-save" ${isOnline() ? '' : 'disabled'}>Save appearance</button>
      <button class="btn ghost" type="button" data-act="dsg-discard">Discard changes</button>
      <button class="btn link" type="button" data-act="dsg-reset" style="color:var(--full)" ${isOnline() ? '' : 'disabled'}>Reset everything to the original design</button>
    </div>`}
  `;
  return staffShell('staff/design', inner);
}

/* ---- loading and the live preview ---- */

export async function bindDesign(rerender) {
  if (state.loading) return;
  state.loading = true;
  try {
    state.kit = await repo.getTheme();
  } catch (e) {
    toast('Could not load the appearance settings.');
    state.kit = state.kit || { theme: { ...THEME }, defaults: { ...THEME }, fonts: [], contrast: {} };
  } finally {
    state.loading = false;
  }
  if (rerender) rerender();
  wireDesign(rerender);
}

export function invalidateDesign() { state.kit = null; }

/* The file inputs and the live preview are wired here rather than through the
   delegated listeners in events/bind.js, because this page re-renders itself
   after every save and the handlers have to come back with it. */
export function wireDesign(rerender) {
  document.querySelectorAll('[data-dsg]').forEach((el) => {
    el.oninput = () => preview();
  });
  document.querySelectorAll('[data-dsg-img]').forEach((el) => {
    el.onchange = () => uploadImage(el.dataset.dsgImg, el, rerender);
  });
  const font = $('#d-fontfile');
  if (font) font.onchange = () => uploadFont(rerender);
}

function fontStack(key) {
  const found = (state.kit && state.kit.fonts || []).find((f) => f.key === key);
  if (found && found.stack) return found.stack;
  if (key === 'custom' && state.kit) {
    const name = state.kit.theme.customFontName;
    if (name) return `"${name}", "Archivo", sans-serif`;
  }
  return THEME.headingStack;
}

/* Paints the page with the unsaved form values. */
export function preview() {
  const v = formValues();
  /* applyTheme writes the name and tagline into the masthead for us. */
  previewTheme({
    brand: v.brand, action: v.action, accent: v.accent,
    siteName: v.siteName, siteTagline: v.siteTagline,
    headingStack: fontStack(v.headingFont), bodyStack: fontStack(v.bodyFont),
  });

  Object.entries({ brand: v.brand, action: v.action, accent: v.accent }).forEach(([k, hex]) => {
    const out = $(`#c-${k}`);
    if (out) out.innerHTML = badge(contrastOnWhite(hex));
  });
  const h = $('#d-fontpreview .dsg-h');
  const b = $('#d-fontpreview .dsg-b');
  if (h) h.style.fontFamily = fontStack(v.headingFont);
  if (b) b.style.fontFamily = fontStack(v.bodyFont);
}

/* ---- actions, called from events/bind.js ---- */

export async function saveDesign(rerender) {
  const v = formValues();
  try {
    state.kit = await repo.updateTheme({
      siteName: v.siteName, siteTagline: v.siteTagline,
      brand: v.brand, action: v.action, accent: v.accent,
      headingFont: v.headingFont, bodyFont: v.bodyFont,
    });
    toast('Saved. Visitors see this on their next page load.');
  } catch (e) {
    toast(e.message || 'Could not save the appearance.');
  }
  if (rerender) rerender();
  wireDesign(rerender);
}

export function discardDesign(rerender) {
  if (state.kit) applyTheme(state.kit.theme);
  if (rerender) rerender();
  wireDesign(rerender);
}

export async function resetDesign(rerender) {
  if (!confirm('Put the colours, fonts, logo and photograph back to the original design?')) return;
  try {
    state.kit = await repo.resetTheme();
    paintLogo(state.kit.theme.logoUrl);
    toast('Back to the original design.');
  } catch (e) { toast(e.message || 'Could not reset the design.'); }
  if (rerender) rerender();
  wireDesign(rerender);
}

/* The masthead and the footer are outside #app, so a new or removed logo is
   swapped in by hand rather than waiting for the next page change. */
function paintLogo(url) {
  document.querySelectorAll('.brand').forEach((brand) => {
    const current = brand.querySelector('img.brandmark, svg');
    if (!current) return;
    current.outerHTML = url
      ? `<img class="brandmark" src="${esc(url)}" alt="" width="44" height="44">`
      : emblem();
  });
}

async function uploadImage(slot, input, rerender) {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    state.kit = await repo.uploadThemeImage(slot, file);
    if (slot === 'logo') paintLogo(state.kit.theme.logoUrl);
    toast(slot === 'logo' ? 'New logo in place.' : 'New photograph in place.');
  } catch (e) { toast(e.message || 'Could not use that image.'); }
  if (rerender) rerender();
  wireDesign(rerender);
}

export async function resetDesignImage(slot, rerender) {
  try {
    state.kit = await repo.resetThemeImage(slot);
    if (slot === 'logo') paintLogo(state.kit.theme.logoUrl);
    toast('Back to the original picture.');
  } catch (e) { toast(e.message || 'Could not reset the picture.'); }
  if (rerender) rerender();
  wireDesign(rerender);
}

async function uploadFont(rerender) {
  const input = $('#d-fontfile');
  const file = input && input.files && input.files[0];
  if (!file) return;
  try {
    state.kit = await repo.uploadThemeFont(file, ($('#d-fontname') || {}).value || '');
    toast('Font uploaded. Choose it above to use it.');
  } catch (e) { toast(e.message || 'Could not use that font file.'); }
  if (rerender) rerender();
  wireDesign(rerender);
}

export async function resetDesignFont(rerender) {
  try {
    state.kit = await repo.resetThemeFont();
    toast('Uploaded font removed.');
  } catch (e) { toast(e.message || 'Could not remove the font.'); }
  if (rerender) rerender();
  wireDesign(rerender);
}
