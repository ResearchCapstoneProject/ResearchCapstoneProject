import { esc } from '../core/dom.js';
import { isOnline } from '../data/repo.js';
import { pagehead } from '../ui/cards.js';
import { $ } from '../core/dom.js';
import { login } from '../data/repo.js';

/* Sign-in for the staff area.

   Only meaningful when the API is reachable. In offline demo mode there is no
   server to authenticate against, so the guard lets the staff area through
   and the banner says so plainly rather than pretending someone is signed
   in -- which is what the prototype did, with a hard-coded
   "Signed in as: Curator (demo account)". */
export function pageStaffLogin(message = '') {
  if (!isOnline()) {
    return `${pagehead([['#/', 'Home'], ['', 'Staff login']], 'Staff area',
      'This copy of the site is running without its server.')}
      <section class="wrap">
        <div class="placeholder">
          <p class="lede">There is no server to sign in to in offline demo mode,
             so the staff area is open and anything you change is kept only in
             this browser.</p>
          <p><a class="btn primary" href="#/staff">Open the staff area</a></p>
        </div>
      </section>`;
  }

  return `${pagehead([['#/', 'Home'], ['', 'Staff login']], 'Staff sign-in',
    'For museum staff. Visitors do not need an account.')}
    <section class="wrap">
      <form id="stafflogin" class="formgrid" style="max-width:460px" autocomplete="on">
        ${message ? `<p class="hint" role="alert" style="color:var(--full)">${esc(message)}</p>` : ''}
        <div class="field full">
          <label for="l-user">Username</label>
          <input id="l-user" name="username" type="text" autocomplete="username" required>
        </div>
        <div class="field full">
          <label for="l-pass">Password</label>
          <input id="l-pass" name="password" type="password" autocomplete="current-password" required>
        </div>
        <div class="field full">
          <button class="btn primary" type="submit">Sign in</button>
        </div>
        <p class="small muted full">Accounts are created by the museum's
           administrator. There is no self sign-up.</p>
      </form>
    </section>`;
}
