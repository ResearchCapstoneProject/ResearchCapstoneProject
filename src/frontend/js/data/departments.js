/* The museum's divisions ("Departments" in the navigation).

   `lede`, `unitsLabel` and `units` are quoted word for word from the
   museum's collaboration brief (October 2026) -- do not edit them here.
   `crafts` and the photo captions come from the previous website and may
   be revised. */
import { IMG } from './about.js';

export const DEPT_INTRO = 'The Botswana National Museum is a multi-disciplinary institution with heritage collection of Ethnography, Archaeology, Audio-visual documentation and Natural History under its custody.';

const ETH = `${IMG}/ethnology`;
const NH = `${IMG}/natural-history/pix`;
const WEB = `${IMG}/web/natural-history/pix`;

export const DEPARTMENTS = [
  {
    key: 'archaeology', name: 'Archaeology Division', short: 'Archaeology',
    lede: 'The Archaeology Division is responsible for researching, documenting, protecting and conserving Botswana’s archaeological heritage and sites.',
    unitsLabel: 'Specialized units and functions:',
    units: [
      ['Salvage Archaeology and Archaeological/Heritage Impact Assessment (AIA) Reports', 'Conducts Archaeological assessments and reviews EIA reports to identify and protect archaeological and heritage resources that may be affected by development projects.'],
      ['Built Heritage', 'Contributes to the documentation, protection and conservation of historically significant buildings and structures.'],
      ['Monument Development', 'Supports the development, conservation and promotion of heritage monuments and sites for public education, economic beneficiation and appreciation.'],
    ],
    cover: `${IMG}/home-slides/imagetop03.jpg`,
    photos: [
      [`${IMG}/monuments/02tsodilo/monument_photo_RockPaintings01.jpg`, 'Rock paintings at Tsodilo Hills'],
      [`${IMG}/monuments/05domboshaba/monument_photo_Restoration01.jpg`, 'Restored stone wall at Domboshaba'],
      [`${IMG}/monuments/10oldpalapye/monument_photo_Cultural01.jpg`, 'LMS church ruins at Old Palapye'],
    ],
    links: [['#/explore/monuments', 'National monuments in the Explore section'], ['#/explore/world-heritage', 'World Heritage Sites'], ['#/publications/brochures', 'Monument brochures']],
  },
  {
    key: 'ethnology', name: 'Ethnology Division', short: 'Ethnology',
    lede: 'The Ethnology Division is responsible for safeguarding, documenting, researching, conserving and interpreting Botswana’s ethno-historic collections and cultural heritage. Its main functions include the acquisition and documentation of cultural objects, preservation and conservation of collections, historical and ethnographic research, development of exhibitions, and interpretation of Botswana’s cultural traditions, material culture, social practices and historical experiences. The Division promotes public understanding of the country’s diverse cultural heritage and ensures that collections are preserved for present and future generations.',
    unitsLabel: 'Units:',
    units: [
      ['Ethno history Collection', 'Responsible for the collection, documentation, management, research and interpretation of objects and materials relating to Botswana’s cultural and social history.'],
      ['Conservation', 'Responsible for the preventive and remedial conservation of museum collections to ensure their long-term preservation and protection.'],
    ],
    cover: `${IMG}/home-slides/imagetop08.jpg`,
    photos: [],
    links: [['#/collection', 'Search the collection online']],
  },
  {
    key: 'natural-history', name: 'Natural History Division', short: 'Natural History',
    lede: 'The Natural History Division documents, researches and preserves Botswana’s natural heritage, contributing to knowledge of the country’s biodiversity, geological resources and natural history collections.',
    unitsLabel: 'Specialized units:',
    units: [
      ['Zoology', 'Studies and documents animal specimens and Botswana’s animal diversity.'],
      ['Entomology', 'Focuses on the study, documentation and preservation of insects.'],
      ['Herbarium', 'Collects, identifies, documents and preserves plant specimens.'],
      ['Geology', 'Documents and preserves geological materials, including rocks, minerals and fossils.'],
      ['Taxidermy', 'Prepares, preserves and mounts animal specimens for collections, research, education and exhibitions.'],
    ],
    cover: `${IMG}/home-slides/imagetop09.jpg`,
    photos: [
      [`${WEB}/snout-cobra-2.webp`, 'Snouted cobra · Zoology'],
      [`${WEB}/dsc00619.webp`, 'Butterfly specimen · Entomology'],
      [`${WEB}/dung-beetle.webp`, 'Dung beetle · Entomology'],
      [`${WEB}/dsc4199.webp`, 'Mounted heron · Taxidermy'],
    ],
    /* The Geology unit's poster, shown on the division page. */
    poster: { src: `${WEB}/geological-specimen-of-the-month-october-2025.jpg`, full: `${NH}/geological-specimen-of-the-month-october-2025.jpg`, title: 'Geological Specimen of the Month · October 2025', text: 'Kimberlite – Botswana’s stone of transformation.' },
    links: [['#/explore/botanical-garden', 'National Botanical Garden'], ['#/explore/herbarium', 'National Herbarium'], ['#/publications/plant-of-the-month', 'Plant of the Month'], ['#/publications/insect-of-the-month', 'Insect of the Month']],
  },
  {
    key: 'education', name: 'Education Division', short: 'Education',
    lede: 'The Education Division promotes public understanding and appreciation of Botswana’s cultural and natural heritage through educational activities, community engagement and public awareness.',
    unitsLabel: 'Specialized units:',
    units: [
      ['Outreach Programmes', 'Coordinates educational and community outreach activities, including engagement with schools and other audiences. One of their long term and popular medium is the Pitse ya naga mo maotwaneng that took Museum services to country’s primary schools throughout the country.'],
      ['Marketing', 'Promotes the Museum’s programmes, exhibitions, activities and services to increase public awareness and participation.'],
    ],
    cover: `${IMG}/about/about_photo_02.jpg`,
    photos: [],
    links: [['#/publications/zebras-voice', 'Zebra’s Voice – the museum magazine'], ['#/events', 'Events and past events']],
  },
  {
    key: 'technical-support', name: 'Technical Support Services (TSS) Division', short: 'Technical Support Services',
    lede: 'Technical Support Services provides essential operational and technical support for museum activities, exhibitions and public programmes.',
    unitsLabel: 'Specialized units:',
    units: [
      ['Radio', 'Produces and supports radio programmes that communicate museum activities and promote awareness of Botswana’s heritage.'],
      ['Audiovisual', 'Provides audiovisual support and multimedia services for exhibitions, educational activities and public programmes.'],
      ['Design', 'Supports exhibition design, interpretation and the visual presentation of museum collections and information.'],
      ['Maintenance', 'Maintains museum buildings, facilities, equipment and infrastructure to support effective operations.'],
    ],
    cover: `${IMG}/about/about_photo_03.jpg`,
    photos: [],
    links: [['#/exhibitions', 'Exhibitions']],
  },
];

