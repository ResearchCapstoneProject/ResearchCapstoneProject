/* Reference data. Everything here becomes a table in MySQL and is served
   by GET /api/config once the backend lands. */
import { applyTheme } from '../core/theme.js';
import { setImageOverrides } from '../core/assets.js';

/* ------------------------------------------------------------------
   Sample content — every record here is demo data for the prototype.
   The museum will replace it through the staff area (CMS).
------------------------------------------------------------------- */
export const DEPTS = [
  { key: 'Archaeology', code: 'ARC' },
  { key: 'Ethnography', code: 'ETH' },
  { key: 'Natural History', code: 'NAT' },
  { key: 'History', code: 'HIS' },
  { key: 'Art', code: 'ART' },
];

export const LOCATIONS = [
  'Gallery 1 · Tsodilo',
  'Gallery 1 · Deep Time',
  'Gallery 2 · People & Crafts',
  'Gallery 3 · Music & Sound',
  'Gallery 4 · Kalahari Life',
  'Art Gallery · Room A',
  'Art Gallery · Room B',
  'Museum courtyard',
  'Special exhibition · Botswana at 60',
  'Store · on request',
];

export const EVENTS = [
  { d: '2026-10-24', time: '09:30–12:30', kind: 'School holiday workshop', title: 'Rock art of Tsodilo: paint like the ancestors', place: 'Courtyard' },
  /* Past events from the museum's own material (not sample content). The
     events page sorts anything before today into "Past events". */
  {
    d: '2025-08-15', time: '11:00', kind: 'Museum staff talk', title: 'Sustainable Tourism Initiatives in Botswana', place: 'Little Theatre',
    by: 'Matlhogonolo Tswiio', pdf: '/assets/publications/events/sustainable-tourism-initiatives-in-botswana.pdf',
    text: 'Background on tourism in Botswana · Key issues for sustainable tourism · Community based natural resources management · Eco tourism strategy · Policy framework',
  },
  {
    d: '2017-03-04', time: '05:00', kind: 'Heritage Marathon', title: 'Heritage Marathon – Malaka Village', place: 'Malaka Village Kgotla, 15 min drive from Palapye',
    pdf: '/assets/publications/events/20170304_MalakaMarathon.pdf',
    text: '21 km, 10 km and 5 km fun run. “To enliven Botswana’s yesterday and tomorrow.”',
  },
];

/* opening hours & prices (placeholders to be confirmed with the museum) */
export const HOURS = { 0: [9, 17], 1: null, 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18], 6: [9, 17] };
export let CAPACITY = 40;
/* Length of one entry slot in minutes. The museum changes this in the staff
   area; GET /api/config carries the current value. */
export let SLOT_MINUTES = 60;
/* Whether this deployment offers "Reset demo data" -- false on a server with
   the museum's own records on it. */
export let DEMO_RESET = true;
/* Days after a visit before a booking is deleted; 0 while the museum has not
   set a period. The privacy notice states whichever it is. */
export let RETENTION_DAYS = 0;
/* Whether the site still says it is a demonstration: the draft banner on the
   legal pages, the sample-content line in the footer, the wording in the
   staff area. Going live switches it off. */
export let DEMO_MODE = true;
/* Whether the server can send a confirmation. The ticket page promises one
   only when it can. */
export let EMAIL_ENABLED = false;
export const TOUR_TIMES = [];
export const HOLIDAYS = { '09-30': 'Botswana Day', '10-01': 'Public holiday', '12-25': 'Christmas' };
/* Prices are in THEBE (100 thebe = 1 pula), matching price_thebe in the
   database, so money() has a single unit to format. */
/* Admission is free and the same for everyone until the museum says
   otherwise. Visitor groups and their prices are maintained in the staff
   area, so this is only the fallback the offline demo starts from. */
export const TICKETS = [
  { key: 'gen', name: 'Admission', desc: 'Free entry for all visitors', price: 0 },
];

/* ---------- simplified floor plan of the museum ---------- */
export const ROOMS = [
  { id: 'g1a', name: 'Gallery 1 · Tsodilo', x: 44, y: 44, w: 160, h: 118 },
  { id: 'spec', name: 'Special exhibition', sub: 'Botswana at 60', x: 214, y: 44, w: 186, h: 118 },
  { id: 'g3', name: 'Gallery 3 · Music & Sound', x: 410, y: 44, w: 150, h: 118 },
  { id: 'g1b', name: 'Gallery 1 · Deep Time', x: 44, y: 172, w: 160, h: 118 },
  { id: 'g2', name: 'Gallery 2 · People & Crafts', x: 214, y: 172, w: 186, h: 118 },
  { id: 'g4', name: 'Gallery 4 · Kalahari Life', x: 410, y: 172, w: 150, h: 118 },
  { id: 'art', name: 'Art Gallery · Rooms A & B', x: 44, y: 300, w: 160, h: 96 },
  { id: 'foyer', name: 'Entrance & tickets', x: 214, y: 300, w: 186, h: 96, kind: 'service' },
  { id: 'edu', name: 'Education room', x: 410, y: 300, w: 150, h: 96, kind: 'service' },
  { id: 'court', name: 'Courtyard · locomotive', x: 596, y: 44, w: 80, h: 352, kind: 'outdoor' },
];
export const LOC_ROOM = {
  'Gallery 1 · Tsodilo': 'g1a',
  'Gallery 1 · Deep Time': 'g1b',
  'Gallery 2 · People & Crafts': 'g2',
  'Gallery 3 · Music & Sound': 'g3',
  'Gallery 4 · Kalahari Life': 'g4',
  'Art Gallery · Room A': 'art',
  'Art Gallery · Room B': 'art',
  'Museum courtyard': 'court',
  'Special exhibition · Botswana at 60': 'spec',
  'Store · on request': null,
};

