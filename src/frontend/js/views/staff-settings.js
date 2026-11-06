/* Visitor groups, prices and the shape of a time slot.

   Everything the museum asked to be able to change without a developer:
   which admission groups exist and what they cost, how many places a slot
   holds, and how long a slot is. Reads and writes go through repo.js, so the
   page is read-only in the offline demo, where there is no server to save to. */
import { staffShell } from './staff-shell.js';
import { toast } from '../ui/toast.js';
import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
import { money } from '../core/format.js';
import { CAPACITY, SLOT_MINUTES } from '../data/constants.js';
import { isOnline } from '../data/repo.js';
import * as repo from '../data/repo.js';

/* Filled by load(); the view renders whatever is in here. */
const state = { groups: null, settings: null, loading: false };

function slotPreview(minutes) {
  const per = Math.floor(60 / minutes);
  if (minutes < 60) return `${per} slots per hour`;
  if (minutes === 60) return 'one slot per hour';
  return `one slot every ${minutes / 60} hours`;
}

function groupRow(g) {
  return `<tr${g.active ? '' : ' class="muted"'}>
    <td><b>${esc(g.name)}</b>${g.addon ? ' <span class="chip">Add-on</span>' : ''}${g.active ? '' : ' <span class="chip draft dot">Inactive</span>'}
      <div class="small muted">${esc(g.desc || '—')}</div></td>
    <td><div class="field" style="max-width:150px"><label class="sr-only" for="p-${g.key}">Price for ${esc(g.name)} in pula</label>
      <input id="p-${g.key}" type="number" min="0" step="0.5" value="${(g.priceThebe / 100).toFixed(2)}" data-price="${g.key}" ${isOnline() ? '' : 'disabled'}></div>
      <span class="small muted">${g.priceThebe ? money(g.priceThebe) : 'Free'}</span></td>
    <td class="small">${g.inUse ? 'Booked by visitors' : 'Not booked yet'}</td>
    <td><div class="actions">
      <button class="btn link" type="button" data-act="grp-save" data-key="${g.key}" ${isOnline() ? '' : 'disabled'}>Save price</button>
      <button class="btn link" type="button" data-act="grp-toggle" data-key="${g.key}" data-to="${g.active ? '0' : '1'}" ${isOnline() ? '' : 'disabled'}>${g.active ? 'Deactivate' : 'Activate'}</button>
      ${g.inUse ? '' : `<button class="btn link" type="button" data-act="grp-del" data-key="${g.key}" style="color:var(--full)" ${isOnline() ? '' : 'disabled'}>Delete</button>`}
    </div></td>
  </tr>`;
}

export function pageStaffSettings() {
  const groups = state.groups;
  const s = state.settings || {
    capacityPerSlot: CAPACITY, slotMinutes: SLOT_MINUTES,
    bookingWindowDays: 14, slotLengths: [15, 20, 30, 45, 60, 90, 120],
  };

  const offline = !isOnline()
    ? `<p class="small" style="padding:12px 14px;background:var(--warn-soft);color:var(--warn);border-radius:4px">
         You are working offline, so these values can be read but not changed. Sign in to the live site to edit them.</p>`
    : '';

  const inner = `
    ${offline}
    <h2 class="h3" style="margin-bottom:6px">Visitor groups and prices</h2>
    <p class="muted" style="margin:0 0 18px">Admission is free unless a group has a price. A group that visitors have already
      booked is deactivated rather than deleted, so old bookings keep the price that was paid.</p>

    <div class="tablewrap"><table class="data" style="min-width:680px">
      <thead><tr><th>Group</th><th>Price (pula)</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
      <tbody id="grouprows">${groups === null
        ? '<tr><td colspan="4" class="muted">Loading…</td></tr>'
        : (groups.length ? groups.map(groupRow).join('')
          : '<tr><td colspan="4" class="muted">No groups yet.</td></tr>')}</tbody>
    </table></div>

    <form id="grpform" class="formgrid" style="margin-top:28px;max-width:760px" novalidate>
      <div class="field"><label for="g-name">Add a group *</label>
        <input id="g-name" type="text" placeholder="e.g. International visitors" ${isOnline() ? '' : 'disabled'}></div>
      <div class="field"><label for="g-price">Price in pula</label>
        <input id="g-price" type="number" min="0" step="0.5" value="0" ${isOnline() ? '' : 'disabled'}></div>
      <div class="field full"><label for="g-desc">Note shown to visitors</label>
        <input id="g-desc" type="text" placeholder="e.g. Adults visiting from abroad" ${isOnline() ? '' : 'disabled'}></div>
      <label class="check full"><input id="g-addon" type="checkbox" ${isOnline() ? '' : 'disabled'}>
        <span><b>This is an add-on</b>, not a visitor group — a guided tour, say. Add-ons accompany a visitor and do not take a place of their own.</span></label>
      <div class="full"><button class="btn" type="submit" ${isOnline() ? '' : 'disabled'}>Add group</button></div>
    </form>

    <h2 class="h3" style="margin:40px 0 6px">Time slots</h2>
    <p class="muted" style="margin:0 0 18px">How the opening hours are divided, and how many visitors may enter per slot.
      Slots start at opening time; a remainder shorter than one slot is left out so no slot runs past closing time.</p>

    <form id="setform" class="formgrid" style="max-width:760px" novalidate>
      <div class="field"><label for="s-len">Slot length</label>
        <select id="s-len" ${isOnline() ? '' : 'disabled'}>${s.slotLengths.map((m) => `<option value="${m}" ${m === s.slotMinutes ? 'selected' : ''}>${m} minutes</option>`).join('')}</select>
        <span class="hint">${esc(slotPreview(s.slotMinutes))}</span></div>
      <div class="field"><label for="s-cap">Visitors per slot</label>
        <input id="s-cap" type="number" min="1" max="10000" value="${s.capacityPerSlot}" ${isOnline() ? '' : 'disabled'}>
        <span class="hint">Bookings already made are never cancelled by lowering this.</span></div>
      <div class="field"><label for="s-win">Booking window</label>
        <input id="s-win" type="number" min="1" max="365" value="${s.bookingWindowDays}" ${isOnline() ? '' : 'disabled'}>
        <span class="hint">How many days ahead visitors may book.</span></div>
      <div class="field"><label for="s-ret">Delete bookings after</label>
        <input id="s-ret" type="number" min="0" max="3650" value="${s.bookingRetentionDays || 0}" ${isOnline() ? '' : 'disabled'}>
        <span class="hint">Days after the visit. <b>0 keeps them</b>. A booking holds a name, an e-mail address and
          usually a phone number, so this is the period the privacy notice promises — it says what is set here.</span></div>
      <div class="full"><button class="btn" type="submit" ${isOnline() ? '' : 'disabled'}>Save slot settings</button>
        ${s.bookingRetentionDays ? `<button class="btn ghost" type="button" data-act="set-purge" ${isOnline() ? '' : 'disabled'}>Delete old bookings now</button>` : ''}</div>
    </form>

    <p class="small muted" style="margin-top:28px">Payment is always taken at the front desk; the website never charges anyone online.
      A price set here is what the front desk collects on arrival.</p>`;

  return staffShell('staff/settings', inner);
}

