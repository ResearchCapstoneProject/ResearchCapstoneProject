/* Publications the museum adds itself.

   The catalogue the site ships with -- the thirteen brochures, the Zebra's
   Voice issues, the Plant and Insect of the Month posters with the texts
   transcribed from them -- is bundled content and is not editable here, on
   purpose: it is the museum's published material and not ours to overwrite.
   What this page does is add to a section, which is what the museum asked
   for: this year's brochure, the next issue, a new poster. */
import { staffShell } from './staff-shell.js';
import { toast } from '../ui/toast.js';
import { $, esc } from '../core/dom.js';
import { PUB_TYPES } from '../data/publications.js';
import { isOnline } from '../data/repo.js';
import * as repo from '../data/repo.js';

const state = { rows: null, loading: false };

const typeName = (key) => (PUB_TYPES.find((t) => t.key === key) || { title: key }).title;

function row(p) {
  return `<tr${p.published ? '' : ' class="muted"'}>
    <td>${p.thumb
    ? `<img src="${esc(p.thumb)}" alt="" style="width:64px;height:84px;object-fit:cover;border:1px solid var(--line)">`
    : '<span class="small muted">no cover</span>'}</td>
    <td><b>${esc(p.title)}</b>
      <div class="small muted">${esc(typeName(p.typeKey))}${p.date ? ` · ${esc(p.date)}` : ''}</div>
      ${p.href ? `<div class="small muted">links to ${esc(p.href)}</div>` : ''}</td>
    <td class="small">${p.pdf
    ? `<a href="${esc(p.pdf)}" target="_blank" rel="noopener">PDF</a>`
    : '<span class="muted">no PDF yet</span>'}</td>
    <td class="small">${p.published ? 'On the website' : 'Withdrawn'}</td>
    <td><div class="actions">
      <label class="btn link" style="cursor:pointer">${p.thumb ? 'Replace cover' : 'Add cover'}
        <input type="file" accept="image/png,image/jpeg,image/webp" data-pub-cover="${p.id}" hidden ${isOnline() ? '' : 'disabled'}></label>
      <label class="btn link" style="cursor:pointer">${p.pdf ? 'Replace PDF' : 'Add PDF'}
        <input type="file" accept="application/pdf,.pdf" data-pub-pdf="${p.id}" hidden ${isOnline() ? '' : 'disabled'}></label>
      <button class="btn link" type="button" data-act="pub-toggle" data-id="${p.id}" data-to="${p.published ? '0' : '1'}" ${isOnline() ? '' : 'disabled'}>${p.published ? 'Withdraw' : 'Publish'}</button>
      <button class="btn link" type="button" data-act="pub-del" data-id="${p.id}" style="color:var(--full)" ${isOnline() ? '' : 'disabled'}>Delete</button>
    </div></td>
  </tr>`;
}

export function pageStaffPublications() {
  const rows = state.rows;
  const offline = !isOnline()
    ? `<p class="small" style="padding:12px 14px;background:var(--warn-soft);color:var(--warn);border-radius:4px">
         You are working offline, so publications cannot be added from here.</p>`
    : '';

  const inner = `
    ${offline}
    <h2 class="h3" style="margin-bottom:6px">Publications</h2>
    <p class="muted" style="margin:0 0 18px;max-width:72ch">What you add here appears in the chosen section of the
      publications pages, above the items the site already carries. Those older ones — the brochures, the Zebra’s Voice
      issues and the Plant and Insect of the Month posters — stay as published and are not editable here.</p>

    <div class="tablewrap"><table class="data" style="min-width:860px">
      <thead><tr><th>Cover</th><th>Publication</th><th>File</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
      <tbody>${rows === null
    ? '<tr><td colspan="5" class="muted">Loading…</td></tr>'
    : (rows.length ? rows.map(row).join('')
      : '<tr><td colspan="5" class="muted">Nothing added yet.</td></tr>')}</tbody>
    </table></div>

    <form id="pubform" class="formgrid" style="margin-top:28px;max-width:860px" novalidate>
      <h3 class="h4" style="grid-column:1/-1;margin:0">Add a publication</h3>
      <div class="field"><label for="pb-type">Section *</label>
        <select id="pb-type" ${isOnline() ? '' : 'disabled'}>
          ${PUB_TYPES.map((t) => `<option value="${esc(t.key)}">${esc(t.title)}</option>`).join('')}
        </select></div>
      <div class="field"><label for="pb-date">Date on the item</label>
        <input id="pb-date" type="text" placeholder="Nov 2026" maxlength="64" ${isOnline() ? '' : 'disabled'}></div>
      <div class="field" style="grid-column:1/-1"><label for="pb-title">Title *</label>
        <input id="pb-title" type="text" maxlength="255" ${isOnline() ? '' : 'disabled'}></div>
      <div class="field" style="grid-column:1/-1"><label for="pb-href">Link to a page of this site (optional)</label>
        <input id="pb-href" type="text" placeholder="#/explore/monuments/tsodilo" maxlength="255" ${isOnline() ? '' : 'disabled'}>
        <span class="small muted">Shown as “About the place”. Has to start with #/ — only pages of this website.</span></div>
      <div class="actions" style="grid-column:1/-1">
        <button class="btn primary" type="submit" ${isOnline() ? '' : 'disabled'}>Add it</button>
        <span class="small muted">The cover picture and the PDF are added to the row afterwards.</span>
      </div>
    </form>`;
  return staffShell('staff/publications', inner);
}

export async function bindPublications(rerender) {
  if (state.loading) return;
  state.loading = true;
  try {
    state.rows = await repo.listPublicationsAdmin();
  } catch (e) {
    toast('Could not load the publications.');
    state.rows = state.rows || [];
  } finally {
    state.loading = false;
  }
  if (rerender) rerender();
  wirePublications(rerender);
}

export function wirePublications(rerender) {
  document.querySelectorAll('[data-pub-cover]').forEach((el) => {
    el.onchange = () => upload(el.dataset.pubCover, 'cover', el, rerender);
  });
  document.querySelectorAll('[data-pub-pdf]').forEach((el) => {
    el.onchange = () => upload(el.dataset.pubPdf, 'pdf', el, rerender);
  });
}

async function reload(rerender) {
  state.rows = null;
  await bindPublications(rerender);
}

export async function addPublication(rerender) {
  const title = $('#pb-title').value.trim();
  if (title.length < 2) { toast('Please give the publication a title.'); $('#pb-title').focus(); return; }
  try {
    await repo.createPublication({
      typeKey: $('#pb-type').value,
      title,
      date: $('#pb-date').value.trim(),
      href: $('#pb-href').value.trim(),
    });
    toast('Added. Now put the cover and the PDF on it.');
  } catch (e) { toast(e.message || 'Could not add the publication.'); }
  await reload(rerender);
}

async function upload(id, what, input, rerender) {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    await repo.uploadPublicationFile(Number(id), what, file);
    toast(what === 'cover' ? 'Cover picture in place.' : 'PDF in place.');
  } catch (e) { toast(e.message || 'Could not use that file.'); }
  await reload(rerender);
}

export async function togglePublication(id, published, rerender) {
  try {
    await repo.updatePublication(Number(id), { published });
    toast(published ? 'On the website.' : 'Withdrawn.');
  } catch (e) { toast(e.message || 'Could not change it.'); }
  await reload(rerender);
}

export async function deletePublication(id, rerender) {
  if (!confirm('Delete this publication? Its cover and PDF are deleted too.')) return;
  try {
    await repo.deletePublication(Number(id));
    toast('Deleted.');
  } catch (e) { toast(e.message || 'Could not delete it.'); }
  await reload(rerender);
}