/* Main navigation. A third element names the dropdown that ui/shell.js
   builds from the content modules. */
export const NAV = [
  ['visit', 'Visit & About'], ['collection', 'Collection'], ['events', 'Events'],
  ['explore', 'Explore', 'explore'], ['publications', 'Publications', 'publications'],
  ['departments', 'Departments', 'departments'],
];
export const PAGES = {
  learn: { t: 'Learn', l: 'Programmes for schools, families and lifelong learners.', items: ['School visits and teaching material per grade', 'Holiday workshops', 'Outreach: the museum’s mobile exhibitions in rural areas'], chip: 'Planned' },
  groups: { t: 'Groups & schools', l: 'Booking for school classes and larger groups.', items: ['Request form for school groups', 'Group sizes and supervision', 'Links to the ticketing system with group capacity'], chip: 'Next iteration' },
  accessibility: { t: 'Accessibility', l: 'Step-free access, assistance and easy-to-read information.', items: ['Access & seating', 'Easy English and Setswana texts', 'Contrast and font-size options on the website'], chip: 'Next iteration' },
  press: { t: 'Press', l: 'Press releases and images.', items: ['Press releases', 'Image downloads', 'Contacts'], chip: 'Planned' },
  ar: { t: 'AR in the galleries', l: 'Augmented reality on visitors’ phones, triggered by the same QR labels.', items: ['3D models from digitisation', '“View in your room” for selected objects', 'Reconstruction of objects in their original setting'], chip: 'Planned · phase 2' },
  displays: { t: 'Interactive displays', l: 'Touch screens in the galleries that show content from the collection database.', items: ['Kiosk mode of the collection website', 'Themed stories per gallery', 'Content managed in the same staff area'], chip: 'Planned · phase 2' },
};


/* ------------------------------------------------------------------
   Apply GET /api/config over the defaults above.

   The arrays and objects are mutated in place rather than reassigned, so
   every module that already imported them keeps seeing the current values
   without a re-import. CAPACITY is a scalar, so it is a `let`. */
export function applyServerConfig(cfg) {
  if (!cfg) return;

  /* Colours, fonts, logo and wording. Applied first, so the shell and the
     home page render with the museum's own look rather than repainting. */
  if (cfg.theme) applyTheme(cfg.theme);
  if (cfg.imageOverrides) setImageOverrides(cfg.imageOverrides);

  if (cfg.departments) {
    DEPTS.length = 0;
    DEPTS.push(...cfg.departments.map((d) => ({ key: d.key, code: d.code })));
  }

  if (cfg.locations) {
    LOCATIONS.length = 0;
    Object.keys(LOC_ROOM).forEach((k) => delete LOC_ROOM[k]);
    cfg.locations.forEach((l) => {
      LOCATIONS.push(l.label);
      LOC_ROOM[l.label] = l.roomId || null;
    });
  }

  if (cfg.rooms) {
    ROOMS.length = 0;
    ROOMS.push(...cfg.rooms.map((r) => ({
      id: r.id, name: r.name, sub: r.sub || undefined,
      kind: r.kind === 'gallery' ? undefined : r.kind,
      x: r.x, y: r.y, w: r.w, h: r.h,
    })));
  }

  if (cfg.hours) {
    Object.keys(HOURS).forEach((k) => delete HOURS[k]);
    Object.entries(cfg.hours).forEach(([k, v]) => { HOURS[Number(k)] = v; });
  }

  if (cfg.holidays) {
    Object.keys(HOLIDAYS).forEach((k) => delete HOLIDAYS[k]);
    Object.assign(HOLIDAYS, cfg.holidays);
  }

  if (cfg.tickets) {
    TICKETS.length = 0;
    // Prices arrive in thebe; the UI works in thebe and money() divides.
    TICKETS.push(...cfg.tickets.map((t) => ({
      key: t.key, name: t.name, desc: t.desc,
      price: t.priceThebe, addon: !!t.addon,
    })));
  }

  if (typeof cfg.capacity === 'number') CAPACITY = cfg.capacity;
  if (typeof cfg.slotMinutes === 'number') SLOT_MINUTES = cfg.slotMinutes;
  if (typeof cfg.demoResetEnabled === 'boolean') DEMO_RESET = cfg.demoResetEnabled;
  if (typeof cfg.bookingRetentionDays === 'number') RETENTION_DAYS = cfg.bookingRetentionDays;
  if (typeof cfg.demoMode === 'boolean') DEMO_MODE = cfg.demoMode;
  if (typeof cfg.emailEnabled === 'boolean') EMAIL_ENABLED = cfg.emailEnabled;
  if (cfg.tourTimes) { TOUR_TIMES.length = 0; TOUR_TIMES.push(...cfg.tourTimes); }
}
