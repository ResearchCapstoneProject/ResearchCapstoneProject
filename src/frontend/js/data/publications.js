/* Publications, grouped by type ("Publications" in the navigation).

   The Plant and Insect of the Month texts are transcribed from the Natural
   History Division's posters as published. The heritage trail maps are a
   publication type too, but they live in Explore next to the places they
   describe; the type here only points there. */
import { IMG, PUB } from './about.js';

const THUMB = `${IMG}/publications`;
const BRO = `${PUB}/brochures`;
const NH = `${IMG}/natural-history/pix`;

export const PUB_TYPES = [
  {
    key: 'brochures', title: 'Brochures', eyebrow: 'Downloads',
    lede: 'Visitor brochures for the National Museum and the monuments and natural sites in its care. Each brochure is a printable PDF.',
    items: [
      { title: 'Botswana National Museum', date: '2015', thumb: `${THUMB}/MB_nationalmuseum.jpg`, pdf: `${BRO}/NM_Brochure2015_08103.pdf`, href: '#/visit' },
      { title: 'Tsodilo Hills', date: 'Nov 2015', thumb: `${THUMB}/MB_01tsodilo.jpg`, pdf: `${BRO}/MB_Tsodilo_TS201511.pdf`, href: '#/explore/monuments/tsodilo' },
      { title: 'Old Palapye', date: 'Nov 2015', thumb: `${THUMB}/MB_02Oldpalapye.jpg`, pdf: `${BRO}/MB_OldPalapye_PA201511.pdf`, href: '#/explore/monuments/old-palapye' },
      { title: 'Moremi – Manonnye Gorge', date: 'Nov 2015', thumb: `${THUMB}/MB_03Moremi.jpg`, pdf: `${BRO}/MB_MoremiGorge_MR201511.pdf`, href: '#/explore/monuments/moremi' },
      { title: 'Three Dikgosi Monument', date: 'Nov 2015', thumb: `${THUMB}/MB_04kgosi.jpg`, pdf: `${BRO}/MB_ThreeDigkosi_TH201511.pdf`, href: '#/explore/monuments/three-dikgosi' },
      { title: 'Gcwihaba Caves', date: 'Nov 2015', thumb: `${THUMB}/MB_05Gcwihaba.jpg`, pdf: `${BRO}/MB_GcwihabaCaves_GC201511.pdf`, href: '#/explore/monuments/gcwihaba' },
      { title: 'Domboshaba', date: 'Nov 2015', thumb: `${THUMB}/MB_06Domboshaba.jpg`, pdf: `${BRO}/MB_Domboshaba_DO201511.pdf`, href: '#/explore/monuments/domboshaba' },
      { title: 'Majojo Hill', date: 'Nov 2015', thumb: `${THUMB}/MB_07Majojo.jpg`, pdf: `${BRO}/MB_Majojo_MJ201511.pdf`, href: '#/explore/monuments/majojo' },
      { title: 'Manyana Rock Paintings', date: 'Nov 2015', thumb: `${THUMB}/MB_08Manyana.jpg`, pdf: `${BRO}/MB_Manyana_MN201511.pdf`, href: '#/explore/monuments/manyana' },
      { title: 'Mogonye – Mmamotshwane Gorge', date: 'Nov 2015', thumb: `${THUMB}/MB_09Mogonye.jpg`, pdf: `${BRO}/MB_Mogonye_MG201511.pdf`, href: '#/explore/monuments/mogonye' },
      { title: 'Matsieng', date: 'Nov 2015', thumb: `${THUMB}/MB_10Matsien.jpg`, pdf: `${BRO}/MB_Matsieng_MT201511.pdf`, href: '#/explore/monuments/matsieng' },
      { title: 'Old Shoshong', date: 'Nov 2015', thumb: `${THUMB}/MB_11Shoshong.jpg`, pdf: `${BRO}/MB_Shoshong_SH201511.pdf`, href: '#/explore/monuments/old-shoshong' },
      { title: 'National Herbarium', date: 'Nov 2015', thumb: `${THUMB}/MB_12Herbarium.jpg`, pdf: `${BRO}/MB_Herbarium_HE201511.pdf`, href: '#/explore/herbarium' },
      { title: 'National Botanical Garden', date: 'Nov 2015', thumb: `${THUMB}/MB_13Botanical.jpg`, pdf: `${BRO}/MB_BotanicalGarden_BO201511.pdf`, href: '#/explore/botanical-garden' },
    ],
  },
  {
    key: 'zebras-voice', title: 'Zebra’s Voice', eyebrow: 'Museum magazine',
    lede: 'The Zebra’s Voice is the museum’s magazine on Botswana’s heritage, research and museum life.',
    items: [
      { title: 'Zebra’s Voice 2015', date: '2015', thumb: `${THUMB}/zebras2015.jpg`, pdf: `${PUB}/zebras-voice/ZebrasVoice2015.pdf` },
      { title: 'Zebra’s Voice 2014', date: '2014', thumb: `${THUMB}/zebras2014.jpg`, pdf: `${PUB}/zebras-voice/ZebrasVoice2014.pdf` },
      { title: 'Zebra’s Voice 2013', date: '2013', thumb: `${THUMB}/zebras2013.jpg`, pdf: `${PUB}/zebras-voice/ZebrasVoice2013.pdf` },
    ],
  },
  {
    key: 'plant-of-the-month', title: 'Plant of the Month', eyebrow: 'Natural History · National Botanical Garden',
    lede: 'Each month the National Botanical Garden introduces one of Botswana’s plants.',
    items: [
      {
        title: 'The Mighty Mophane Tree', date: 'November 2025',
        pdf: `${PUB}/plant-of-the-month/plant-of-the-month-mophane-tree-november-2025.pdf`,
        p: ['The November 2025 poster covers the mophane tree: its description, distribution and habitat, ecological importance and cultural and practical significance. Open the PDF to read it.'],
      },
      {
        title: 'Aloe zebrina Baker', date: 'June 2025',
        thumb: `${IMG}/web/natural-history/pix/plant-of-the-month-june-bg.jpg`, full: `${NH}/plant-of-the-month-june-bg.jpg`,
        pdf: `${PUB}/plant-of-the-month/plant-of-the-month-june-print.pdf`,
        facts: [['Family', 'ASPHODELACEAE'], ['Local name', 'Kgophane / Kgope'], ['Common name', 'Variegated aloe / Zebra aloe']],
        blocks: [
          ['Description', 'It is a small, compact succulent aloe plant with distinctive spots on the leaves. Spots varies in sizes, shape and colour, mostly appearing green with whitish or greyish markings. Grows as single or form colonies through suckering. Has a fleshy succulent leaves with brown tipped teeth along margins. Flowers pale red, tubular form on a branched stalks, blooms in summer. Produces dehiscing capsule fruit with many small black seeds.'],
          ['Growth habit', 'Grows on different types of soils. Able to tolerate arid to semi-arid conditions, grow on both sun and semi shade areas. It is widely distributed throughout Botswana and other Southern African countries.'],
          ['Uses', 'Can be planted for decoration (ornamental purposes) or garden plant. Its roots are used to make dyes for weaving baskets or ropes. The leaves are used for medicinal purposes: cleaning the system for women after birth, disinfectant for wounds, human skin treatment and treatment of respiratory diseases on chickens.'],
        ],
      },
    ],
  },
  {
    key: 'insect-of-the-month', title: 'Insect of the Month', eyebrow: 'Natural History · Entomology unit',
    lede: 'Each month the Entomology unit of the Natural History Division puts one of Botswana’s insects in the spotlight.',
    items: [
      {
        title: 'Meet the Alates (winged termites)', date: 'December 2025',
        pdf: `${PUB}/insect-of-the-month/insect-of-the-month-december-2025.pdf`,
        p: [
          'Winter being a distant memory, the summer rains have once again nourished the ground with much needed moisture and in turn triggering a remarkable natural event- the emergence of the Alates (winged termites). Yes! those very same annoying insects that are always on our doorsteps and shedding their wings all over the place after it rains.',
          'Their appearance serves as an ecological indicator of seasonal change and more importantly a significant phase in a termites’ life cycle. Alates time their swarming flights with the first rains, seizing the window of increased humidity and soft earth to mate, disperse and establish the next generation of termite colonies. Because of their appearance after the first rains, most people use their sighting as a mark for the beginning of the agricultural season.',
        ],
        blocks: [
          ['Description and Importance', 'Known as the sexually mature reproductive caste of termites, Alates are easily noticed by their wings and darkly pigmented body. Alates have two pairs of long, equal-sized wings that extend way beyond their abdomen which are ideal for their swarming flights. Once they land and pair with a mate, Alates shed their wings and transition into primary queens and kings. Though often misunderstood and considered an annoyance especially after it rains, Alates play crucial ecological roles:',
            ['Improved soil health – by tunneling through the soil to make new colonies these insects improve soil aeration and nutrient turnover.', 'Decomposers - they carry out the decomposition of dead organic matter thanks to symbiotic gut microorganisms.', 'Source of food - Alates support the ecological food chain, serving as food for birds, reptiles, fish etc.']],
          ['Fun Facts', 'Did you know that Alates are considered a delicacy in some cultures around the world?'],
        ],
      },
      {
        title: 'Stink bugs (Nezara viridula)', date: 'July 2025',
        /* Fig. 1 of the draft: the museum's own specimens. Fig. 2 is an
           iNaturalist photo and is kept in the repository but not shown,
           pending permission (third-party material). */
        thumb: `${NH}/insect-of-the-month-july-2025-image2.jpeg`, cap: 'Entomology collection specimen',
        pdf: `${PUB}/insect-of-the-month/insect-of-the-month-july-2025.pdf`,
        facts: [['Order', 'HEMIPTERA'], ['Family', 'PENTATOMIDAE'], ['Species', 'Nezara viridula'], ['Local name', 'Podile'], ['Common name', 'Stink bugs']],
        p: ['This month we shine the spotlight on one of nature’s pungent little creatures- the stink bugs. For the month of May, stink bugs have been the subject of increased sightings across Botswana, appearing in workplaces and homes alike, with people taking to social media about this unusual and yet, not so strange occurrence with the approach of winter.'],
        blocks: [
          ['Description', 'Stink bugs are recognised by their shield shaped bodies and by the unpleasant odour they release when threatened or disturbed – a defence mechanism that gave origin to their unique name. While some species are herbivorous pests that can cause damage to crops, others are predatory, feeding on other insects thus playing a role in natural pest control. This just goes to show the diversity within this family and highlights their noteworthy presence in the local ecosystem.'],
          ['Fun facts', '', ['Scent defence: their trademark smell comes from glands located on their abdomen. This scent is non-toxic to humans but pungent enough to deter any would be attackers.', 'Feeding habits: stink bugs feed on a wide variety of plants, using their needle like mouthparts to suck juices from plants, fruits and vegetables.', 'Winter hideouts: when cool weather approaches, these smart bugs often seek warm places to hibernate – often times choosing our homes as shelter away from the cold.']],
        ],
      },
    ],
  },
  {
    key: 'heritage-trails', title: 'Heritage trail maps', eyebrow: 'Trips · National Trails',
    lede: 'The museum’s heritage trail maps are now part of the Explore section, next to the monuments and museums along each route.',
    explore: '#/explore/trails',
  },
];

export const pubTypeByKey = (k) => PUB_TYPES.find((t) => t.key === k) || null;
