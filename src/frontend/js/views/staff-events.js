/* The programme: add an event, change it, withdraw it, delete it.

   The museum's own events were in the site's source until now, which meant a
   developer for every talk. They live in `museum_event` and come down with
   GET /events, so this page is the whole editorial loop -- and because the
   events page splits on today's date, an event moves to "Past events" by
   itself and only the flyer stays interesting. */
import { staffShell } from './staff-shell.js';
import { toast } from '../ui/toast.js';
import { $, esc } from '../core/dom.js';
import { fmtDate } from '../core/format.js';
import { isOnline } from '../data/repo.js';
import * as repo from '../data/repo.js';

const state = { rows: null, loading: false, editing: null };

const EMPTY = { d: '', time: '', kind: '', title: '', place: '', by: '', text: '' };

function row(e) {
  const editing = state.editing === e.id;
  return `<tr${e.published ? '' : ' class="muted"'}${editing ? ' style="background:var(--sky-soft)"' : ''}>
    <td style="white-space:nowrap"><b>${esc(fmtDate(e.d))}</b>
      <div class="small muted">${esc(e.time || '—')}</div></td>
    <td><div class="eyebrow">${esc(e.kind || 'Event')}</div><b>${esc(e.title)}</b>
      <div class="small muted">${esc(e.place || '—')}${e.by ? ` · ${esc(e.by)}` : ''}</div>
      ${e.text ? `<div class="small" style="margin-top:4px;max-width:52ch">${esc(e.text)}</div>` : ''}</td>
    <td class="small">${e.published ? 'On the website' : 'Withdrawn'}</td>
    <td class="small">${e.pdf
    ? `<a href="${esc(e.pdf)}" target="_blank" rel="noopener">Flyer</a>
       <button class="btn link" type="button" data-act="ev-flyer-del" data-id="${e.id}" ${isOnline() ? '' : 'disabled'}>remove</button>`
    : `<label class="btn link" style="cursor:pointer">Add flyer (PDF)
         <input type="file" accept="application/pdf,.pdf" data-ev-flyer="${e.id}" hidden ${isOnline() ? '' : 'disabled'}></label>`}</td>
    <td><div class="actions">
      <button class="btn link" type="button" data-act="ev-edit" data-id="${e.id}" ${isOnline() ? '' : 'disabled'}>${editing ? 'Editing' : 'Edit'}</button>
      <button class="btn link" type="button" data-act="ev-toggle" data-id="${e.id}" data-to="${e.published ? '0' : '1'}" ${isOnline() ? '' : 'disabled'}>${e.published ? 'Withdraw' : 'Publish'}</button>
      <button class="btn link" type="button" data-act="ev-del" data-id="${e.id}" style="color:var(--full)" ${isOnline() ? '' : 'disabled'}>Delete</button>
    </div></td>
  </tr>`;
}

export function pageStaffEvents() {
  const rows = state.rows;
  const edit = rows && state.editing !== null
    ? rows.find((r) => r.id === state.editing) || EMPTY : EMPTY;

  const offline = !isOnline()
    ? `<p class="small" style="padding:12px 14px;background:var(--warn-soft);color:var(--warn);border-radius:4px">
         You are working offline: the programme is shown as the site carries it, and cannot be changed from here.</p>`
    : '';

  const inner = `
    ${offline}
    <h2 class="h3" style="margin-bottom:6px">Events</h2>
    <p class="muted" style="margin:0 0 18px;max-width:70ch">Everything here appears on the events page and, while it is
      still ahead, on the home page. An event moves to “Past events” on its own once the day has passed, so nothing has
      to be tidied up afterwards.</p>

    <div class="tablewrap"><table class="data" style="min-width:860px">
      <thead><tr><th>When</th><th>What</th><th>Status</th><th>Flyer</th><th style="text-align:right">Actions</th></tr></thead>
      <tbody>${rows === null
    ? '<tr><td colspan="5" class="muted">Loading…</td></tr>'
    : (rows.length ? rows.map(row).join('')
      : '<tr><td colspan="5" class="muted">No events yet.</td></tr>')}</tbody>
    </table></div>

    <form id="evform" class="formgrid" style="margin-top:28px;max-width:860px" novalidate>
      <h3 class="h4" style="grid-column:1/-1;margin:0">${state.editing !== null ? 'Edit this event' : 'Add an event'}</h3>
      <div class="field"><label for="ev-d">Date *</label>
        <input id="ev-d" type="date" value="${esc(edit.d || '')}" ${isOnline() ? '' : 'disabled'}></div>
      <div class="field"><label for="ev-time">Time</label>
        <input id="ev-time" type="text" placeholder="10:00–12:00" value="${esc(edit.time || '')}" ${isOnline() ? '' : 'disabled'}></div>
      <div class="field"><label for="ev-kind">Kind</label>
        <input id="ev-kind" type="text" placeholder="Workshop, talk, guided tour…" value="${esc(edit.kind || '')}" ${isOnline() ? '' : 'disabled'}></div>
      <div class="field"><label for="ev-place">Place</label>
        <input id="ev-place" type="text" placeholder="Courtyard, Little Theatre…" value="${esc(edit.place || '')}" ${isOnline() ? '' : 'disabled'}></div>
      <div class="field" style="grid-column:1/-1"><label for="ev-title">Title *</label>
        <input id="ev-title" type="text" maxlength="255" value="${esc(edit.title || '')}" ${isOnline() ? '' : 'disabled'}></div>
      <div class="field"><label for="ev-by">Who is leading it</label>
        <input id="ev-by" type="text" maxlength="128" value="${esc(edit.by || '')}" ${isOnline() ? '' : 'disabled'}></div>
      <div class="field" style="grid-column:1/-1"><label for="ev-text">Description</label>
        <textarea id="ev-text" rows="3" ${isOnline() ? '' : 'disabled'}>${esc(edit.text || '')}</textarea></div>
      <div class="actions" style="grid-column:1/-1">
        <button class="btn primary" type="submit" ${isOnline() ? '' : 'disabled'}>${state.editing !== null ? 'Save changes' : 'Add the event'}</button>
        ${state.editing !== null ? '<button class="btn ghost" type="button" data-act="ev-cancel">Cancel</button>' : ''}
      </div>
    </form>`;
  return staffShell('staff/events', inner);
}

