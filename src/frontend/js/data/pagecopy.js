/* The headline and introduction of each page, in one place.

   These used to sit inside the templates. They are here because the staff
   area can now edit any text that lives in a data module: core/text.js
   assigns an override into the object this file exports, and the views read
   it at render time. A string exported on its own could not work that way --
   an imported binding cannot be reassigned by the importer, which is exactly
   why the museum's vision and mission moved into an object as well.

   What is deliberately NOT here: button labels, table headings and the other
   short words the interface is made of. An editor for those invites a
   half-translated screen, and none of it is museum content. */

export const PAGE_COPY = {
  home: {
    eyebrow: 'Department of National Museum and Monuments · Gaborone',
    headline: 'Botswana National Museum',
  },
  collection: {
    title: 'Collection Online',
    lede: 'Explore objects from the museum’s archaeology, ethnography, natural history, history and art collections – including many that are not on display.',
  },
  events: {
    title: 'Events',
    lede: 'Talks, tours, workshops and community events for all ages.',
  },
  tickets: {
    title: 'Tickets & time slots',
    /* {minutes} and {capacity} are filled in from the visit settings. */
    lede: 'Admission is free. Book a time slot online and skip the queue – each {minutes}-minute slot holds up to {capacity} visitors, so the galleries never get too crowded.',
  },
  visit: {
    title: 'Visit & About',
    lede: 'Plan your visit to the National Museum in Gaborone and get to know the Department of National Museum and Monuments.',
  },
  publications: {
    title: 'Publications',
    lede: 'Brochures, the Zebra’s Voice magazine and the Natural History Division’s monthly features.',
  },
  explore: {
    title: 'Explore',
  },
  departments: {
    title: 'Departments',
  },
  imprint: {
    title: 'Imprint',
    lede: 'Who publishes this website and who owns its content.',
  },
  privacy: {
    title: 'Privacy notice',
    lede: 'Which personal data this website processes, why, and what your rights are.',
  },
  notfound: {
    title: 'Page not found',
    lede: 'This object or page does not exist (anymore). Try the collection search.',
  },
};

/* The tickets introduction mentions the slot length and the capacity, both of
   which the museum changes in Settings; filling them in here keeps the text
   editable without the numbers going stale. */
export const fill = (text, values) =>
  String(text).replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] : m));
