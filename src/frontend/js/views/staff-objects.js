import { staffShell } from './staff-shell.js';
import { store } from '../state/store.js';
import { dkey } from '../core/format.js';
import { slotHours } from '../data/opening.js';
import { taken } from '../state/booking.js';
import { published } from '../state/selectors.js';
import { pic } from '../art/registry.js';
import { $, esc } from '../core/dom.js';

export function pageStaffObjects() {
  const list = [...store.S.objects].sort((a, b) => b.added - a.added);
  const today = dkey(new Date());
  const todayVis = slotHours(today).reduce((a, h) => a + taken(today, h), 0);
  const inner = `
    <div class="kpis">
      <div><b>${store.S.objects.length}</b><span>objects in the database</span></div>
      <div><b>${published().length}</b><span>published online</span></div>
      <div><b>${store.S.objects.filter((o) => o.status === 'draft').length}</b><span>drafts</span></div>
      <div><b>${todayVis}</b><span>visitors booked today</span></div>
    </div>
    <div class="sec-head" style="margin-bottom:16px"><h2 class="h3">Object records</h2><a class="btn" href="#/staff/add">+ Add object</a></div>
    <div class="tablewrap"><table class="data">
      <thead><tr><th></th><th>Inventory no.</th><th>Title</th><th>Department</th><th>Location</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
      <tbody>${list.map((o) => `<tr class="${o.seed ? '' : 'new'}">
        <td><div class="thumb">${pic(o)}</div></td>
        <td class="inv">${esc(o.id)}</td>
        <td><b>${esc(o.title)}</b>${o.seed ? '' : ' <span class="chip dev">New</span>'}</td>
        <td>${esc(o.dept)}</td>
        <td class="small">${esc(o.location || '–')}</td>
        <td>${o.status === 'published' ? '<span class="chip live dot">Published</span>' : '<span class="chip draft dot">Draft</span>'}</td>
        <td><div class="actions"><a href="#/object/${o.id}">View</a><button class="btn link" type="button" data-act="label" data-id="${o.id}">QR label</button><a href="#/staff/edit/${o.id}">Edit</a><button class="btn link" type="button" data-act="del" data-id="${o.id}" style="color:var(--full)">Delete</button></div></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  return staffShell('staff', inner);
}