/* Traditional crafts documented by the Ethnology Division (previous
   website, lightly copy-edited). */
export const CRAFTS = [
  {
    key: 'basketry', title: 'Basketry', dir: `${ETH}/01basketary`,
    photos: ['ethnology_photo_basketry01.jpg', 'ethnology_photo_basketry02.jpg', 'ethnology_photo_basketry03.jpg', 'ethnology_photo_basketry04.jpg', 'ethnology_photo_basketry05.jpg'],
    sections: [
      { p: ['A basket is a container made by hand through interlacing or coiling and sewing vegetable fibres, twigs, roots, canes, grasses or other materials. Basketry was commonly used in house construction and furnishing, e.g. walls, roofs, doors and rugs; for household utensils for storing and serving food; in transport (carrying and collecting baskets); in hunting and fishing; as clothing in warfare and as musical instruments. Baskets were also used as gambling trays, cult symbols and ceremonial bowls.'] },
      { h: 'Making a basket', p: [
        'The materials used to make a basket are determined by the availability of wild plants and the craftsman’s preferences.',
        'To dye the basket in different colours, the motlhakola tree was used: its roots or bark were boiled with palm fronds to dye them in various colours, and its fruit gave a purple colour. The design of a basket is determined by its use, size and decorative patterns, which vary according to ethnic group and environment. The Basarwa along the Nata River are famous for their baskets (tutwane, pitsa ya mokolwane, manke and leselo). The tutwane, pitsa ya mokolwane and manke are made by women and girls, whilst the leselo was made by women only.',
        'The Hambukushu are among the most skilled basket makers in Botswana. The Okavango Delta provides excellent grasses and reeds, and in this area baskets are made by both women and men. The men are experts in making large cylindrical grain bins called shishete.',
      ], photos: ['ethnology_photo_basketry_making01.jpg', 'ethnology_photo_basketry_making02.jpg'] },
      { h: 'Steps in making baskets', ol: [
        'A bowl of water is essential for soaking leaves and keeping the hands moist.',
        'A knife is used to cut and split leaves to bind the coil.',
        'A pounding stone is used to flatten leaves and remove unwanted twigs.',
        'An awl is used to make holes for the binding material.',
        'Basket weaving starts from the centre and works outwards.',
      ] },
    ],
  },
  {
    key: 'pottery', title: 'Pottery', dir: `${ETH}/02pottery`,
    photos: ['ethnology_photo_pottery01.jpg', 'ethnology_photo_pottery02.jpg', 'ethnology_photo_pottery03.jpg', 'ethnology_photo_pottery04.jpg'],
    sections: [
      { p: [
        'Traditional pottery is one of the most important elements of Botswana’s arts and crafts. Pottery is traditionally done by women, although in some ethnic groups it is done by men. Earthenware skills are passed on to daughters and granddaughters through observation and practice. Potters use clay soil, weathered sandstone, iron oxide, cow dung and water. Clay pots come in different shapes and sizes depending on their use, e.g. storing beer, fermenting sorghum, fetching water, ancestral worship and traditional healing rituals.',
        'There are taboos around pot making: prohibitions relating to sexual intercourse, pregnancy and menstruation are common, and a woman in mourning is thought to bring bad luck to the process. In some ethnic groups clay pots are used during important festivals such as rainmaking. They were also used as improvised coffins to bury a stillborn foetus or a placenta, and to heal sicknesses such as mumps (makidiane): a person with mumps was told to put their head inside a clay pot and tell the mumps to remain there.',
      ] },
      { h: 'Steps in making a pot', ol: [
        'Collecting clay, moraga, moralala and letsoku. The women collect the clay themselves.',
        'Preparing the material: the clay and sandstone are sieved to remove impurities, then the clay is soaked to make it soft and malleable. Clay can be stored damp until it attains a sour smell (souring), which improves its elasticity.',
        'Forming the vessel: it is moulded by hand, using a potsherd, a dish or a flat stone to smooth the surface and align the pot.',
        'The pot is dried slowly in the shade to prevent cracking during firing. After drying, decorative patterns can be drawn with natural oxides.',
        'The pots are fired in a pit kiln to make them strong and durable, then checked by pouring water inside: a well-fired pot produces a high-pitched sound.',
      ] },
    ],
  },
  {
    key: 'beadwork', title: 'Beadwork', dir: `${ETH}/03beads`,
    photos: ['ethnology_photo_beads01.jpg', 'ethnology_photo_beads02.jpg', 'ethnology_photo_beads03.jpg', 'ethnology_photo_beads04.jpg', 'ethnology_photo_beads05.jpg'],
    sections: [
      { p: ['The ostrich eggshell bead is the oldest known man-made bead. Today, ostrich eggshell beads are still made by Basarwa women of the Kalahari Desert, to whom ostrich eggs are a symbol of good luck and good fortune. Broken eggshells were made into beads for trading and decoration, and today also for income generation and self-expression. Basarwa women are fond of ornaments, and even newborn babies wear strings of beads around their ankles, wrists and necks. In some African societies beaded objects also served to distinguish rulers from ordinary people: beads communicated cultural values in a symbolic language that expressed rank, religion, politics and artistic attitude.'] },
      { h: 'Steps in making ostrich eggshell beads', ol: [
        'Broken eggshells are collected and made into small chips.',
        'Each chip is rounded with a springbok horn or nail clippers – whichever is readily available.',
        'A hole is started in each chip with a hand drill, then punched through with a small awl.',
        'The drilled chips are strung and laid across a wooden board.',
        'Using a whetstone, the chips are polished by hand. The strings are wetted, rubbed, then wetted some more. Through this tedious and strenuous task the rough chips are transformed into lovely, luminous beads.',
      ] },
    ],
  },
  {
    key: 'iron', title: 'Iron smelting and blacksmithing', dir: `${ETH}/04iron`,
    photos: ['ethnology_photo_iron01.jpg', 'ethnology_photo_iron02.jpg', 'ethnology_photo_iron03.jpg', 'ethnology_photo_iron04.jpg'],
    sections: [
      { p: [
        'Iron smelting was introduced into southern Africa some 1,500 years ago. Iron was initially mined with open-cast methods, but shafts and adits were soon being sunk to considerable depths. Often the rock was heated with fire and then cracked by pouring cold water on it. The furnace was built of clay and layered inside with ore and charcoal. It was repeatedly heated by blowing air into it with a pair of bellows, creating temperatures above 900 °C which reduced the ore to a bloom. This was hammered repeatedly to remove impurities and create a solid piece of iron, ready for the blacksmith to shape into weapons, jewellery or tools.',
        'Iron smelting and blacksmithing were associated with myths and taboos, usually of a sexual or menstrual nature. Livingstone observed that among the Bakgatla, smelters refused admittance to anyone who had had intercourse during the period of the year when smelting began, lest they “bewitch the iron” – that is, burn it to a cinder through too brisk a use of the bellows.',
      ] },
      { h: 'Bellows and tuyères (moubelo)', p: ['As is so often the case with specialist skills, iron smelting and blacksmithing have traditionally been the occupation of a few families, a trend that continued during the colonial period. Tuyères are nozzles through which air is forced into the furnace during smelting. Bellows contain an airbag and emit a stream of air when squeezed; they are used by blacksmiths and iron smelters to blow air into a fire. These traditional instruments have since been developed for modern use.'] },
    ],
  },
  {
    key: 'wood-carving', title: 'Wood carving', dir: `${ETH}/05wood`,
    photos: ['ethnology_photo_wood01.jpg', 'ethnology_photo_wood02.jpg', 'ethnology_photo_wood03.jpg', 'ethnology_photo_wood04.jpg', 'ethnology_photo_wood05.jpg'],
    sections: [
      { p: [
        'Early people used stone tools; with time they found other ways of making tools, and wood was an alternative that was easier to work than stone. Wood carving became a men’s craft. Young boys learnt from each other while herding livestock, making small household utensils such as spoons, knobkerries and stools. As they grew older they mastered the craft and produced mortars, pestles and kgotla chairs. In areas such as Chobe and the Okavango, where vegetation is abundant, dugout canoes are carved from trees such as mukwa, sausage tree and jackalberry.',
        'Wood carving is still practised in many parts of Botswana. Around Shashe and Tonota, for example, carvers produce toys, decorative utensils such as sugar basins, and walking sticks. Objects are made in winter, when trees have shed their leaves and hold less water in their stems, so the wood is strong and does not crack. To give them a long life, wooden objects are smeared with substances such as letsoku, leshaba and cow dung, and kept in or outside the hut or hung on kgotla logs or trees.',
      ] },
    ],
  },
];

export const deptByKey = (k) => DEPARTMENTS.find((d) => d.key === k) || null;
export const craftByKey = (k) => CRAFTS.find((c) => c.key === k) || null;
