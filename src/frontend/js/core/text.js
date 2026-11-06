/* Texts the museum rewrote.

   Everything the site says that is museum content -- the page introductions,
   the history, the vision and mission, every monument, museum and trail, the
   publication sections -- lives in the modules under data/. This module walks
   those modules, which gives every text a stable key (the path to it:
   'pagecopy.events.lede', 'explore.SITES.2.blocks.1.p.0'), and writes the
   museum's version over it before the first render.

   Why a path and not a table of named keys: a named key has to be invented
   and then maintained for every sentence, and the first text somebody adds
   without one is a text nobody can edit. The path is already there.

   Two things are deliberately out of reach. The words the interface is made
   of -- buttons, table headings, step labels -- because a half-rewritten
   interface is worse than a fixed one, and none of it is museum content. And
   anything that is an address rather than prose: ids, routes and asset
   paths, which SKIP_FIELDS and SKIP_VALUE keep out, because changing one
   would break a lookup or a link rather than a sentence. */
import { ABOUT, CONTACT, COPY, HISTORY, OPERATIONS } from '../data/about.js';
import { PAGES } from '../data/constants.js';
import { CRAFTS, DEPARTMENTS, DEPT_COPY } from '../data/departments.js';
import { MUSEUMS_TEXT, SECTIONS, SITES, TRAILS } from '../data/explore.js';
import { PUB_TYPES } from '../data/publications.js';
import { PAGE_COPY } from '../data/pagecopy.js';

/* The wrappers below hold the same references the views use, so assigning
   into them changes what the next render reads. */
const SOURCES = [
  { prefix: 'pagecopy', group: 'Page headings and introductions', value: PAGE_COPY },
  { prefix: 'pages', group: 'Smaller pages', value: PAGES },
  { prefix: 'about', group: 'Visit and About', value: { ABOUT, HISTORY, OPERATIONS, CONTACT, COPY } },
  { prefix: 'departments', group: 'Departments and crafts', value: { DEPARTMENTS, CRAFTS, DEPT_COPY } },
  { prefix: 'explore', group: 'Explore: monuments, museums, trails', value: { SECTIONS, SITES, TRAILS, MUSEUMS_TEXT } },
  { prefix: 'publications', group: 'Publication sections', value: { PUB_TYPES } },
];

/* Fields that are an address, not a sentence. */
const SKIP_FIELDS = new Set([
  'key', 'id', 'art', 'code', 'href', 'img', 'cover', 'card', 'photos',
  'thumb', 'pdf', 'poster', 'single', 'section', 'pos', 'dept', 'icon',
  'seed', 'images', 'image', 'map', 'lat', 'lng',
]);
const SKIP_VALUE = /^(#|\/|https?:)|\.(jpg|jpeg|png|webp|svg|pdf)$/i;
const UNSAFE = new Set(['__proto__', 'constructor', 'prototype']);

const OVERRIDES = new Map();
/* key -> the text the site ships with. Filled once at load, which is what
   lets a text go back to the original when its override is removed, without
   a reload. */
const ORIGINALS = new Map();
/* key -> { group, context, field }, for the staff page's list. */
const INFO = new Map();

/* The nearest heading above a text, so the staff list can say
   "Tsodilo Hills" rather than "SITES › 2 › blocks › 1". */
function labelOf(obj, fallback) {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const own = obj.title || obj.name || obj.h || obj.short || obj.t;
    if (typeof own === 'string' && own.length > 1) return own;
  }
  return fallback;
}

function walk(value, path, group, context) {
  if (typeof value === 'string') {
    if (value.length < 2 || SKIP_VALUE.test(value)) return;
    const key = path.join('.');
    ORIGINALS.set(key, value);
    INFO.set(key, { group, context, field: path[path.length - 1] });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, [...path, String(i)], group, context));
    return;
  }
  if (value && typeof value === 'object') {
    const ctx = labelOf(value, context);
    Object.entries(value).forEach(([k, v]) => {
      if (SKIP_FIELDS.has(k) || UNSAFE.has(k)) return;
      walk(v, [...path, k], group, ctx);
    });
  }
}

SOURCES.forEach(({ prefix, group, value }) => walk(value, [prefix], group, group));

export function setTextOverrides(map) {
  OVERRIDES.clear();
  Object.entries(map || {}).forEach(([key, value]) => {
    /* A key the site no longer has -- a text that was renamed away in a
       later version -- is ignored rather than applied somewhere random. */
    if (typeof value === 'string' && ORIGINALS.has(key)) OVERRIDES.set(key, value);
  });
}

export const textOverrides = () => Object.fromEntries(OVERRIDES);

function assign(key, value) {
  const path = key.split('.');
  const source = SOURCES.find((s) => s.prefix === path[0]);
  if (!source) return false;
  let node = source.value;
  for (const step of path.slice(1, -1)) {
    if (UNSAFE.has(step) || node === null || typeof node !== 'object') return false;
    node = node[step];
  }
  const last = path[path.length - 1];
  if (!node || typeof node !== 'object' || UNSAFE.has(last)) return false;
  /* Only ever replaces a string that is already there: a key that has moved
     cannot grow a new field in the content. */
  if (typeof node[last] !== 'string') return false;
  node[last] = value;
  return true;
}

/* Writes every text to what it should be: the museum's version where there
   is one, the bundled text where there is not. Called after GET /api/config
   and before the first render, and again after a change in the staff area --
   so removing an override puts the original back on the spot. */
export function applyTextOverrides() {
  ORIGINALS.forEach((original, key) => {
    assign(key, OVERRIDES.has(key) ? OVERRIDES.get(key) : original);
  });
}

/* Everything the text editor in the staff area shows. */
export function collectTextEntries() {
  return [...ORIGINALS.entries()].map(([key, original]) => {
    const info = INFO.get(key) || {};
    return {
      key,
      group: info.group || '',
      context: info.context || '',
      field: info.field || '',
      original,
      current: OVERRIDES.has(key) ? OVERRIDES.get(key) : original,
      changed: OVERRIDES.has(key),
    };
  });
}

export const textCount = () => ORIGINALS.size;
export const changedCount = () => OVERRIDES.size;
