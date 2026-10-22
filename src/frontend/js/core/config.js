/* Client configuration.

   Values that the server owns (opening hours, prices, the QR base URL) are
   fetched from GET /api/config at boot and applied over the defaults in
   data/constants.js. Everything here is either a constant or a runtime value
   the server fills in. */

export const API_BASE = '/api';
export const SEED_URL = '/assets/seed';
export const LS_KEY = 'bnm-prototype-v1';

/* One probe, with a short deadline. The app must not sit on a blank screen
   because the API is slow to refuse a connection. */
export const HEALTH_TIMEOUT_MS = 1500;
export const REQUEST_TIMEOUT_MS = 8000;

/* What is real and what is staged. Kept in one place so the museum can see
   the answer at a glance -- it is also the answer to several questions in
   doc/TODO.md. */
export const FEATURES = {
  onlinePayment: false,   // Orange Money / MyZaka / Smega / card: provider not chosen
  email: false,           // no e-ticket is actually sent yet
  newsletter: false,
  audioGuide: false,
  setswana: false,        // the EN/TN switch is decorative
  virtualTour: false,
  ar: false,
};

/* The origin printed into QR codes. Defaults to wherever the page is served
   from; GET /api/config overrides it, so on pilot day the museum sets
   PUBLIC_BASE_URL once and every new label follows. */
let publicBaseUrl = `${location.origin}${location.pathname}`;

export const getPublicBaseUrl = () => publicBaseUrl;
export function setPublicBaseUrl(url) {
  if (url) publicBaseUrl = String(url).replace(/\/+$/, '') + '/';
}
