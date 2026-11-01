/* Institutional texts for the Visit & About page.

   ABOUT is quoted word for word from the museum's collaboration brief
   (October 2026) and must not be edited here -- changes go through the
   museum. HISTORY, VISION, MISSION and OPERATIONS come from the museum's
   previous website and may be revised; where the two disagree, the brief
   wins. */

export const IMG = '/assets/img';
export const PUB = '/assets/publications';

export const ABOUT = [
  'The Botswana National Museum was established in 1967 via an Act of Parliament and it officially opened to the public in 1968, two years after the country achieved independence in 1966. This year 2026 the Museum celebrates its 60th anniversary.',
  'The Botswana National Museum & Art Gallery, as it was originally known, was established at a time when the concept of a museum was new to the country, and indeed across the entire continent. However, although humble in size, the institution soon became recognized and celebrated for its pioneering and innovative approach to nation-building, and its role in research, documentation and education of Botswana’s remarkable biodiversity, and its proud history, culture and heritage.',
  'The Department of National Museum and Monuments (DNMM) is entrusted with protecting, preserving, researching, documenting and promoting Botswana’s cultural, natural and historical heritage. Established in 1967, the institution plays a vital role in safeguarding the nation’s heritage and identity for present and future generations.',
  'Through research, conservation, collections management, exhibitions, heritage site management and public education, DNMM works to ensure that Botswana’s tangible and intangible heritage is preserved, understood and appreciated.',
];

/* Previous website. The ministry's name is updated to the one printed on the
   museum's 2025 publications. */
export const HISTORY = [
  'The Department of National Museum and Monuments (DNMM), also known as the Botswana National Museum, was established by the National Museum and Art Gallery Act of 1967. It was initially administered by a board appointed by the Minister of Labour and Home Affairs.',
  'It was opened to the public in 1968 as a private institution and depended on a grant from Government as well as aid from donor organisations to operate. The period between 1967 and 1975 saw rapid growth and development of the museum, which necessitated stable funding.',
  'As a result, the institution was taken over by the Government in 1976. It is currently under the Ministry of Environment and Tourism.',
];

export const VISION = '“We, the Botswana National Museum, will be a model institution in the provision of a sustainable cultural and natural heritage service.”';

export const MISSION = '“The Botswana National Museum exists to protect, preserve and promote Botswana’s cultural and natural heritage for sustainable utilization thereof by collecting, researching, conserving and exhibiting for public education and appreciation.”';

export const OPERATIONS = [
  'The Botswana National Museum has a myriad of specialist disciplines including archaeology, heritage management, zoology, geology, botany, education, anthropology and history. It is through the work of professionals in these areas that it carries out its mandate of protecting, conserving, researching, collecting and disseminating information on Botswana’s heritage.',
  'The Botswana National Museum currently houses a collection of over 8,000 ethnographic artefacts which represent cultures from across Botswana and Africa. There is also a historical collection comprising artefacts from the colonial era to the present, which stands at 3,284 items. These artefacts are preserved through careful examination and treatment that averts deterioration due to factors such as changes in temperature, humidity and chemicals in the air. The artefacts are also documented and catalogued for ease of reference.',
  'The institution facilitates lifelong learning, understanding and appreciation of Botswana’s heritage through public programmes which include the Mobile Museum (Pitse ya Naga mo Maotwaneng), guided tours of exhibitions and monuments, the Motswedi wa Ditso radio programme and a publication called the Zebra’s Voice.',
];

export const CONTACT = {
  name: 'Department of National Museum and Monuments',
  street: '331 Independence Avenue, Gaborone, Botswana',
  box: 'Private Bag 00114',
  tel: ['+267 397 4616', '+267 361 0400'],
  fax: '+267 390 2797',
  /* Position of the museum on Independence Avenue, from the map on the
     previous website's contact page. */
  pos: [-24.6569, 25.9196],
};

export const ABOUT_PHOTOS = [1, 2, 3, 4, 5, 6].map((n) => `${IMG}/about/about_photo_0${n}.jpg`);
