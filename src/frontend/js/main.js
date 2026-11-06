/* ------------------------------------------------------------------
   Botswana National Museum — application entry point.

   Boot order matters:
     1. repo.bootstrap() probes the API once and fills store.S, either from
        FastAPI or from the seed JSON plus localStorage.
     2. the delegated listeners must exist before anything is rendered.
     3. the shell must exist before route() renders into #app.
------------------------------------------------------------------- */
import { dkey } from './core/format.js';
import { nextDays } from './core/time.js';
import { hoursFor } from './data/opening.js';
import * as repo from './data/repo.js';
import { freshState } from './data/local.js';
import { store } from './state/store.js';
import { newQuery } from './state/query.js';
import { newT } from './state/booking.js';
import { route } from './router/router.js';
import { shell } from './ui/shell.js';
import { toast } from './ui/toast.js';

// Side effects only: installs the delegated click / submit / input / change /
// keydown listeners and the hashchange hook. Nothing imports a symbol from
// it, so without this line the app renders once and never navigates again.
import './events/bind.js';

/* State that state/store.js cannot initialise itself, because it deliberately
   imports nothing. */
function initState() {
  store.T = newT();
  store.CQ = newQuery();
  store.SB = { date: nextDays(14).find((k) => hoursFor(k)) || dkey(new Date()) };
}

/* Shown once, when a working API connection is lost mid-session. */
repo.onDegraded(() => {
  toast('Working offline — your changes are saved in this browser.');
  route();
});

/* A fresh page load that lands straight on an object page is a visitor who
   scanned the QR code on its label -- `#/object/<id>` is the address the
   printed labels carry. Navigating to the same page from inside the app does
   not come through here, so browsing the collection is not counted as a scan.
   The server stores no IP, only a hash that changes daily; see
   services/privacy.py. */
function countQrScan() {
  const m = /^#\/object\/([^/?]+)/.exec(location.hash);
  if (m) repo.recordScan(decodeURIComponent(m[1]), 'qr');
}

async function boot() {
  try {
    await repo.bootstrap();
  } catch (err) {
    // Never leave a blank page: fall through to whatever the offline path
    // managed to load.
    console.error('[boot]', err);
  }
  /* Last resort. bootstrap() fills store.S on every path it can, but if even
     the seed files failed to load, the views must still have a state object
     to read instead of throwing and rendering nothing at all. */
  if (!store.S) store.S = freshState({ objects: [] });
  initState();
  shell();
  route();
  countQrScan();
  /* bootstrap() degrades without a toast, because there was no page to show
     one on. Say it now that there is. */
  if (store.api && store.api.degraded) {
    toast('Working offline — your changes are saved in this browser.');
  }
}

boot();
