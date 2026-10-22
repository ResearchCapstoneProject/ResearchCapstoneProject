/* Scan statistics. The numbers are currently generated, not measured --
   see state/analytics.js. */
import { staffShell } from './staff-shell.js';
import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
import { dkey, fmtDate, fromKey } from '../core/format.js';
import { demoScans, scanTotal, scansOnDay } from '../state/analytics.js';
import { published, roomById, roomOf } from '../state/selectors.js';

export function pageStaffStats() {
  const days = []; const d = new Date(); d.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) { const x = new Date(d); x.setDate(x.getDate() - i); days.push(dkey(x)); }
  const today = dkey(new Date());
  const demo = demoScans();
  const series = days.map((k) => ({ k, n: scansOnDay(k) + (k === today ? demo : 0), demo: k === today ? demo : 0 }));
  const max = Math.max(1, ...series.map((s) => s.n));
  const total = series.reduce((a, s) => a + s.n, 0);
  const top = published().map((o) => ({ o, n: scanTotal(o), demo: store.S.scans[o.id] || 0 })).sort((a, b) => b.n - a.n).slice(0, 8);
  const topMax = Math.max(1, ...top.map((t) => t.n));
  const byRoom = {};
  published().forEach((o) => { const r = roomOf(o.location); const name = r ? (roomById(r) || {}).name : 'Not on display'; byRoom[name] = (byRoom[name] || 0) + scanTotal(o); });
  const rooms = Object.entries(byRoom).sort((a, b) => b[1] - a[1]);
  const roomMax = Math.max(1, ...rooms.map((r) => r[1]));
  const inner = `
    <div class="kpis">
      <div><b>${total.toLocaleString('en-GB')}</b><span>QR scans in the last 14 days</span></div>
      <div><b>${published().length}</b><span>objects with a QR label</span></div>
      <div><b>${Math.round(total / 14)}</b><span>scans per day on average</span></div>
      <div><b>${esc(top[0] ? top[0].o.title.slice(0, 28) : '–')}${top[0] && top[0].o.title.length > 28 ? '…' : ''}</b><span>most scanned object</span></div>
    </div>
    <div class="twocol">
      <div>
        <h2 class="h3" style="margin-bottom:6px">Scans per day</h2>
        <p class="small muted" style="margin:0 0 14px">Last 14 days · Mondays are closing days</p>
        <div class="cols" id="daychart">${series.map((s) => `<div class="col" tabindex="0" data-tip="${esc(`${fmtDate(s.k, { weekday: 'long', day: 'numeric', month: 'long' })}: ${s.n} scans${s.demo ? ` (incl. ${s.demo} from this demo)` : ''}`)}" aria-label="${esc(`${fmtDate(s.k, { weekday: 'short', day: 'numeric', month: 'short' })}: ${s.n} scans`)}"><i class="bar ${s.demo ? 'today' : ''}" style="height:${Math.round((s.n / max) * 100)}%"></i><small>${fromKey(s.k).getDate()}</small></div>`).join('')}</div>
        <h2 class="h3" style="margin:32px 0 12px">Scans by gallery</h2>
        <div class="chart">${rooms.map(([name, n]) => `<div class="hbar small"><span class="lbl">${esc(name)}</span><span class="track"><i style="width:${Math.round((n / roomMax) * 100)}%"></i></span><span class="n">${n}</span></div>`).join('')}</div>
      </div>
      <div>
        <h2 class="h3" style="margin-bottom:6px">Most scanned objects</h2>
        <p class="small muted" style="margin:0 0 14px">Which labels visitors actually use – helpful when planning new texts and audio.</p>
        <div class="chart">${top.map((t) => `<div class="hbar"><a class="lbl" href="#/object/${t.o.id}">${esc(t.o.title)}</a><span class="track"><i style="width:${Math.round(((t.n - t.demo) / topMax) * 100)}%"></i><i class="demo" style="width:${Math.round((t.demo / topMax) * 100)}%"></i></span><span class="n">${t.n}</span></div>`).join('')}</div>
        <div class="legend" style="margin-top:14px"><span><i style="background:var(--deep)"></i>Sample data</span><span><i style="background:var(--sky)"></i>Scans from this demo (${demo})</span></div>
        <p class="small muted" style="margin-top:18px">Every “Simulate visitor scan” in this prototype is counted here, so you can see the numbers move during the presentation.</p>
      </div>
    </div>
    <details style="margin-top:28px"><summary style="cursor:pointer;font-weight:600;color:var(--deep)">Show the numbers as a table</summary>
      <div class="tablewrap" style="margin-top:12px"><table class="data" style="min-width:520px"><thead><tr><th>Object</th><th>Inventory no.</th><th>Gallery</th><th style="text-align:right">Scans</th></tr></thead><tbody>
        ${published().map((o) => ({ o, n: scanTotal(o) })).sort((a, b) => b.n - a.n).map((t) => `<tr><td>${esc(t.o.title)}</td><td class="inv">${esc(t.o.id)}</td><td class="small">${esc(t.o.onDisplay ? t.o.location : 'Store')}</td><td style="text-align:right" class="tnum">${t.n}</td></tr>`).join('')}
      </tbody></table></div>
    </details>`;
  return staffShell('staff/stats', inner);
}
