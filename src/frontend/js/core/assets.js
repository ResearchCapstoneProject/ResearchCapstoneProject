/* Pictures the museum replaced.

   GET /api/config carries a map of "the path the site ships with" to "the
   upload that replaced it", and this module rewrites every <img> after a
   render. Doing it at the DOM level rather than in each view is deliberate:
   the site renders pictures in a dozen templates and builds some paths from
   constants, so a resolver that every template had to remember to call would
   miss one. This way a replacement reaches every page that shows that file,
   including pages written after the kit. */

const OVERRIDES = new Map();

export function setImageOverrides(map) {
  OVERRIDES.clear();
  Object.entries(map || {}).forEach(([path, url]) => {
    if (path && url) OVERRIDES.set(path, url);
  });
}

export const overrideFor = (path) => OVERRIDES.get(path) || '';
export const overrideCount = () => OVERRIDES.size;
export const overrides = () => Object.fromEntries(OVERRIDES);

export function applyImageOverrides(root = document) {
  if (!OVERRIDES.size || !root || typeof root.querySelectorAll !== 'function') return;
  root.querySelectorAll('img[src^="/assets/"]').forEach((img) => {
    const url = OVERRIDES.get(img.getAttribute('src'));
    if (!url) return;
    img.setAttribute('src', url);
    /* srcset wins over src in the browser's selection, and a replacement is
       one file in one size -- leaving the old srcset would show the original
       on exactly the wide screens the museum is presenting on. */
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
  });
  /* The publications page links a cover to its PDF, so hrefs are left alone;
     only <a href> pointing straight at a replaced picture is rewritten. */
  root.querySelectorAll('a[href^="/assets/"]').forEach((a) => {
    const url = OVERRIDES.get(a.getAttribute('href'));
    if (url) a.setAttribute('href', url);
  });
}

/* Every bundled picture the site's content modules name, for the staff area's
   gallery. A recursive scan rather than a hand-kept list: the content modules
   are the only place these paths exist, so a list would go stale the first
   time somebody adds a photo to a monument. */
const ASSET = /^\/assets\/(img|publications)\/\S+\.(jpg|jpeg|png|webp|svg)$/i;

export function collectAssets(value, out = new Set()) {
  if (typeof value === 'string') {
    if (ASSET.test(value)) out.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectAssets(v, out));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectAssets(v, out));
  }
  return out;
}
