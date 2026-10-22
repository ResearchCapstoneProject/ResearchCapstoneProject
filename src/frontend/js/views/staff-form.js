import { objCard } from '../ui/cards.js';
import { objLabel, openLabel } from '../ui/label.js';
import { toast } from '../ui/toast.js';
import { pageNotFound } from './notfound.js';
import { staffShell } from './staff-shell.js';
import { store } from '../state/store.js';
import { $, esc } from '../core/dom.js';
import { pad4 } from '../core/format.js';
import { DEPTS, LOCATIONS } from '../data/constants.js';
import { save } from '../data/local.js';
import { byId, deptCode, objectURL } from '../state/selectors.js';
import { published } from '../state/selectors.js';

export function nextInv(dept) {
  const code = deptCode(dept);
  const nums = store.S.objects.filter((o) => o.id.startsWith(`BNM-${code}-`)).map((o) => parseInt(o.id.split('-')[2], 10) || 0);
  return `BNM-${code}-${pad4(Math.max(0, ...nums) + 1)}`;
}
export function pageStaffForm(editId) {
  const o = editId ? byId(editId) : null;
  if (editId && !o) return pageNotFound();
  store.formImages = o ? (o.images || (o.image ? [o.image] : [])).slice() : [];
  store.formImage = store.formImages[0] || null;
  const v = o || { title: '', dept: 'Ethnography', origin: '', date: '', material: '', dims: '', location: LOCATIONS[2], text: '', status: 'published' };
  const inner = `
    <div class="addform">
      <form id="objform" novalidate>
        <h2 class="h3" style="margin-bottom:6px">${o ? 'Edit object record' : 'Add a new object'}</h2>
        <p class="muted" style="margin:0 0 24px">${o ? 'Changes go live on the website and behind the QR code as soon as you save.' : 'Fill in what you know – you can add more details later. A QR label is created automatically.'}</p>
        <div class="formgrid">
          <div class="field full"><label for="o-title">Title *</label><input id="o-title" type="text" value="${esc(v.title)}" placeholder="e.g. Beaded apron" required></div>
          <div class="field"><label for="o-dept">Department *</label><select id="o-dept" ${o ? 'disabled' : ''}>${DEPTS.map((d) => `<option ${v.dept === d.key ? 'selected' : ''}>${d.key}</option>`).join('')}</select></div>
          <div class="field"><label for="o-inv">Inventory number</label><input id="o-inv" type="text" value="${esc(o ? o.id : nextInv(v.dept))}" readonly><span class="hint">Assigned automatically</span></div>
          <div class="field"><label for="o-origin">Origin / maker</label><input id="o-origin" type="text" value="${esc(v.origin)}" placeholder="Community, place or artist"></div>
          <div class="field"><label for="o-date">Date / period</label><input id="o-date" type="text" value="${esc(v.date)}" placeholder="e.g. c. 1960"></div>
          <div class="field"><label for="o-material">Material</label><input id="o-material" type="text" value="${esc(v.material)}"></div>
          <div class="field"><label for="o-dims">Dimensions</label><input id="o-dims" type="text" value="${esc(v.dims)}" placeholder="e.g. H 30 cm"></div>
          <div class="field full"><label for="o-loc">Location in the museum</label><select id="o-loc">${LOCATIONS.map((l) => `<option ${v.location === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
          <div class="field full"><label for="o-text">Description for visitors</label><textarea id="o-text" placeholder="2–4 sentences in plain English. A Setswana version can be added later.">${esc(v.text)}</textarea></div>
          <div class="field full"><span class="label">Photos</span>
            <label class="upload" for="o-img"><b>Upload photos</b><span class="small muted">JPG or PNG · several at once · resized automatically · the first one is the main image</span><span class="btn ghost small">Choose files</span></label>
            <input id="o-img" type="file" accept="image/*" multiple class="sr-only">
            <div class="uplist" id="uplist"></div>
          </div>
          <fieldset class="field full" style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:8px">Visibility</legend>
            <label class="check"><input type="radio" name="o-status" value="published" ${v.status === 'published' ? 'checked' : ''}><span><b>Publish now</b> – visible in Collection Online and behind the QR code</span></label>
            <label class="check" style="margin-top:8px"><input type="radio" name="o-status" value="draft" ${v.status === 'draft' ? 'checked' : ''}><span><b>Save as draft</b> – only visible to staff</span></label>
          </fieldset>
        </div>
        <div class="navrow"><a class="btn ghost" href="#/staff">Cancel</a><button class="btn" type="submit">${o ? 'Save changes' : 'Save &amp; create QR label'}</button></div>
      </form>
      <aside class="preview" aria-label="Live preview"><div class="eyebrow">Live preview</div><div id="pv"></div></aside>
    </div>`;
  return staffShell(o ? 'staff' : 'staff/add', inner);
}
export function readForm() {
  const g = (id) => ($(id) ? $(id).value.trim() : '');
  const dept = $('#o-dept').value;
  return { title: g('#o-title'), dept, id: g('#o-inv'), origin: g('#o-origin'), date: g('#o-date'), material: g('#o-material'), dims: g('#o-dims'), location: $('#o-loc').value, text: g('#o-text'), status: (document.querySelector('input[name="o-status"]:checked') || {}).value || 'published', images: store.formImages.slice() };
}
export function updatePreview() {
  const f = readForm(); const tmp = { ...f, title: f.title || 'Untitled object', art: 'generic', images: store.formImages };
  $('#pv').innerHTML = `<div class="card">${objCard(tmp).replace('<a class="objcard"', '<div class="objcard"').replace(/<\/a>\s*$/, '</div>')}</div>${objLabel(tmp, objectURL(f.id))}`;
  const list = $('#uplist');
  if (list) list.innerHTML = store.formImages.length
    ? store.formImages.map((src, i) => `<div class="upitem"><img src="${src}" alt=""><button type="button" class="btn link" data-act="rm-img" data-i="${i}">Remove</button>${i === 0 ? '<span class="chip">Main</span>' : ''}</div>`).join('')
    : '<p class="small muted" style="margin:0">No photos yet – the prototype shows a placeholder illustration until the museum uploads one.</p>';
}
export function submitForm(editId) {
  const f = readForm();
  if (!f.title) { $('#o-title').setAttribute('aria-invalid', 'true'); $('#o-title').focus(); toast('Please enter a title.'); return; }
  let o = editId ? byId(editId) : null;
  if (o) { Object.assign(o, { title: f.title, origin: f.origin, date: f.date, material: f.material, dims: f.dims, location: f.location, text: f.text, status: f.status, images: store.formImages.slice(), image: null, onDisplay: !f.location.startsWith('Store') }); }
  else {
    o = { id: nextInv(f.dept), art: 'generic', dept: f.dept, title: f.title, origin: f.origin, date: f.date, material: f.material, dims: f.dims, location: f.location, text: f.text, status: f.status, images: store.formImages.slice(), onDisplay: !f.location.startsWith('Store'), added: Date.now(), seed: false };
    store.S.objects.push(o);
  }
  const ok = save();
  store.PENDING = () => {
    toast(ok ? `“${o.title}” ${o.status === 'published' ? 'is live' : 'saved as draft'} · QR label ready` : 'Saved for this session (browser storage is full or blocked).');
    openLabel(o.id);
  };
  location.hash = '#/staff';
}
export function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => { const img = new Image(); img.onload = () => { const max = 900; const s = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); resolve(c.toDataURL('image/jpeg', 0.82)); }; img.onerror = reject; img.src = r.result; };
    r.onerror = reject; r.readAsDataURL(file);
  });
}
export function bindForm(editId) {
  const form = $('#objform'); if (!form) return;
  form.addEventListener('input', (e) => { if (e.target.id === 'o-title') e.target.removeAttribute('aria-invalid'); updatePreview(); });
  form.addEventListener('change', async (e) => {
    if (e.target.id === 'o-dept') $('#o-inv').value = nextInv(e.target.value);
    if (e.target.id === 'o-img' && e.target.files.length) {
      for (const file of Array.from(e.target.files).slice(0, 4)) {
        try { store.formImages.push(await resizeImage(file)); } catch (err) { toast('One file could not be read. Please choose JPG or PNG.'); }
      }
      e.target.value = '';
    }
    updatePreview();
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); submitForm(editId); });
  updatePreview();
}
