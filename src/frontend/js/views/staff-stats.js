/* Scan statistics, measured in the scan_event table -- see state/analytics.js
   for where the numbers come from and what happens offline. */
import { staffShell } from './staff-shell.js';
import { $, esc } from '../core/dom.js';
import { fmtDate, fromKey } from '../core/format.js';
import { loadScanStats, scanStats } from '../state/analytics.js';

const pct = (n, max) => Math.round((n / max) * 100);

export function pageStaffStats() {
  const s = scanStats();
  if (!s) {
    return staffShell('staff/stats', '<p class="muted">Loading the scan statistics…</p>');
  }

  const max = Math.max(1, ...s.days.map((d) => d.total));
  const top = s.objects.slice(0, 8);
  const topMax = Math.max(1, ...top.map((t) => t.total));
  const roomMax = Math.max(1, ...s.byRoom.map((r) => r.total));
  const simulated = s.days.reduce((a, d) => a + d.demo, 0);

  const note = s.offline
    ? 'You are working offline, so these are only the scans made in this browser.'
    : 'Last 14 days · a scan is a visitor opening an object page from its QR label.';

  const inner = `
    <div class="kpis">
      <div><b>${s.total.toLocaleString('en-GB')}</b><span>QR scans in the last 14 days</span></div>
      <div><b>${s.labelledObjects}</b><span>objects with a QR label</span></div>
      <div><b>${s.averagePerDay}</b><span>scans per day on average</span></div>
      <div><b class="kpitext" title="${esc(s.mostScanned || '')}">${esc(s.mostScanned || '–')}</b><span>most scanned object</span></div>
    </div>
    <div class="twocol">
      <div>
        <h2 class="h3" style="margin-bottom:6px">Scans per day</h2>
        <p class="small muted" style="margin:0 0 14px">${esc(note)}</p>
        <div class="barcols" id="daychart">${s.days.map((d) => `<div class="col" tabindex="0" data-tip="${esc(`${fmtDate(d.date, { weekday: 'long', day: 'numeric', month: 'long' })}: ${d.total} scans${d.demo ? ` (incl. ${d.demo} simulated)` : ''}`)}" aria-label="${esc(`${fmtDate(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}: ${d.total} scans`)}"><i class="bar" style="height:${pct(d.total, max)}%"></i><small>${fromKey(d.date).getDate()}</small></div>`).join('')}</div>
        <h2 class="h3" style="margin:32px 0 12px">Scans by gallery</h2>
        <div class="chart">${s.byRoom.length
    ? s.byRoom.map((r) => `<div class="hbar small"><span class="lbl">${esc(r.label)}</span><span class="track"><i style="width:${pct(r.total, roomMax)}%"></i></span><span class="n">${r.total}</span></div>`).join('')
    : '<p class="muted">No scans yet.</p>'}</div>
      </div>
      <div>
        <h2 class="h3" style="margin-bottom:6px">Most scanned objects</h2>
        <p class="small muted" style="margin:0 0 14px">Which labels visitors actually use – helpful when planning new texts and audio.</p>
        <div class="chart">${top.map((t) => `<div class="hbar"><a class="lbl" href="#/object/${t.key}">${esc(t.label)}</a><span class="track"><i style="width:${pct(t.total - t.demo, topMax)}%"></i><i class="demo" style="width:${pct(t.demo, topMax)}%"></i></span><span class="n">${t.total}</span></div>`).join('')}</div>
        <div class="legend" style="margin-top:14px"><span><i style="background:var(--deep)"></i>Visitor scans</span><span><i style="background:var(--sky)"></i>Simulated at a desk (${simulated})</span></div>
        <p class="small muted" style="margin-top:18px">Every “Simulate visitor scan” is counted separately, so trying a label out never looks like a visit.</p>
      </div>
    </div>
    <details style="margin-top:28px"><summary style="cursor:pointer;font-weight:600;color:var(--deep)">Show the numbers as a table</summary>
      <div class="tablewrap" style="margin-top:12px"><table class="data" style="min-width:520px"><thead><tr><th>Object</th><th>Inventory no.</th><th style="text-align:right">Scans</th></tr></thead><tbody>
        ${s.objects.map((t) => `<tr><td>${esc(t.label)}</td><td class="inv">${esc(t.key)}</td><td style="text-align:right" class="tnum">${t.total}</td></tr>`).join('')}
      </tbody></table></div>
    </details>`;
  return staffShell('staff/stats', inner);
}

/* Called by the router once the shell is on screen; the page then re-renders
   in place with the fetched numbers. */
export async function bindStats(rerender) {
  await loadScanStats(rerender);
}
