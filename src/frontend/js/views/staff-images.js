/* Replacing any picture the site ships with.

   The list is not hand-kept: it is scanned out of the content modules, which
   are the only place these paths exist. Add a photo to a monument next year
   and it shows up here by itself.

   Object photographs are not in this list -- those are managed on the object
   itself, where the caption and the order belong. The logo and the picture on
   the home page are in Appearance, because they are part of the look. */
import { staffShell } from './staff-shell.js';
import { toast } from '../ui/toast.js';
import { esc } from '../core/dom.js';
import { collectAssets, overrideFor } from '../core/assets.js';
import { ABOUT, ABOUT_PHOTOS, CONTACT, HISTORY, OPERATIONS } from '../data/about.js';
import { DEPARTMENTS } from '../data/departments.js';
import { SECTIONS } from '../data/explore.js';
import { PUB_TYPES } from '../data/publications.js';
import { isOnline } from '../data/repo.js';
import * as repo from '../data/repo.js';

const state = { loading: false, loaded: false };

/* Where each picture is used, so staff can find the one they mean. */
const GROUPS = [
  ['Visit and About', [ABOUT, ABOUT_PHOTOS, HISTORY, OPERATIONS, CONTACT]],
  ['Departments', [DEPARTMENTS]],
  ['Explore: monuments, museums, trails', [SECTIONS]],
  ['Publications: covers and posters', [PUB_TYPES]],
];

const fileName = (path) => path.split('/').pop();

function tile(path) {
  const replaced = overrideFor(path);
  const id = `im-${path.replace(/[^a-z0-9]+/gi, '-')}`;
  return `<div class="imtile${replaced ? ' on' : ''}">
    <div class="impic"><img src="${esc(replaced || path)}" alt="" loading="lazy"></div>
    <div class="imname" title="${esc(path)}">${esc(fileName(path))}</div>
    ${replaced ? '<div class="small" style="color:var(--ok)">replaced</div>' : ''}
    <div class="imacts">
      <label class="btn link" style="cursor:pointer">${replaced ? 'Replace again' : 'Replace'}
        <input type="file" accept="image/png,image/jpeg,image/webp" data-im-path="${esc(path)}" hidden ${isOnline() ? '' : 'disabled'}></label>
      ${replaced ? `<button class="btn link" type="button" data-act="im-reset" data-path="${esc(path)}" ${isOnline() ? '' : 'disabled'}>Original</button>` : ''}
    </div>
  </div>`;
}

export function pageStaffImages() {
  const groups = GROUPS.map(([label, sources]) => {
    const found = new Set();
    sources.forEach((s) => collectAssets(s, found));
    return [label, [...found].sort()];
  });
  const total = groups.reduce((n, [, list]) => n + list.length, 0);
  const replaced = groups.reduce(
    (n, [, list]) => n + list.filter((p) => overrideFor(p)).length, 0);

  const offline = !isOnline()
    ? `<p class="small" style="padding:12px 14px;background:var(--warn-soft);color:var(--warn);border-radius:4px">
         You are working offline, so pictures cannot be replaced from here.</p>`
    : '';

  const inner = `
    ${offline}
    <h2 class="h3" style="margin-bottom:6px">Pictures</h2>
    <p class="muted" style="margin:0 0 6px;max-width:72ch">Every photograph the website shows on its content pages,
      ${total} in all${replaced ? `, ${replaced} of them replaced` : ''}. Upload a new one and it takes the old one's
      place everywhere it appears — “Original” puts the museum's own file back, which is always still there.</p>
    <p class="small muted" style="margin:0 0 20px;max-width:72ch">Object photographs belong to the object itself, under
      Objects. The logo and the big picture on the home page are under Appearance.</p>

    ${groups.map(([label, list]) => `<section class="dsg-section">
      <h3 class="h4">${esc(label)} <span class="muted" style="font-weight:400">· ${list.length}</span></h3>
      <div class="imgrid">${list.map(tile).join('')}</div>
    </section>`).join('')}
  `;
  return staffShell('staff/images', inner);
}

/* The overrides already came down with GET /config, so there is nothing to
   fetch -- this only re-attaches the file inputs after a render. */
export async function bindImages(rerender) {
  if (!state.loaded && isOnline()) {
    state.loaded = true;
    try { await repo.listImageOverrides(); } catch (e) { /* the map is enough */ }
  }
  if (rerender) rerender();
  wireImages(rerender);
}

export function wireImages(rerender) {
  document.querySelectorAll('[data-im-path]').forEach((el) => {
    el.onchange = () => upload(el.dataset.imPath, el, rerender);
  });
}

async function upload(path, input, rerender) {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    await repo.setImageOverride(path, file);
    toast('Picture replaced. It is on the website now.');
  } catch (e) { toast(e.message || 'Could not use that image.'); }
  if (rerender) rerender();
  wireImages(rerender);
}

export async function resetImage(path, rerender) {
  try {
    await repo.clearImageOverride(path);
    toast('The museum’s own picture is back.');
  } catch (e) { toast(e.message || 'Could not put the original back.'); }
  if (rerender) rerender();
  wireImages(rerender);
}
