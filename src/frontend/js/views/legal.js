import { pagehead } from '../ui/cards.js';
import { blocks } from '../ui/content.js';
import { CONTACT } from '../data/about.js';
import { LS_KEY } from '../core/config.js';
import { PAGE_COPY } from '../data/pagecopy.js';
import { RETENTION_DAYS } from '../data/constants.js';
import { esc } from '../core/dom.js';

/* Imprint and privacy notice.

   DRAFT texts written by the project team from what the website actually
   does (see doc/ARCHITECTURE.md and src/backend). They are not legal advice:
   the museum has to confirm the responsible person, retention periods and
   wording against Botswana's data protection law before the site goes live.
   The banner on both pages says so. */

const DRAFT = `<div class="callout" style="margin-bottom:36px"><div><div class="eyebrow">Draft</div><p style="margin-top:6px">This text describes how the website works. It has not yet been reviewed or approved by the Department of National Museum and Monuments and must be confirmed before the website goes live.</p></div></div>`;

const address = [CONTACT.name, CONTACT.street, CONTACT.box, `Tel: ${CONTACT.tel.join(' / ')}`, `Fax: ${CONTACT.fax}`];

export function pageImprint() {
  return `${pagehead([['#/', 'Home'], ['', esc(PAGE_COPY.imprint.title)]], esc(PAGE_COPY.imprint.title), esc(PAGE_COPY.imprint.lede))}
  <div class="wrap" style="padding-block:40px 80px">
    ${DRAFT}
    <div class="textblocks">${blocks([
      { h: 'Publisher', p: ['Botswana National Museum – Department of National Museum and Monuments (DNMM), Ministry of Environment and Tourism, Republic of Botswana.'], ul: address },
      { h: 'Responsible for content', p: ['Head of Division, Technical Support Services (TSS), Department of National Museum and Monuments, at the address above. The museum coordinates the institutional information and collection materials on this website through this division, in consultation with the respective divisions.'] },
      { h: 'About this website', p: ['This website was developed in 2026 in a research capstone project by a team of students in collaboration with the Department of National Museum and Monuments. Opening hours, prices, ticket bookings, inventory numbers and some events shown on it are sample content and not binding.'] },
      { h: 'Copyright', p: [
        'Texts, photographs, publications and collection records on this website are the property of the Botswana National Museum unless stated otherwise. Providing these materials for the website does not transfer copyright or ownership. Any reuse beyond private viewing requires the written permission of the museum.',
        'Researchers and commercial photographers who wish to work at the national monuments should contact the Botswana National Museum for permission.',
      ] },
      { h: 'Third-party material', ul: [
        'Map data © OpenStreetMap contributors, available under the Open Database License (ODbL).',
        'Interactive maps: Leaflet (BSD-2-Clause licence).',
        'Fonts: Archivo and Source Serif 4 (SIL Open Font License 1.1).',
        'QR codes: QR Code Generator for JavaScript by Kazuhiko Arase (MIT licence).',
      ] },
      { h: 'External links', p: ['This website links to external sites such as Google Maps, OpenStreetMap and online trail maps. The museum has no influence on their content and is not responsible for it.'] },
    ])}</div>
    <p style="margin-top:36px"><a href="#/privacy">Privacy notice →</a></p>
  </div>`;
}

export function pagePrivacy() {
  return `${pagehead([['#/', 'Home'], ['', esc(PAGE_COPY.privacy.title)]], esc(PAGE_COPY.privacy.title), esc(PAGE_COPY.privacy.lede))}
  <div class="wrap" style="padding-block:40px 80px">
    ${DRAFT}
    <div class="textblocks">${blocks([
      { h: 'Who is responsible', p: ['The Department of National Museum and Monuments (Botswana National Museum) is responsible for the processing of personal data on this website. Contact details are in the imprint.'], ul: address },
      { h: 'Visiting the website', p: ['You can browse the website without giving any personal data. The website does not use advertising, tracking or analytics cookies. Fonts and images are served from the museum’s own server.'] },
      { h: 'Ticket bookings', p: [
        'When you book a time slot we process your name, e-mail address, optionally your phone number, your country, the date and time of your visit and the number and type of tickets. We use these data only to manage your visit: to reserve your slot, to check you in at the front desk and to contact you if your visit is affected by a change.',
        `Payment is not yet processed online; you pay at the front desk. ${RETENTION_DAYS
    ? `Booking data are deleted ${RETENTION_DAYS} days after the date of the visit.`
    : 'The retention period for booking data still has to be set by the museum.'}`,
      ] },
      { h: 'QR codes in the galleries', p: ['When you scan a QR code at an object, we record which object page was opened and when, so the museum can see which objects interest visitors. To avoid counting the same visitor several times a day, we also store a one-way hash of your IP address and browser type that changes every day. It cannot be used to identify you or to follow you across days.'] },
      { h: 'Staff sign-in', p: ['Only museum staff sign in. For them the website sets two cookies: a session cookie that keeps them signed in for at most seven days, and a security token that protects forms against misuse. Visitors never receive these cookies.'] },
      { h: 'Data stored in your browser', p: [`If the website cannot reach the museum’s server, it keeps working offline and stores your bookings and other changes in your own browser (local storage, key “${LS_KEY}”). These data never leave your device; you can delete them at any time by clearing the site data in your browser.`] },
      { h: 'Maps', p: ['The maps in the Explore and Visit sections are loaded from third parties: the map software (Leaflet) from cdnjs (Cloudflare) and the map images from OpenStreetMap. When a map is shown, your browser connects to these servers and transmits your IP address. If you prefer not to, every place also has a written location and links you can choose to open.'] },
      { h: 'Newsletter', p: ['The newsletter sign-up is not active yet. No e-mail addresses entered in it are stored.'] },
      { h: 'Your rights', p: ['You can ask the museum which personal data it holds about you and ask for them to be corrected or deleted. Please contact the museum at the address above.'] },
    ])}</div>
    <p style="margin-top:36px"><a href="#/imprint">Imprint →</a></p>
  </div>`;
}