export async function bindEvents(rerender) {
  if (state.loading) return;
  state.loading = true;
  try {
    state.rows = await repo.listEvents();
  } catch (e) {
    toast('Could not load the events.');
    state.rows = state.rows || [];
  } finally {
    state.loading = false;
  }
  if (rerender) rerender();
  wireEvents(rerender);
}

/* The flyer inputs sit inside the table, which is rebuilt on every change. */
export function wireEvents(rerender) {
  document.querySelectorAll('[data-ev-flyer]').forEach((el) => {
    el.onchange = () => uploadFlyer(el.dataset.evFlyer, el, rerender);
  });
}

function form() {
  return {
    d: $('#ev-d').value,
    time: $('#ev-time').value,
    kind: $('#ev-kind').value || 'Event',
    title: $('#ev-title').value,
    place: $('#ev-place').value,
    by: $('#ev-by').value,
    text: $('#ev-text').value,
  };
}

async function reload(rerender) {
  state.rows = null;
  await bindEvents(rerender);
}

export async function submitEvent(rerender) {
  const draft = form();
  if (!draft.d) { toast('Please give the event a date.'); $('#ev-d').focus(); return; }
  if (draft.title.trim().length < 2) { toast('Please give the event a title.'); $('#ev-title').focus(); return; }
  try {
    if (state.editing !== null) {
      await repo.updateEvent(state.editing, draft);
      state.editing = null;
      toast('Event saved.');
    } else {
      await repo.createEvent(draft);
      toast('Event added. It is on the website now.');
    }
  } catch (e) { toast(e.message || 'Could not save the event.'); }
  await reload(rerender);
}

export function editEvent(id, rerender) {
  state.editing = Number(id);
  if (rerender) rerender();
  wireEvents(rerender);
  const el = $('#ev-title');
  if (el) el.focus();
}

export function cancelEdit(rerender) {
  state.editing = null;
  if (rerender) rerender();
  wireEvents(rerender);
}

export async function toggleEvent(id, published, rerender) {
  try {
    await repo.updateEvent(Number(id), { published });
    toast(published ? 'Event is on the website.' : 'Event withdrawn.');
  } catch (e) { toast(e.message || 'Could not change the event.'); }
  await reload(rerender);
}

export async function deleteEvent(id, rerender) {
  if (!confirm('Delete this event? Visitors will no longer see it anywhere.')) return;
  try {
    await repo.deleteEvent(Number(id));
    if (state.editing === Number(id)) state.editing = null;
    toast('Event deleted.');
  } catch (e) { toast(e.message || 'Could not delete the event.'); }
  await reload(rerender);
}

async function uploadFlyer(id, input, rerender) {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    await repo.uploadEventFlyer(Number(id), file);
    toast('Flyer uploaded.');
  } catch (e) { toast(e.message || 'Could not use that file.'); }
  await reload(rerender);
}

export async function removeFlyer(id, rerender) {
  try {
    await repo.removeEventFlyer(Number(id));
    toast('Flyer removed.');
  } catch (e) { toast(e.message || 'Could not remove the flyer.'); }
  await reload(rerender);
}
