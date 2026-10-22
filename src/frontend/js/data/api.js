import { API_BASE, HEALTH_TIMEOUT_MS, REQUEST_TIMEOUT_MS } from '../core/config.js';

/* Thin fetch wrapper. It does not decide whether the app is online -- that is
   repo.js's job -- it only reports what happened. */

export class ApiError extends Error {
  constructor(status, body) {
    super((body && body.message) || `Request failed (${status})`);
    this.status = status;
    this.code = (body && body.code) || 'error';
    this.body = body || {};
  }

  /* 401/403 mean the API is up and we are not allowed -- never a reason to
     fall back to offline mode. 4xx generally are business answers. */
  get isAuth() { return this.status === 401 || this.status === 403; }
  get isClient() { return this.status >= 400 && this.status < 500; }
}

export class Unreachable extends Error {}

function csrfToken() {
  const m = document.cookie.match(/(?:^|;\s*)bnm_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

export async function request(path, { method = 'GET', body, form, timeout = REQUEST_TIMEOUT_MS } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  const headers = {};
  if (method !== 'GET') headers['X-CSRF-Token'] = csrfToken();
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: 'same-origin',
      body: form || (body !== undefined ? JSON.stringify(body) : undefined),
      signal: ctrl.signal,
    });
  } catch (e) {
    throw new Unreachable(e.message);     // network down, DNS, abort, CORS
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return null;

  let payload = null;
  try { payload = await res.json(); } catch { /* empty or non-JSON body */ }

  if (!res.ok) {
    // FastAPI wraps our dict in `detail`.
    const d = payload && payload.detail ? payload.detail : payload;
    if (res.status >= 500) throw new Unreachable(`server error ${res.status}`);
    throw new ApiError(res.status, typeof d === 'string' ? { message: d } : d);
  }
  return payload;
}

export async function probeHealth() {
  try {
    const r = await request('/health', { timeout: HEALTH_TIMEOUT_MS });
    return !!(r && r.status === 'ok');
  } catch {
    return false;
  }
}
