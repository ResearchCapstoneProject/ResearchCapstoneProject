/* DOM helpers.

   esc() is applied to every value interpolated into the HTML strings the
   views build, so it is the app's main defence against markup injection from
   staff-entered object text. */
export const $ = (s, el = document) => el.querySelector(s);
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