/* Loads the data once the page is in the DOM, then re-renders in place. */
export async function bindSettings(rerender) {
  if (state.loading) return;
  state.loading = true;
  try {
    const [groups, settings] = await Promise.all([
      repo.listTicketTypes(), repo.getVisitSettings(),
    ]);
    state.groups = groups;
    state.settings = settings;
  } catch (e) {
    toast('Could not load the settings.');
    state.groups = state.groups || [];
  } finally {
    state.loading = false;
  }
  if (rerender) rerender();
}

export function invalidateSettings() { state.groups = null; state.settings = null; }

/* ---- actions, called from events/bind.js ---- */

const pula = (el) => Math.round(Number(el.value || 0) * 100);

export async function purgeBookings(rerender) {
  const days = (state.settings || {}).bookingRetentionDays || 0;
  if (!days) { toast('Set a retention period first.'); return; }
  if (!confirm(`Delete every booking whose visit was more than ${days} days ago? This cannot be undone.`)) return;
  try {
    const out = await repo.purgeBookings();
    toast(out.deleted
      ? `${out.deleted} old booking(s) deleted.`
      : 'Nothing was old enough to delete.');
  } catch (e) { toast(e.message || 'Could not delete the old bookings.'); }
  invalidateSettings();
  await bindSettings(rerender);
}

export async function saveGroupPrice(key, rerender) {
  const el = $(`[data-price="${key}"]`);
  if (!el) return;
  try {
    await repo.updateTicketType(key, { priceThebe: pula(el) });
    toast('Price saved. The website shows it immediately.');
  } catch (e) { toast(e.message || 'Could not save the price.'); }
  invalidateSettings();
  await bindSettings(rerender);
}

export async function toggleGroup(key, active, rerender) {
  try {
    await repo.updateTicketType(key, { active });
    toast(active ? 'Group is bookable again.' : 'Group is no longer offered.');
  } catch (e) { toast(e.message || 'Could not change the group.'); }
  invalidateSettings();
  await bindSettings(rerender);
}

export async function deleteGroup(key, rerender) {
  if (!confirm('Delete this group? It has never been booked, so nothing is lost.')) return;
  try {
    await repo.deleteTicketType(key);
    toast('Group deleted.');
  } catch (e) { toast(e.message || 'Could not delete the group.'); }
  invalidateSettings();
  await bindSettings(rerender);
}

export async function addGroup(rerender) {
  const name = $('#g-name').value.trim();
  if (name.length < 2) { $('#g-name').focus(); toast('Please enter a name for the group.'); return; }
  try {
    await repo.createTicketType({
      name,
      desc: $('#g-desc').value.trim(),
      priceThebe: pula($('#g-price')),
      addon: $('#g-addon').checked,
    });
    toast(`“${name}” added.`);
  } catch (e) { toast(e.message || 'Could not add the group.'); }
  invalidateSettings();
  await bindSettings(rerender);
}

export async function saveVisitSettings(rerender) {
  try {
    await repo.updateVisitSettings({
      slotMinutes: Number($('#s-len').value),
      capacityPerSlot: Number($('#s-cap').value),
      bookingWindowDays: Number($('#s-win').value),
      bookingRetentionDays: Number($('#s-ret').value || 0),
    });
    toast('Saved. New bookings use the new slots right away.');
  } catch (e) { toast(e.message || 'Could not save the settings.'); }
  invalidateSettings();
  await bindSettings(rerender);
}
