/* Reference data. Everything here becomes a table in MySQL and is served
   by GET /api/config once the backend lands. */

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

export const EXHIBITIONS = [
  { key: 'at60', art: 'exAt60', kind: 'Special exhibition', dates: '30 Sep 2026 – 28 Mar 2027', title: 'Botswana at 60', text: 'Sixty objects for sixty years of independence: from the first Independence Day flag to the design of today’s Gaborone.' },
  { key: 'tsodilo', art: 'exTsodilo', kind: 'Permanent gallery', dates: 'Gallery 1', title: 'Tsodilo – Mountains of the Gods', text: 'Rock art, tools and stories from Botswana’s first World Heritage Site.' },
  { key: 'art', art: 'exArt', kind: 'National Art Gallery', dates: 'Rooms A & B', title: 'Painters of the Nation', text: 'Works by Botswana artists from the 1960s to today.' },
  { key: 'kalahari', art: 'exKalahari', kind: 'Permanent gallery', dates: 'Gallery 4', title: 'Kalahari Life', text: 'Plants and animals that thrive in the sand – and how people live with them.' },
];

export const EVENTS = [
  { d: '2026-10-03', time: '10:00–12:00', kind: 'Family morning', title: 'Weave a pattern: basket designs for kids', place: 'Education room' },
  { d: '2026-10-06', time: '14:00', kind: 'Curator’s tour', title: 'Botswana at 60 – behind the objects', place: 'Special exhibition' },
  { d: '2026-10-15', time: '17:30', kind: 'Talk', title: 'Painters of the 1960s and 70s', place: 'Art Gallery' },
  { d: '2026-10-24', time: '09:30–12:30', kind: 'School holiday workshop', title: 'Rock art of Tsodilo: paint like the ancestors', place: 'Courtyard' },
];

/* opening hours & prices (placeholders to be confirmed with the museum) */
export const HOURS = { 0: [9, 17], 1: null, 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18], 6: [9, 17] };
export let CAPACITY = 40;
export const TOUR_TIMES = [10, 14];
export const HOLIDAYS = { '09-30': 'Botswana Day', '10-01': 'Public holiday', '12-25': 'Christmas' };
/* Prices are in THEBE (100 thebe = 1 pula), matching price_thebe in the
   database, so money() has a single unit to format. */
export const TICKETS = [
  { key: 'res', name: 'Citizens & residents', desc: 'Show your Omang or residence permit at the entrance', price: 0 },
  { key: 'child', name: 'Children under 16 & students', desc: 'Student card required for students', price: 0 },
  { key: 'intl', name: 'International visitors', desc: 'Adults visiting from abroad', price: 5000 },
  { key: 'tour', name: 'Guided tour add-on (45 min)', desc: 'Only at 10:00 and 14:00 · one per visitor', price: 3000, addon: true },
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

/* ---------- themed tours ---------- */
export const TOURS = [
  {
    id: 'highlights', title: 'The museum in 60 minutes', mins: 60, start: 'Entrance hall', who: 'First-time visitors',
    sub: 'Seven objects that tell the story of Botswana, from the Stone Age to independence.',
    intro: 'Short on time? This route takes you through every gallery and stops at the objects our guides are asked about most.',
    stops: ['BNM-ARC-0217', 'BNM-ARC-0031', 'BNM-ETH-0142', 'BNM-ETH-0077', 'BNM-NAT-0503', 'BNM-ART-0045', 'BNM-HIS-0019'],
  },
  {
    id: 'bot60', title: 'Botswana at 60', mins: 30, start: 'Special exhibition', who: 'Anyone interested in history',
    sub: 'Independence in 1966 and the country that grew from it.',
    intro: 'A short route for the Diamond Jubilee: the flag of the first Independence Day, the art of the young nation and the railway that shaped its towns.',
    stops: ['BNM-HIS-0019', 'BNM-ART-0012', 'BNM-ART-0045', 'BNM-HIS-0004'],
  },
  {
    id: 'family', title: 'Family tour: animals & patterns', mins: 45, start: 'Gallery 4', who: 'Children aged 6 to 12',
    sub: 'Stripes, beads and a one-string fiddle – with something to spot at every stop.',
    intro: 'Made for families: each stop has one question for the children and one thing to find in the display case.',
    stops: ['BNM-NAT-0503', 'BNM-ETH-0142', 'BNM-ARC-0388', 'BNM-ARC-0031', 'BNM-ETH-0077'],
  },
];

export const NAV = [
  ['visit', 'Visit'], ['exhibitions', 'Exhibitions'], ['collection', 'Collection'], ['tours', 'Tours'], ['events', 'Events'], ['page/about', 'About'],
];
export const PAGES = {
  learn: { t: 'Learn', l: 'Programmes for schools, families and lifelong learners.', items: ['School visits and teaching material per grade', 'Holiday workshops', 'Outreach: the museum’s mobile exhibitions in rural areas'], chip: 'Outside prototype scope' },
  about: { t: 'About the museum', l: 'History, mission and team of the National Museum and Art Gallery.', items: ['History since 1967', 'Divisions: Archaeology, Natural History, Ethnology, Education, Art', 'Heritage sites in the museum’s care', 'Imprint & privacy'], chip: 'Outside prototype scope' },
  groups: { t: 'Groups & schools', l: 'Booking for school classes and larger groups.', items: ['Request form for school groups', 'Group sizes and supervision', 'Links to the ticketing system with group capacity'], chip: 'Next iteration' },
  accessibility: { t: 'Accessibility', l: 'Step-free access, assistance and easy-to-read information.', items: ['Access & seating', 'Easy English and Setswana texts', 'Contrast and font-size options on the website'], chip: 'Next iteration' },
  press: { t: 'Press', l: 'Press releases and images.', items: ['Press releases', 'Image downloads', 'Contacts'], chip: 'Outside prototype scope' },
  tsodilo: { t: 'Tsodilo Hills', l: 'Botswana’s first UNESCO World Heritage Site, with more than 4,500 rock paintings.', items: ['Visitor information for Tsodilo', 'Link to rock-art records in the collection database', 'Future: virtual tour of the site'], chip: 'Outside prototype scope' },
  'virtual-tour': { t: 'Virtual tour', l: '360° walk-through of the galleries, linked to the object records in the database.', items: ['360° photos of each gallery', 'Hotspots that open the object page from the collection database', 'Works on phone, desktop and VR headset'], chip: 'Planned · phase 2' },
  ar: { t: 'AR in the exhibition', l: 'Augmented reality on visitors’ phones, triggered by the same QR labels.', items: ['3D models from digitisation', '“View in your room” for selected objects', 'Reconstruction of objects in their original setting'], chip: 'Planned · phase 2' },
  displays: { t: 'Interactive displays', l: 'Touch screens in the galleries that show content from the collection database.', items: ['Kiosk mode of the collection website', 'Themed stories per gallery', 'Content managed in the same staff area'], chip: 'Planned · phase 2' },
};


/* ------------------------------------------------------------------
   Apply GET /api/config over the defaults above.

   The arrays and objects are mutated in place rather than reassigned, so
   every module that already imported them keeps seeing the current values
   without a re-import. CAPACITY is a scalar, so it is a `let`. */
export function applyServerConfig(cfg) {
  if (!cfg) return;

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
  if (cfg.tourTimes) { TOUR_TIMES.length = 0; TOUR_TIMES.push(...cfg.tourTimes); }
}
