/* ------------------------------------------------------------------
   Mutable application state, in one holder object.

   The prototype kept these as top-level `let`s and reassigned them
   (S = fresh(), T = newT(), CQ = {...}). Imported bindings are read-only
   for the importer, so `import { S }; S = fresh()` is a TypeError -- but
   setting a property on an imported const object is fine, and it keeps
   the aliasing semantics the handlers already rely on.

   Two rules:
     1. Never `const { S } = store;` at module scope. That snapshots the
        reference and goes stale the moment "Reset demo" or "tk-new"
        replaces it. Destructuring inside a function body is fine.
     2. This module imports nothing. It is what breaks the cycles between
        the data, view and event layers.
------------------------------------------------------------------- */
export const store = {
  // --- persisted: { objects, bookings, scans } ---
  S: null,

  // --- ticket booking wizard ---
  T: null,

  // --- collection search query ---
  CQ: null,

  // --- transient UI ---
  LB: { id: null, i: 0 },          // lightbox   { object id, image index }
  TOURSTATE: { id: null, i: 0 },   // tour player { tour id, stop index }
  SB: { date: null },              // staff bookings: selected day
  PENDING: null,                   // callback drained after the next route
  formImage: null,
  formImages: [],
  lastFocus: null,                 // focus to restore when a modal closes
  toastTimer: null,
  uid: 0,                          // counter for unique SVG gradient ids
};
