/* The text editor: every sentence the site carries as content.

   There are a few hundred of them, so the page is a search rather than a
   list to scroll: pick a section, type a word, and edit what comes back. The
   original is never overwritten -- it stays in the site's own modules, which
   is why every text has "Original" next to it and why nothing here can be
   lost. core/text.js explains the key and what is deliberately not editable. */
import { staffShell } from './staff-shell.js';
import { toast } from '../ui/toast.js';
import { $, esc } from '../core/dom.js';
import { changedCount, collectTextEntries, textCount } from '../core/text.js';
import { isOnline } from '../data/repo.js';
import * as repo from '../data/repo.js';

const LIMIT = 60;
const state = { q: '', group: '', onlyChanged: false, busy: '' };

const groupsOf = (all) => [...new Set(all.map((e) => e.group))];

function matches(e) {
  if (state.group && e.group !== state.group) return false;
  if (state.onlyChanged && !e.changed) return false;
  if (!state.q) return true;
  const needle = state.q.toLowerCase();
  return e.current.toLowerCase().includes(needle)
    || e.original.toLowerCase().includes(needle)
    || e.context.toLowerCase().includes(needle)
    || e.key.toLowerCase().includes(needle);
}

function item(e) {
  const rows = Math.min(10, Math.max(2, Math.ceil(e.current.length / 90)));
  return `<div class="txtitem${e.changed ? ' on' : ''}">
    <div class="txthead">
      <b>${esc(e.context || e.group)}</b>
      <span class="small muted">${esc(e.field)}</span>
      ${e.changed ? '<span class="chip live dot">changed</span>' : ''}
      <code class="small muted" title="${esc(e.key)}">${esc(e.key)}</code>
    </div>
    <label class="sr-only" for="t-${esc(e.key)}">${esc(e.context || e.group)} · ${esc(e.field)}</label>
    <textarea id="t-${esc(e.key)}" rows="${rows}" data-txt="${esc(e.key)}" ${isOnline() ? '' : 'disabled'}>${esc(e.current)}</textarea>
    <div class="actions">
      <button class="btn link" type="button" data-act="txt-save" data-key="${esc(e.key)}" ${isOnline() ? '' : 'disabled'}>Save</button>
      ${e.changed ? `<button class="btn link" type="button" data-act="txt-reset" data-key="${esc(e.key)}" ${isOnline() ? '' : 'disabled'}>Back to the original</button>` : ''}
    </div>
    ${e.changed ? `<details class="small"><summary>What the site shipped with</summary><p style="margin:6px 0 0">${esc(e.original)}</p></details>` : ''}
  </div>`;
}

export function textList() {
  const all = collectTextEntries();
  const hits = all.filter(matches);
  const shown = hits.slice(0, LIMIT);
  return `<p class="small muted" style="margin:0 0 12px">${hits.length} of ${all.length} texts${
    hits.length > LIMIT ? ` · showing the first ${LIMIT}, narrow the search to see the rest` : ''}</p>
    ${shown.length ? shown.map(item).join('')
    : '<p class="muted">Nothing matches. Try another word, or another section.</p>'}`;
}

export function pageStaffTexts() {
  const all = collectTextEntries();
  const offline = !isOnline()
    ? `<p class="small" style="padding:12px 14px;background:var(--warn-soft);color:var(--warn);border-radius:4px">
         You are working offline, so the texts can be read but not changed.</p>`
    : '';

  const inner = `
    ${offline}
    <h2 class="h3" style="margin-bottom:6px">Texts</h2>
    <p class="muted" style="margin:0 0 6px;max-width:72ch">Every text the website carries as content —
      ${textCount()} of them${changedCount() ? `, ${changedCount()} changed so far` : ''}. Saving one shows it to
      visitors on their next page load, and “Back to the original” always works: the museum's own wording stays in the
      site underneath.</p>
    <p class="small muted" style="margin:0 0 18px;max-width:72ch">Not here on purpose: the words the interface itself is
      made of — buttons, table headings, step names. Events, publications and object descriptions have their own pages,
      where they belong.</p>

    <div class="txtbar">
      <div class="field" style="margin:0;flex:1 1 260px"><label for="t-q">Search</label>
        <input id="t-q" type="search" value="${esc(state.q)}" placeholder="a word from the text, or a place" data-txt-filter></div>
      <div class="field" style="margin:0"><label for="t-group">Section</label>
        <select id="t-group" data-txt-filter>
          <option value="">All sections</option>
          ${groupsOf(all).map((g) => `<option value="${esc(g)}" ${state.group === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}
        </select></div>
      <label class="check" style="align-self:end;margin:0 0 6px">
        <input type="checkbox" id="t-changed" ${state.onlyChanged ? 'checked' : ''} data-txt-filter>
        <span>Only the ones we changed</span></label>
    </div>

    <div id="txtlist">${textList()}</div>`;
  return staffShell('staff/texts', inner);
}

/* The filters re-render the list only, so typing does not take the focus out
   of the search box. */
export function wireTexts(rerender) {
  const paint = () => {
    const list = $('#txtlist');
    if (list) list.innerHTML = textList();
  };
  const q = $('#t-q');
  if (q) {
    q.oninput = () => { state.q = q.value.trim(); paint(); };
  }
  const group = $('#t-group');
  if (group) group.onchange = () => { state.group = group.value; paint(); };
  const only = $('#t-changed');
  if (only) only.onchange = () => { state.onlyChanged = only.checked; paint(); };
  wireTexts.rerender = rerender;
}

export async function bindTexts(rerender) {
  /* The overrides came down with GET /config, so there is nothing to fetch. */
  if (rerender) rerender();
  wireTexts(rerender);
}

export async function saveText(key, rerender) {
  const el = document.querySelector(`[data-txt="${key}"]`);
  if (!el) return;
  const value = el.value.trim();
  if (!value) { toast('Please enter some text, or put the original back.'); return; }
  try {
    await repo.saveText(key, value);
    toast('Saved. Visitors see it on their next page load.');
  } catch (e) { toast(e.message || 'Could not save that text.'); }
  if (rerender) rerender();
  wireTexts(rerender);
}

export async function resetText(key, rerender) {
  try {
    await repo.clearText(key);
    toast('The museum’s own wording is back.');
  } catch (e) { toast(e.message || 'Could not put the original back.'); }
  if (rerender) rerender();
  wireTexts(rerender);
}
