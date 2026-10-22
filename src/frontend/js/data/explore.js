/* Heritage places outside the museum building: the "Explore" section.

   Texts come from the previous DNMM website (lightly copy-edited), except
   the two museum overviews marked BRIEF, which are quoted word for word from
   the museum's collaboration brief (October 2026) and must not be edited.

   `pos` is [latitude, longitude]. Where the old site gave coordinates they
   are used; the rest were placed from the village or town named in the text
   and are approximate -- the page says so. Please have the museum check
   them before launch. */
import { IMG, PUB } from './about.js';

const M = `${IMG}/monuments`;
const BRO = `${PUB}/brochures`;

/* Reused on every monument page. */
const PERMISSION = 'Researchers and commercial photographers should contact the Botswana National Museum for permission.';
const actNote = (name) => `${name} is a national monument administered by the Botswana National Museum and protected by the revised Monuments and Relics Act (2001). Following a few basic guidelines will make your visit worthwhile and ensure the continued protection of a part of Botswana’s unique heritage.`;

export const SECTIONS = [
  {
    key: 'monuments', title: 'Monuments', eyebrow: 'National monuments',
    lede: 'Rock art, stone-walled towns, gorges and caves: national monuments across Botswana in the care of the National Museum, protected by the Monuments and Relics Act (2001).',
    cover: `${IMG}/home-slides/imagetop03.jpg`,
  },
  {
    key: 'museums', title: 'Other museums', eyebrow: 'Regional and specialised museums',
    lede: 'Regional museums, an open-air museum and institutional museums developed under the guidance of the DNMM.',
    cover: `${IMG}/museums/02bonnington/title_monuments_image.jpg`,
  },
  {
    key: 'botanical-garden', title: 'Botanical Garden', eyebrow: 'Natural History Division',
    lede: 'Nine hectares of indigenous plants in Gaborone – trails, a visitor centre and the National Herbarium.',
    cover: `${IMG}/natural-history/01botanical/title_monuments_image.jpg`, single: 'botanical-garden',
  },
  {
    key: 'herbarium', title: 'Herbarium', eyebrow: 'Natural History Division',
    lede: 'Botswana’s national reference collection of preserved plant specimens, founded in 1975.',
    cover: `${IMG}/natural-history/02herbarium/title_monuments_image.jpg`, single: 'herbarium',
  },
  {
    key: 'world-heritage', title: 'World Heritage Sites', eyebrow: 'UNESCO World Heritage',
    lede: 'Botswana’s two UNESCO World Heritage Sites: the Tsodilo Hills and the Okavango Delta.',
    cover: `${IMG}/home-slides/imagetop01.jpg`,
  },
  {
    key: 'trails', title: 'Heritage trails', eyebrow: 'Trips · National Trails maps',
    lede: 'Four heritage trails published by the museum link monuments, museums and natural sites into journeys through Botswana. Download the trail maps for the road.',
    cover: `${IMG}/trails/title_image_01.jpg`,
  },
];

/* ------------------------------------------------------------------ sites */
export const SITES = [
  /* ---------------- monuments ---------------- */
  {
    id: 'gcwihaba', section: 'monuments', name: 'Gcwihaba Caves', place: 'Ngamiland, north-west Botswana',
    designation: 'Natural', pos: [-20.0243, 21.3543], exact: true,
    cover: `${M}/01gcwihaba/title_monuments_image.jpg`, card: `${M}/01gcwihaba/monument_photo_Caves02.jpg`,
    brochure: `${BRO}/MB_GcwihabaCaves_GC201511.pdf`,
    photos: [`${M}/01gcwihaba/monument_photo_Caves02.jpg`, `${M}/01gcwihaba/monument_photo_Caves03.jpg`],
    sections: [
      { h: 'About the caves', p: [
        'Gcwihaba Caves are in the north-west of Botswana, in Ngamiland District west of the Okavango Delta, at S20°01.456′ E21°21.258′ in community-controlled hunting area NG4. They are also known as Drotsky’s Caves, because local residents showed them to Martinus Drotsky, a Ghanzi farmer, in June 1934.',
        'The caverns formed in dolomite marble of the Precambrian Damara age, when wetter conditions and acidulated water flowing underground dissolved the rock; a river forming nearby later lowered the water table and emptied them. Cave formations, including fascinating stalactites and stalagmites, began to form 3–2 million years ago, and minor seasonal precipitation still occurs today. The caverns are also home to bats, rats and insects.',
      ] },
      { h: 'Gcwihaba plants', img: `${M}/01gcwihaba/monument_photo_Plants01.jpg`, p: ['A fig tree with long trailing roots, Ficus cordata, grows at the entrance of the caves. The succulent spurge Euphorbia monteiri is found in the grassland between Gcwihaba and Xai-Xai village, and a large aloe, a variety of Aloe littoralis, grows in the limestone around Gcwihaba.'] },
      { h: 'The Xai-Xai community and the caves', img: `${M}/01gcwihaba/monument_photo_Community01.jpg`, p: ['Xai-Xai village, in western Ngamiland 10 km east of the Namibian border, is the nearest village to the caves. The community uses the caves to generate income through tourism without compromising their authenticity. The activities are run by the Xai-Xai Tlhabololo Trust on behalf of the community.'] },
      { h: 'Access', img: `${M}/01gcwihaba/monument_photo_Access01.jpg`, p: [
        'There are currently two routes, both for four-wheel-drive vehicles only.',
        'Nokaneng route: the road goes 122 km west from Nokaneng (on the Maun–Shakawe tar road) to Xangwa village, then turns south for 48 km to Xai-Xai. The caves are a further 36 km south-east of Xai-Xai – about a six-hour drive. This is the preferred route, as it is busier and less remote.',
        'Tsau route: about 9 km north-west of Tsau (on the Maun–Shakawe tar road), the road runs west for 144 km to the caves – about a four-and-a-half-hour drive.',
      ] },
      { h: 'Planning your visit', img: `${M}/01gcwihaba/monument_photo_Planning01.jpg`, p: ['Make sure you bring:'], ul: ['A torch and extra batteries', 'Safety helmets', 'Masks and hiking shoes'] },
      { h: 'Some rules', img: `${M}/01gcwihaba/monument_photo_Rules01.jpg`, p: [actNote('Gcwihaba')], ul: ['Report to the gatehouse for assistance.', 'Take your litter away with you or use the bins provided.', 'Do not touch or interfere with cave formations.', 'Firearms and pets are not allowed.', 'Do not smoke, drink or eat in the caves. Only water is allowed.'], note: PERMISSION },
    ],
  },
  {
    id: 'tsodilo', section: 'monuments', also: ['world-heritage'], name: 'Tsodilo Hills', place: 'Ngamiland, near Nxamasere',
    designation: 'Natural & Cultural · World Heritage Site', pos: [-18.7632, 21.7259], exact: true,
    cover: `${IMG}/home-slides/imagetop03.jpg`, card: `${M}/02tsodilo/monument_photo_Welcome01.jpg`,
    brochure: `${BRO}/MB_Tsodilo_TS201511.pdf`,
    photos: [`${M}/02tsodilo/monument_photo_Welcome01.jpg`, `${M}/02tsodilo/monument_photo_Welcome02.jpg`],
    sections: [
      { h: 'Welcome to Tsodilo: Mountain of the Gods', p: ['Rising majestically from the surrounding Kalahari sandveld, the Tsodilo Hills are Botswana’s highest peak at 1,395 metres and a sacred landmark. For thousands of years the area has attracted people to live, trade and visit. A local !Kung legend says the hills were once a family – father, mother and children – hence the names of the cliffs: Male, Female and Child. Tsodilo has many names: the local !Kung call it the copper bracelet; the Hambukushu refer to it as the precipitous rocks. Laurens van der Post, in his book The Lost World of the Kalahari, described Tsodilo as the Slippery Hills. He also called it the Mountain of the Gods – an appropriate name for one of Botswana’s foremost natural wonders and timeless cultural sites.'] },
      { h: 'Archaeology', img: `${M}/02tsodilo/monument_photo_RockPaintings01.jpg`, p: [
        'Tsodilo is also rich in archaeological finds. Three rock shelters – White Painting Shelter, Depression Rock Shelter and Rhino Cave – have been excavated. Over twenty specularite mines and the remains of two villages, Divuyu and N!oma, dating back to 800 AD have been uncovered. Pots, metal spearheads, stone tools, glass beads and even fish bones from Lake Tsodilo, which existed 10,000 years ago, help form a picture of ancient life here. From these artefacts we know of local communities and immigrants from the Zambezi and Congo rivers who were involved in trade, body decoration, the production of stone tools, pottery and jewellery, as well as the keeping of cattle and small livestock.',
        'Research suggests that our distant relatives have been at Tsodilo for perhaps 100,000 years, and local communities have had rich cultures there for over 1,000 years – still apparent in the !Kung and Hambukushu communities that live around Tsodilo today.',
      ] },
      { h: 'Cultural heritage', img: `${M}/02tsodilo/monument_photo_RockPaintings02.jpg`, p: [
        'Tsodilo is one of Africa’s premier rock art sites and a World Heritage Site. Over 4,500 images have been painted at 400 sites, most of them dating to between 850 AD and 1100 AD.',
        'The red and white paintings portray wild and domestic animals, geometric patterns, people and even what appears to be a whale! They were finger-painted with pigments ground from haematite (red), charcoal and calcrete (white), possibly mixed with animal fat, blood, egg white, honey, sap or urine.',
      ] },
      { h: 'Natural heritage', img: `${M}/02tsodilo/monument_photo_Natural01.jpg`, p: ['Tsodilo’s cultural heritage is matched by its natural beauty. It is visited by leopard, vervet monkey, aardvark, warthog, brown hyaena, kudu, wild dog and elephant, and is home to the Tsodilo rock gecko, found nowhere else. Tsodilo is also a great source of honey, and there are many species of birds and insects. Its plants include baobabs, acacias, morula and mophane, and sengaparile, a tuber marketed as Kalahari devil’s claw and used to treat high blood pressure. The mongongo tree produces a protein-rich nut that has been a local source of food for at least 9,000 years!'] },
      { h: 'Some facts', img: `${M}/02tsodilo/monument_photo_Facts01.jpg`, ul: [
        'Tsodilo is in Ngamiland, in the north-west of Botswana. Access is from a signposted road near the village of Nxamasere. This gravel road is suitable for 4x2 vehicles, but some sand roads around Tsodilo can only be driven with 4x4 vehicles. There is also an airstrip, and charter flights are available from Maun.',
        'Tsodilo is beautiful throughout the year. From April to September the heat and mosquitoes are less noticeable. Seven hiking trails vary in length and difficulty, and community guides are available to assist tourists and tour operators.',
        'Tsodilo has a campsite, a museum complex with a staff office and ablution facilities for visitors, and a craft shop run by the Tsodilo Community Trust.',
      ] },
      { h: 'Some rules', img: `${M}/02tsodilo/monument_photo_Rules01.jpg`, p: ['Tsodilo is a World Heritage Site and a national monument. It is administered by the Botswana National Museum and protected by the Monuments and Relics Act (2001). Following a few basic guidelines will make your visit worthwhile and ensure the continued protection of a part of Botswana’s unique heritage.'], ul: ['Report to the main gate for assistance.', 'Do not litter.', 'Please do not touch or interfere with the rock art or any other feature.', 'Do not remove any artefacts.', 'Firearms and pets are not allowed.'], note: PERMISSION },
    ],
  },
  {
    id: 'three-dikgosi', section: 'monuments', name: 'Three Dikgosi Monument', place: 'Central Business District, Gaborone',
    designation: 'Historical', pos: [-24.6464, 25.9110],
    cover: `${M}/03threedikgosi/title_monuments_image.jpg`, card: `${M}/03threedikgosi/monument_photo_ThreeDikgosi01.jpg`,
    brochure: `${BRO}/MB_ThreeDigkosi_TH201511.pdf`,
    photos: [1, 2, 3, 4, 5, 6, 7].map((n) => `${M}/03threedikgosi/monument_photo_ThreeDikgosi0${n}.jpg`),
    sections: [
      { p: ['The Three Dikgosi Monument was erected to recognise the initiative of the three dikgosi – Khama III, Sebele I and Bathoen I – in particular, and of Batswana in general, in advancing their cause through peaceful negotiation and diplomacy: Ntwa kgolo ke ya molomo! (the greatest war is that of words). The monument stands in the Central Business District of Gaborone.'] },
      { h: 'Before the protectorate', p: [
        'The story begins before this land was called Botswana: a story of first encounters between the hunter-gatherer peoples who had lived in the land for hundreds of years and, later, Bantu farmers. Between 1823 and 1844 the people of Botswana had to build their own authority and resist invasion, especially from the Kololo and amaNdebele. These two decades of fighting and turmoil in the western, central and north-western areas led to the temporary breakdown and displacement of merafe (ethnic groups). The turmoil was mainly driven by the trade in guns and game products: the more guns a morafe had, the more it tended to attack others. The people of Botswana were also victorious against the Boers of the Transvaal.',
        'Threatened by the Transvaal Boers, the leaders of different Tswana groups asked for British protection in the 1850s, but it was not granted. London Missionary Society missionaries such as John Mackenzie, Robert Moffat and David Livingstone also tried, without success, to obtain British protection – the British believed Botswana was just a desert with no major economic value.',
      ] },
      { h: 'The Bechuanaland Protectorate', p: [
        'In 1885 Britain suddenly declared that it had placed all the land of the Batswana under its protection. When Charles Warren made the announcement, Batswana rulers were surprised to be given protection when they had not asked for it. Britain acted mainly to prevent German and Boer expansion in southern Africa, and in particular to protect the road to the north connecting the Cape with Barotseland and Bulawayo through Vryburg, Mafikeng, Gangwaketse, Kweneng, Shoshong and Ngamiland – a road used by traders, hunters and missionaries.',
        'The people of Botswana accepted the protectorate, and their land became known as the Bechuanaland Protectorate. To them, being a protectorate meant protection from their enemies, not British involvement in their internal affairs. On accepting it, the dikgosi made clear that they did not want Britain to take over their land and sell it.',
        'The protectorate saved the territory from Boer and German incorporation. However, a new threat emerged from Cecil John Rhodes and his British South Africa Company (BSACo), which was established to colonise the areas north of the Cape. The only way Rhodes could build his railway through Tswana territory without opposition from Tswana rulers was to annex the Bechuanaland Protectorate to his company.',
      ] },
      { h: 'The journey to London', p: [
        'In July 1895 the Bakgatla, Bakwena, Barolong, Bangwaketse and Bangwato petitioned Queen Victoria against the incorporation of their land into the BSACo. When this proved ineffective, rather than negotiate with Rhodes, three dikgosi – Sebele I of the Bakwena, Bathoen I of the Bangwaketse and Khama III of the Bangwato – decided to travel to London and take their case directly to Queen Victoria and the British people. Reverend W. C. Willoughby travelled with them as interpreter, and the London Missionary Society organised their campaign. Between September and November 1895 the three dikgosi spoke against the BSACo in over forty towns and cities in Britain.',
      ] },
      { h: 'The demands of the three dikgosi', ul: ['Bechuanaland should remain a protectorate under the British Government and should not be incorporated or annexed into the BSACo.', 'The autonomy and independence of their land should be preserved.', 'Their land should not be sold.', 'Liquor should be prohibited in their land.'] },
      { p: [
        'They won the hearts of the British people and gained wide support against the BSACo, emphasising the need to remain a protectorate as agreed in 1885. The office of Joseph Chamberlain, then Secretary of State for the Colonies, was inundated with letters protesting against the proposed annexation. Realising that annexation might prove unpopular, Chamberlain changed his position: Rhodes and the BSACo would not get the protectorate, only land for the construction of the railway line.',
        'The three dikgosi returned home on 24 December 1895, after three months away, and were welcomed as heroes.',
      ] },
      { h: 'The three dikgosi', cols: [
        { h: 'Khama III', ul: ['Kgosi of the Bangwato, ruled 1872–73 and 1875–1923', 'Born c. 1835, died 1923', 'Son of Kgosi Sekgoma I; leader of the Mafolosa mophato, 1852', 'Baptised by Rev. Heinrich Schulenburg, 1860', 'Fervent Christian, moral reformer and temperance advocate', 'Welcomed the 1885 British Protectorate, but feared the loss of land to white settlers and became an enemy of Cecil Rhodes'] },
        { h: 'Sebele I', ul: ['Kgosi of the Bakwena, ruled 1892–1911', 'Born c. 1840s, died 1911', 'Son of Kgosi Sechele', 'Leader of the Mathubantwa mophato, 1856', 'Educated at home by David Livingstone and by William Ashton at Kuruman Bible School (Moffat Institution)', 'Highly critical of the 1885 British Protectorate proclaimed by Gen. Charles Warren'] },
        { h: 'Bathoen I', ul: ['Kgosi of the Bangwaketse, ruled 1889–1910', 'Born c. 1845, died 1910', 'Son of Kgosi Gaseitsiwe', 'Leader of the Maisantwa mophato, 1864', 'Educated at home by Rev. James Good; champion of the London Missionary Society, state church and temperance', 'Initially sceptical about the 1885 British Protectorate proclaimed by Gen. Charles Warren'] },
      ] },
    ],
  },
  {
    id: 'moremi', section: 'monuments', name: 'Moremi – Manonnye Gorge', place: 'Moremi village, Tswapong Hills',
    designation: 'Natural & Cultural', pos: [-22.615, 27.42],
    cover: `${M}/04moremi/title_monuments_image.jpg`, card: `${M}/04moremi/monument_photo_Moremi01.jpg`,
    brochure: `${BRO}/MB_MoremiGorge_MR201511.pdf`,
    photos: [`${M}/04moremi/monument_photo_Moremi01.jpg`, `${M}/04moremi/monument_photo_Moremi02.jpg`],
    sections: [
      { p: ['Moremi – Manonnye Gorge is one of the most spectacular gorges in the country, with a series of pools and waterfalls of outstanding natural beauty. The gorge is part of the geological features that developed through the weathering of resistant Precambrian quartzites, about 1,700 million years old, around the Tswapong Hills. The name Manonnye comes from its being a breeding place for vultures. The gorge is at Moremi village, 67 km east of Palapye.'] },
      { h: 'The community and the gorge', img: `${M}/04moremi/monument_photo_Community01.jpg`, p: ['According to oral history, the Moremi community were the first Bapedi or Batswapong to settle in the area, around the 1830s under Kgosi Mapulane. They first settled a kilometre from the mouth of the Manonnye spring, which provided water for them and their livestock. Today the community uses the gorge mainly for tourism, without compromising its authenticity as a sacred place, through the Moremi-Manonnye Conservation Trust.'] },
      { h: 'Cultural and natural heritage', img: `${M}/04moremi/monument_photo_CulturalHeritage01.jpg`, p: [
        'Historical remains in the area include the grave of Kgosi Mapulane and his successive sons, and the original village and school. Another feature is the legendary “Tshekedi’s road”, meant to connect Moeng College to Palapye; its construction was denounced by the badimo (ancestral spirits) and abandoned.',
        'Large mammals, birds, reptiles and amphibians are found around the gorge, although the numbers and diversity of larger mammals have probably declined. Most importantly, the gorge is a breeding place for the Cape vulture (Gyps coprotheres) and Verreaux’s eagle (Aquila verreauxii), both threatened, so great care must be taken to protect these birds.',
      ] },
      { h: 'Cultural beliefs and values', img: `${M}/04moremi/monument_photo_CulturalBeliefs01.jpg`, p: ['The Bapedi/Batswapong believe the gorge is a resting place for their badimo. A sacred cave in the gorge contains rock paintings; its exact location is a closely guarded secret of the Komana, a group who mediate between the badimo and the community. The badimo remain a powerful force in the daily social and spiritual life of the village. Taboos, beliefs and practices include:'], ul: ['The secrets of the badimo must not be divulged to unauthorised people.', 'Silence must be observed during ceremonies for the ancestors and during funerals.', 'During the ritual ceremony, usually performed at night, Komana people abstain from sexual activity. Visitors are warned if such a ceremony is to take place during their visit.', 'Drinking alcohol, making noise, swimming in the gorge and other disturbances are prohibited.'] },
      { h: 'Access', img: `${M}/04moremi/monument_photo_Access01.jpg`, p: ['From the Gaborone–Francistown A1 road, drive 20 km north of Palapye, then turn east onto the tarred Kgagodi road. About 14 km after the turn, a dirt track turns south for 33 km to Moremi village in the valley. The gorge is a further 4 km south of the village. All vehicles can reach the village, but a four-wheel-drive vehicle is needed to reach the gorge.'] },
      { h: 'Some rules', img: `${M}/04moremi/monument_photo_Rules01.jpg`, p: [actNote('Moremi – Manonnye Gorge')], ul: ['Respect and obey the taboos and beliefs associated with the gorge.', 'Pay entry fees at the Moremi-Manonnye Conservation Trust office before going to the gorge.', 'Camp only at designated campsites and park in designated car parks.', 'Use official routes only.', 'Do not litter.', 'Do not remove any artefacts from in and around the gorge.', 'Do not go near the vultures’ breeding areas.', 'Do not collect rock samples, crabs or plants, or fetch spring water.', 'Swimming in the pools is prohibited.'], note: PERMISSION },
    ],
  },
  {
    id: 'domboshaba', section: 'monuments', name: 'Domboshaba', place: 'Near Masunga, North-East District',
    designation: 'Cultural', pos: [-20.585, 27.385],
    cover: `${M}/05domboshaba/title_monuments_image.jpg`, card: `${M}/05domboshaba/monument_photo_domboshaba01.jpg`,
    brochure: `${BRO}/MB_Domboshaba_DO201511.pdf`,
    photos: [1, 2, 3].map((n) => `${M}/05domboshaba/monument_photo_domboshaba0${n}.jpg`),
    sections: [
      { p: [
        'Domboshaba literally means “red hill” or “eland hill”; it is known locally as Luswingo. The site is in north-eastern Botswana near Masunga, bordered by the Kalakamati–Masunga road to the south and the Vukwi River to the north-east. The monument covers the hilltop and the lower valley, between Vukwi and Kalakamati villages, about 9 km from Masunga and 7 km from Kalakamati. A tarred road runs 500 m from the site, which is easily accessible.',
        'The chief’s many wives are believed to have lived on the southern side, where a large enclosure contains many daga floor structures. The chief lived on the hilltop with some of his assistants.',
        'Local people revered the site, and it was protected by cultural taboos until the advent of colonialism, after which treasure hunting became widespread. Excavations by treasure hunters and archaeologists caused conservation problems for both the stone walls and daga structures – the most damaging were Frobenius’s excavations of 1928, which dug up almost every walled area. Only one enclosure retains its chequer decoration; this wall, in the lower valley, was restored with sponsorship from the Africa 2009 programme.',
        'The walls are built of granite with a few dolerite blocks; the dolerite may have been quarried nearby, as this stone was recorded during an archaeological survey. Common trees in and around the monument are mophane (Colophospermum mopane) and mofafu. Because of the mophane, the mophane moth caterpillar (Gonimbrasia belina) is abundant at the site just after the rainy season.',
      ] },
      { h: 'Cultural and natural heritage', img: `${M}/05domboshaba/monument_photo_Cultural01.jpg`, p: ['Domboshaba is an Iron Age site occupied towards the end of the Great Zimbabwe period. It is an open site of more than 8 hectares. On the hilltop, dry-stone walls with an average height of 1.8 metres form six private enclosures; the lower part has one main enclosure divided into several smaller ones. Most walls are free-standing, with a few platforms, mainly at entrances. Fifteen visible daga floors show where huts once stood.'] },
      { h: 'The community and the monument', img: `${M}/05domboshaba/monument_photo_Community01.jpg`, p: ['The community holds the monument in high esteem and believes it was occupied by their great ancestors. An organised cultural group holds an annual traditional festival here, with participants from the nearby villages and audiences from across the country.'] },
      { h: 'Restoration', img: `${M}/05domboshaba/monument_photo_Restoration01.jpg`, p: ['A condition survey carried out in 2003 led to the restoration of the wall with the chequer decoration in 2006. The access route (the uphill steps) was also stabilised.'] },
      { h: 'Flora and fauna', img: `${M}/05domboshaba/monument_photo_Flora01.jpg`, p: ['The eastern side of the site is a rocky landscape with rock plants, mostly large trees and ferns. The western side has sandy soil with sand-loving plants, mostly Terminalia species.'] },
      { h: 'Some rules', img: `${M}/05domboshaba/monument_photo_Rules01.jpg`, p: [actNote('Domboshaba')], ul: ['Use the designated parking area and report to the custodians’ office.', 'Complete the visitors’ book.', 'Please do not interfere with the stone walls or any other feature.', 'Do not remove any artefacts.', 'Please respect the local culture and leave objects at the site in their original place.', 'Cooperate with the custodians.', 'Take your litter away with you.'], note: PERMISSION },
    ],
  },
  {
    id: 'majojo', section: 'monuments', name: 'Majojo Hill', place: 'Near Serule, Central District',
    designation: 'Cultural', pos: [-21.9775, 27.2947], exact: true,
    cover: `${M}/06majojo/title_monuments_image.jpg`, card: `${M}/06majojo/monument_photo_majojo01.jpg`,
    brochure: `${BRO}/MB_Majojo_MJ201511.pdf`,
    photos: [`${M}/06majojo/monument_photo_majojo01.jpg`],
    sections: [
      { p: ['The Majojo monument is in the Central District, 5 km south of Serule along the Gaborone–Francistown highway, on the right before the Serule River. It is a small hill spreading to the west, at an altitude of 995 metres (21°58′39″ S, 27°17′41″ E), within a larger hardveld vegetation area characterised by mophane (Colophospermum mopane), knob thorn (Acacia nigrescens, mokoba) and wild syringa (Burkea africana, monato).'] },
      { h: 'Cultural heritage', img: `${M}/06majojo/monument_photo_Cultural01.jpg`, p: [
        'This is one of 105 known Zimbabwe Tradition elite sites in eastern Botswana, stretching from Nkange and Sowa Pan to the Limpopo River. More than 550 such stone-walled ruins are known in the sub-region.',
        'Majojo Ruin, at the east end of Majojo Hill, was a muzinda – the residence of a chief, or shé – some time between 1300 and 1650 AD, within a large state that extended over the high plateau of Zimbabwe and into the Northern Province of South Africa. Its architecture is characteristic of the Zimbabwe and Butua states: stones were quarried from outcrops by heating them with fire and quickly cooling them with water, breaking off stones with fairly straight sides that were shaped as bricks. The walls consist of distinct sections, suggesting they were built in stages.',
        'The house in front of the main entrance was probably the dare, where the chief judged court cases and the men gathered to discuss politics, trade and cattle – much like the kgotla found in every village in Botswana today.',
        'The ruin is sacred to local people as a tangible connection with their ancestors. Healing ceremonies are occasionally held here and offerings brought for the ancestors: you may find clay pots or gourds placed in the enclosure, and sometimes candles or coins.',
      ] },
      { h: 'Natural heritage', img: `${M}/06majojo/monument_photo_Natural01.jpg`, p: [
        'The geology of the area clearly influenced the monument’s construction: the tabular cleavage of the rocks easily produced brick-like stones without the need for advanced tools.',
        'Common plants include mophane (Colophospermum mopane), shepherd’s tree or stink bush (Boscia foetida, mopipi), sour plum (Ximenia americana, moretologa), knob thorn (Acacia nigrescens, mokoba / molalakgaka) and carrot tree (Steganotaenia araliacea, modumela). Less common is Orbea (seboka), of the family Apocynaceae, used for medicinal purposes and found inside the fenced area among the thickets.',
        'Insects at Majojo depend largely on the vegetation. The mophane moth caterpillar (Gonimbrasia belina) is most abundant when the mophane trees carry enough fresh foliage. Other Lepidoptera include Junonia cebrene, J. oenone, Charaxes and at least three species of Colotis, alongside cicadas, beetles, mantises, grasshoppers, bugs and spiders. Vertebrates include snakes (puff adder), lizards, skinks and kudu.',
      ] },
      { h: 'Some rules', img: `${M}/06majojo/monument_photo_Rules01.jpg`, p: [actNote('Majojo')], ul: ['Use the designated parking area and report to the custodians’ office to complete the visitors’ book.', 'Please do not interfere with the stone walls or any other feature.', 'Do not remove any artefacts.', 'Please respect the local culture and leave objects at the site in place.', 'Cooperate with the custodians.', 'Take all your litter away with you.'], note: PERMISSION },
    ],
  },
  {
    id: 'manyana', section: 'monuments', name: 'Manyana Rock Paintings', place: 'Manyana village, Kweneng District',
    designation: 'Natural & Cultural', pos: [-24.77, 25.55],
    cover: `${M}/07manyana/title_monuments_image.jpg`, card: `${M}/07manyana/monument_photo_Rockpaintings01.jpg`,
    brochure: `${BRO}/MB_Manyana_MN201511.pdf`,
    photos: [`${M}/07manyana/monument_photo_Rockpaintings01.jpg`, `${M}/07manyana/monument_photo_Rockpaintings02.jpg`],
    sections: [
      { p: [
        'The Manyana rock-painting shelters lie along a prominent hill on the south-western side of Manyana village. The area combines scenic beauty at the foot of the hills with historical attractions such as the Livingstone (motsara) tree and the rock paintings at Mma Sechele Gorge. The site is reached via the Gaborone–Thamaga and Gaborone–Boatle roads.',
        'Manyana has long been a place of settlement, and although settlement patterns have changed, it retains remnants of early settlement and forms an important part of Botswana’s cultural heritage. Its origins go back to when the Bahurutshe bo Manyana, fleeing the Boers in South Africa, first settled at Dimawe and sought refuge under Kgosi Sechele I of the Bakwena. In 1852 war broke out at Dimawe between the Boers and Batswana, the Boers demanding the return of the Bahurutshe.',
      ] },
      { h: 'Cultural heritage', img: `${M}/07manyana/monument_photo_Cultural01.jpg`, ol: [
        'Manyana rock paintings (Mma Sechele Gorge): the paintings are at the base of the Kolobeng hills, in five rock shelters along about 700 metres of rock outcrop. They are of special significance as one of the rare rock art sites in south-eastern Botswana, and the only one that has been test-excavated.',
        'Livingstone’s tree, in Motlhatseng ward in the western part of the village: a large tree under which Dr David Livingstone used to preach, carved with the letters “D.L.”',
      ] },
      { h: 'Natural heritage', img: `${M}/07manyana/monument_photo_Natural02.jpg`, p: [
        'The geology around Manyana is dominated by the Gaborone Granite Complex and the overlying Waterberg sediments, within the Kaapvaal Craton of southern Botswana. The Archaean granite is about 2,830 million years old and extends into South Africa around Mafikeng. It is overlain by rocks correlated with the Ventersdorp (Lobatse Volcanic Group), Transvaal and Waterberg Supergroups, ranging from 2,700 to 1,600 million years old. The hill on which the monument lies is entirely sedimentary and correlates with the Waterberg Supergroup, locally named the Manyelanong Formation; its structures tell of the palaeo-environment when the rocks were deposited some 1,800 to 1,600 million years ago.',
        'The geology probably influenced the rock art: the resistant, semi-metamorphosed sandstone forms vertical cliffs with smooth surfaces, ideal for painting in an upright position.',
        'The vegetation is typical shrub savanna of the eastern hardveld, with slightly denser and taller trees than the sandveld further west. Dominant species are weeping wattle (Peltophorum africanum), umbrella thorn (Acacia tortilis) and silver terminalia (Terminalia sericea).',
      ] },
      { h: 'Some rules', img: `${M}/07manyana/monument_photo_Rules01.jpg`, p: [actNote('Manyana')], ul: ['Use the designated parking area.', 'Report to the custodian’s office and complete the visitors’ book.', 'Do not remove any artefacts.', 'Cooperate with the custodians.', 'Take all your litter away with you.', 'Please do not touch or interfere with the paintings, engravings or any other feature.'], note: PERMISSION },
    ],
  },
  {
    id: 'matsieng', section: 'monuments', name: 'Matsieng', place: 'Near Rasesa, Kgatleng District',
    designation: 'Natural & Cultural', pos: [-24.342, 26.0913], exact: true,
    cover: `${M}/08matsieng/title_monuments_image.jpg`, card: `${M}/08matsieng/monument_photo_Matsieng01.jpg`,
    brochure: `${BRO}/MB_Matsieng_MT201511.pdf`,
    photos: [`${M}/08matsieng/monument_photo_Matsieng01.jpg`, `${M}/08matsieng/monument_photo_Matsieng02.jpg`],
    sections: [
      { p: [
        'According to legend, Matsieng, the first man, is the ancestor of the Tswana people. Life is believed to have begun when he emerged from a hole in the ground, followed by his people and animals. This happened long ago, when the rocks were still soft – so their feet sank in and left footprints when the rocks hardened.',
        'Matsieng is one of several sites in the country that can be called “creation sites” because of their association with the myth of the origin of life.',
      ] },
      { h: 'Cultural heritage', img: `${M}/08matsieng/monument_photo_Cultural01.jpg`, p: [
        'Matsieng is a flat sandstone outcrop of about 100 by 80 metres with two large holes that hold water for several months of the year, depending on rainfall. The three-metre-deep main hole holds water longest and has most of the engravings around it. Local people still collect water here for domestic use and religious rituals, and to water their small stock.',
        'Rock engravings, or petroglyphs, are a form of rock art found mostly in the interior plateau of southern Africa. Unlike rock paintings, which commonly show human figures, engravings generally show animal tracks. The Matsieng engravings mostly show feline tracks and human footprints. Despite the legend, archaeologists believe these tracks were pecked or engraved into the rock by people. The human footprints tend to be U-shaped, with toes shown as dots or dashes at the open end; most are between 120 and 290 mm long, with one giant footprint of 340 mm.',
        'There is some evidence linking the engravings, at least originally, with San religious practices and possibly animal magic. Such sites in Botswana seem to have been incorporated into Tswana mythology; Matsieng remained an important rainmaking place. Most engravings are now badly eroded by sun, rain and human and animal activity.',
        'Around the main hole there are several grinding patches and a few canoe-shaped sharpening grooves.',
      ] },
      { h: 'Natural heritage', img: `${M}/08matsieng/monument_photo_Natural01.jpg`, p: [
        'The outcrop is sandstone of the Waterberg series. The two big holes are clearly natural and may be volcanic vents that engulfed less consolidated material. They are home to a variety of aquatic insects and vertebrates.',
        'Whirligig beetles (Dineutus aereus) scavenge on insects that fall onto the water surface, while predatory backswimmers and diving beetles live below it, together with a wide diversity of insect larvae. Two species of diving beetles have been identified, Cybister tripunctatus and Eretes sticticus, both fierce predators. One frog species, Ptychadena, has been recorded so far, but more probably live here or visit at different seasons.',
      ] },
      { h: 'Location', img: `${M}/08matsieng/monument_photo_Location01.jpg`, p: ['The engravings are in the south-eastern hardveld of Botswana, in Kgatleng District (24°20.52′ S, 26°05.48′ E), near Rasesa village. Turn off the Gaborone–Francistown road 5 km from Rasesa; a signboard shows the way to the site, about a kilometre from the tar road along a gravel road.'] },
      { h: 'Some rules', img: `${M}/08matsieng/monument_photo_Rules01.jpg`, p: [actNote('Matsieng')], ul: ['Use the designated parking area, report to the custodians’ office and complete the visitors’ book.', 'Please do not interfere with the engravings or any other feature.', 'Do not remove any artefacts.', 'Cooperate with the custodians.', 'Take all your litter away with you.'], note: PERMISSION },
    ],
  },
  {
    id: 'mogonye', section: 'monuments', name: 'Mogonye – Mmamotshwane Gorge', place: 'Near Mogonye village, South-East District',
    designation: 'Natural', pos: [-24.88, 25.709],
    cover: `${M}/09mogonye/title_monuments_image.jpg`, card: `${M}/09mogonye/monument_photo_Mogonye01.jpg`,
    brochure: `${BRO}/MB_Mogonye_MG201511.pdf`,
    photos: [`${M}/09mogonye/monument_photo_Mogonye01.jpg`, `${M}/09mogonye/monument_photo_Mogonye02.jpg`],
    sections: [
      { p: ['Mmamotshwane Gorge is the main one of seven gorges around Mogonye village, about 31 km from Gaborone. The natural site, with areas of scenic beauty at the foot of the Mmamotshwane Hills, lies about 5.5 km south of the village along the boundary between Southern and South-East Districts. A permanent spring, fluctuating with the seasons and rainfall, keeps the gorge alive and provides water for domestic use and livestock.'] },
      { h: 'The gorge', img: `${M}/09mogonye/monument_photo_Cultural01.jpg`, p: [
        'The gorge is the only one known in south-eastern Botswana. It has waterfalls, pools, dense vegetation and a high concentration of nettle trees covering a wide area on its western side.',
        'It is believed to have been carved by water eroding the weakest line of the hills, created by tectonic movement that caused intensive faulting and jointing. Waterfalls and pools support a variety of plants and small animals.',
        'The vegetation is typical shrub savanna, with slightly denser and taller trees than the sandveld further west. The dominant plants are mosetlha (weeping wattle), mosu (umbrella thorn), mogonono (silver terminalia) and bofitlha (ferns).',
      ] },
      { h: 'People and beliefs', img: `${M}/09mogonye/monument_photo_Natural01.jpg`, p: [
        'The people of Mogonye settled here in the 18th century, after migrating from Lehurutshe and Motswedi villages in South Africa because of wars between the Boers and the Ndebele. Agricultural land became scarce when the Bahurutshe of Bapoane from Otse joined those already at Mogonye wa Kgophu, and some were forced to settle next to the gorge.',
        'The Metsimaswaane river divides two settlements, Mogonye Boseja and Mogonye wa Kgophu ya ga Marete – the spring with which the settlement identifies. Halfway up Mmamotshwane hill are the remains of a small stone-walled prehistoric village. The Dinkgwana archaeological site in the hills, with finds such as pottery and beads, is said to be lefelo la badimo – a sacred ancestral place that people are afraid to enter.',
        'The community treats the gorge as sacred because of a fern growing at a place called Ko Puleng. The fern is believed to be “the breath” of the gorge: removing it would end the life of the gorge, so it has never been plucked.',
      ] },
      { h: 'How to get there', img: `${M}/09mogonye/monument_photo_Howto01.jpg`, p: ['From the Gaborone–Kanye road, turn left at the Thusano Lefatsheng Research Centre onto the Mankgodi–Boatle road. Alternatively, from the Gaborone–Lobatse road, turn west at Boatle junction, 19 km from Gaborone, onto the Boatle–Mankgodi road.'] },
      { h: 'Some rules', img: `${M}/09mogonye/monument_photo_Rules01.jpg`, p: ['Mmamotshwane is a national monument managed by the Botswana National Museum in partnership with the Mogonye community and protected by the Monuments and Relics Act (2001). Following a few basic rules will ensure the continued protection of this unique heritage.'], ul: ['Use the designated parking area.', 'Report to the custodian’s office and complete the visitors’ book.', 'Do not remove, touch or interfere with any artefacts, plants or any other feature.', 'Cooperate with the custodians.', 'Take all your litter away with you.'], note: PERMISSION },
    ],
  },
  {
    id: 'old-palapye', section: 'monuments', name: 'Old Palapye', place: 'Foot of the Tswapong Hills, near Palapye',
    designation: 'Natural & Cultural', pos: [-22.625, 27.289],
    cover: `${M}/10oldpalapye/title_monuments_image.jpg`, card: `${M}/10oldpalapye/monument_photo_Oldpalapye01.jpg`,
    brochure: `${BRO}/MB_OldPalapye_PA201511.pdf`,
    photos: [`${M}/10oldpalapye/monument_photo_Oldpalapye01.jpg`],
    sections: [
      { p: ['Old Palapye is a multi-period site with relics from the Middle Stone Age, Later Stone Age and Early Iron Age up to the 19th-century remains of the Bangwato capital. It is part of the Tswapong cultural landscape and is protected under the Monuments and Relics Act (2001).'] },
      { h: 'The Bangwato capital, 1889–1902', img: `${M}/10oldpalapye/monument_photo_Cultural01.jpg`, p: [
        'Phalatswe, more commonly known as Old Palapye, was home to the Bangwato between 1889 and 1902 under Khama III. Khama, a man of considerable vision, is regarded as the key figure behind the expansion of Bangwato power from the late nineteenth century; he was also the first Bangwato chief to convert to Christianity. Coming from Shoshong, he made Phalatswe his capital for 13 years until the move to Serowe in 1902. The Bangwato found the Batswapong living at Dikgopheng at the foot of the hills. At its height up to 30,000 people lived at Phalatswe, including European missionaries, wagon traders, hunters and adventurers. The picturesque Photophoto valley and its waterfalls were among the first attractions, providing water for the inhabitants.',
        'The best-known feature is the burnt-brick ruin of the London Missionary Society (LMS) church, built between 1891 and 1894. The rest of the landscape is full of piles and lines of stones – relics of wattle-and-daub houses, granary bases and the compound (lelwapa) walls of the Bangwato.',
        'The site also has the remains of a prison, a market centre, a European cemetery and African burials, including that of Khama III’s wife Mma Bessie, and thousands of scattered potsherds, porcelain and bottle fragments. It lies at the foot of the Tswapong Hills, which local Batswapong people associate with stories of the Bapedi ancestral spirits believed to live there.',
        'Although the focal point of the settlement was Khama’s kgotla, the LMS church, by its size and position, must have dominated the landscape both physically and symbolically. Another feature is the concentrations of graves under low piles of stones. The Bangwato and other Tswana-speaking peoples previously buried their dead in kraals, under malwapa or occasionally under piles of stones associated with particular houses; at Phalatswe, a large stone was added at the end of the pile as a headstone.',
      ] },
      { h: 'Botany', img: `${M}/10oldpalapye/monument_photo_Natural01.jpg`, p: ['The site has some of the world’s most endangered medicinal plants, such as Ansellia africana (palamela), which is on the world red data list, and Adenia glauca (monnagaapare). The area is also rich in nutritious wild fruits such as baobab, wild berries, mogwagwa and mogomphatla.'] },
      { h: 'Geology', p: ['Several streams run along the elongated Tswapong formation, trending north-west from the hilltop. Displaced blocks on the northern side, together with the network of streams, show that the formation has been intensively faulted; water follows the fault lines, forming numerous gorges. Gorges such as Photophoto and Motetane were formed where water flowing along faults meets hard, resistant quartzite and falls as waterfalls. The geology strongly influenced the people of Old Palapye: the faulted area provided perennial streams for residents and their livestock, and shear zones supplied quartzite and sandstone slabs for building. The church foundation was built of local quartzite blocks with shale slabs believed to come from the Lotsane Shale Formation.'] },
      { h: 'Some rules', img: `${M}/10oldpalapye/monument_photo_Rules01.jpg`, p: [actNote('Old Palapye')], ul: ['Use the designated parking area.', 'Report to the field assistants’ office and complete the visitors’ book.', 'Please do not interfere with paintings, engravings, stone walls or any other feature.', 'Do not remove any artefacts.', 'Cooperate with the field assistants.', 'Take all your litter away with you.'], note: PERMISSION },
    ],
  },
  {
    id: 'old-shoshong', section: 'monuments', name: 'Old Shoshong', place: 'Shoshong, Central District',
    designation: 'Cultural', pos: [-23.035, 26.505],
    cover: `${M}/11oldshoshong/title_monuments_image.jpg`, card: `${M}/11oldshoshong/monument_photo_Prehistory01.jpg`,
    brochure: `${BRO}/MB_Shoshong_SH201511.pdf`,
    photos: [`${M}/11oldshoshong/monument_photo_Prehistory01.jpg`, `${M}/11oldshoshong/monument_photo_Prehistory02.jpg`],
    sections: [
      { h: 'Prehistory', p: ['The Shoshong Hills have been home to many groups of people. Later Stone Age hunter-gatherers lived here about 10,000 years ago. Bantu farmers arrived around 900 AD and occupied hilltops, valleys and some plains. They kept cattle, sheep and goats, grew millet, sorghum and cowpeas, and lived in permanent villages of clay, poles and thatch. They made iron farming tools such as hoes and knives. The remains of these villages are found at Pitsane Hill and Sung in the Shoshong Hills.'] },
      { h: 'Cultural history', img: `${M}/11oldshoshong/monument_photo_Cultural01.jpg`, p: [
        'The Bantu farmers were replaced by Bakgalagadi groups in the 16th century, who herded cattle, grew crops and hunted in various parts of the hills. By the 18th century Tswana groups were moving into the area. The Bakaa established their village at Phata ya Sebilo, driving out a group of Bakhurutshe and conquering the Baphaleng west of the hills. Around 1790 the Bangwato settled between Lephephe and the Shoshong Hills; in 1849 their leader Sekgoma I drove the Bakaa out of the hills and the Bangwato established their capital around the gorge at Shoshong. Sekgoma I developed it into an important trading town. Khama III succeeded him in 1875, and under his reign Shoshong flourished as a stopover for travellers, hunters and missionaries on their way to Lake Ngami, Bulozi and Matabeleland.',
        'Shoshong was abandoned in 1889 for environmental reasons. Over 30,000 people had depleted the area’s resources; a serious drought dried up the stream and wells; pastures were exhausted, and cattle died in large numbers, causing poor hygiene in the town. Khama III was forced to leave his beloved town and settle at the foot of the Tswapong Hills, where the Photophoto gorge provided abundant water.',
      ] },
      { h: 'Natural heritage', img: `${M}/11oldshoshong/monument_photo_Natural01.jpg`, p: [
        'The Shoshong Hills are the most outstanding physical feature in the area, dominated by brownish-grey weathered ironstones of the greywacke unit, containing hornblende, biotite and minor white grains of plagioclase and quartz. Densely packed fractures form spectacular brick-like formations. Small loose rocks moving downhill leave paths that are easily mistaken for cattle tracks.',
        'Old Shoshong is also characterised by acacia bush, with large stands of monkey thorn along the stream running through the site, home to birds, small animals and many insects.',
      ] },
      { h: 'Access to the site', img: `${M}/11oldshoshong/monument_photo_Access01.jpg`, p: ['The site is easily reached from the village centre with permission from the kgotla, where guided tours of the site are organised.'] },
      { h: 'Management of the site', img: `${M}/11oldshoshong/monument_photo_Management01.jpg`, p: ['The Botswana National Museum works in partnership with the community of Shoshong to develop and manage Old Shoshong. Custodians are on site to guide you and make your visit worthwhile.'] },
    ],
  },
  {
    id: 'lekhubu', section: 'monuments', name: 'Lekhubu Island', place: 'Sua Pan, Makgadikgadi',
    designation: 'Natural & Cultural', pos: [-20.893, 25.823],
    cover: `${M}/12lekhubu/image_MK.jpg`, card: `${M}/12lekhubu/monument_photo_MK_20lekubu01.jpg`,
    photos: [`${M}/12lekhubu/monument_photo_MK_20lekubu01.jpg`, `${M}/12lekhubu/monument_photo_MK_20lekubu02.jpg`],
    sections: [
      { p: [
        'Lekhubu lies in the remnants of the ancient Lake Makgadikgadi, once one of the largest inland lakes in Africa. About 20,000 years ago the climate became drier and the lake gradually filled with sand and sediment. Today Sua Pan, a sheet of salt-encrusted clay, is covered by only a few centimetres of water in the rainy season. The rocky outcrop of Lekhubu rises about 20 metres above the flats, surrounded by this sea of salt.',
        'The island has granite boulders and giant baobabs (mowana, Adansonia digitata), the African star-chestnut with its large round fruit and silver-red stems, the common corkwood (Commiphora pyracanthoides) and wild asparagus with red berries.',
        'For local residents Lekhubu is a sacred place of great significance for traditional ceremonies and customs. According to San folklore, in the beginning God lived below its walls. Residents still visit the site to ask God for rain and make offerings, and traditional taboos prohibit removing rocks or fruit and hunting animals on the island.',
      ] },
    ],
  },
  {
    id: 'baines', section: 'monuments', name: 'Baines’ Baobabs', place: 'Kudiakam Pan, Nxai Pan National Park',
    designation: 'Natural', pos: [-20.1124, 24.7691], exact: true,
    cover: `${M}/13baines/image_MK.jpg`, card: `${M}/13baines/monument_photo_MK_13baines.jpg`,
    photos: [`${M}/13baines/monument_photo_MK_13baines.jpg`],
    sections: [
      { p: ['Baines’ Baobabs are among the most famous baobabs in Botswana: a unique cluster of trees on the north-eastern edge of Kudiakam Pan. They were made famous by the British explorer and artist Thomas Baines, who painted them in the 1860s; the painting popularised the trees and drew many expeditions to them. Since Baines immortalised them, they have hardly changed. Today they are a popular destination for visitors to Nxai Pan National Park, at S 20°06′44.7″ E 24°46′08.7″.'] },
    ],
  },

  /* ---------------- other museums ---------------- */
  {
    id: 'bonnington', section: 'museums', group: 'Open-air museum', name: 'Bonnington Farm Open Air Museum', place: 'Gaborone',
    designation: 'Open-air museum', pos: [-24.614, 25.952],
    cover: `${IMG}/museums/02bonnington/title_monuments_image.jpg`, card: `${IMG}/museums/02bonnington/monument_photo_Bonnington02.jpg`,
    photos: [`${IMG}/museums/02bonnington/monument_photo_Bonnington02.jpg`],
    sections: [
      { p: [
        'Bonnington Farm was part of the Broadhurst Farms, which stretched from present-day Phakalane Estates in the north to Crocodile Pools on the way to Boatle in the south. The farms lay within a stretch of land that Kgosi Sechele I of the Bakwena gave to the British colonial officials as a strategic buffer between the Bakwena and the Boers, who were slowly encroaching on Batswana land. When first surveyed, the land belonged to the British South Africa Company.',
        'Bonnington passed through many owners, including Smith and Lamb, Daniel Le Cordeur, Ferver and the Saunders family. The Government of Botswana took over the farm in 1975 to cater for the growing population of Gaborone; later the Bianchi family rented the old farmhouse and premises as stables for their riding business. In its heyday the farm grew lucerne for the cattle, beans and cotton, and had a large orchard, mostly of oranges. Dairy and beef cattle were its main stock, alongside goats, sheep, pigs, poultry and an aviary.',
      ] },
      { h: 'The open-air museum concept', p: ['An open-air museum displays its objects outdoors rather than indoors, so that large objects – even buildings – can be part of the display. Besides museum professionals’ first-hand experience of open-air museums worldwide, a benchmarking trip to Ripinga Park and the Mwajahane Open Air Museum in Mozambique was made for the Bonnington concept, with financial assistance from UNESCO. A large part of the recreational area will be a fitness park, extending the city’s greenbelt and giving Gaborone’s residents the opportunity to keep fit and healthy.'] },
      { h: 'The silos', p: ['The eight silos, built by Le Cordeur in 1952, are the most prominent feature of the farm. They stored grain and lucerne for the dairy and beef cattle; grain was blown into them by machine through a long tube at the top. Feeding troughs and circular water points for the livestock are attached. The silos have been restored with roofs and yellow paint, and one set of four carries murals with an agricultural motif, supported by Plascon, the Department of Women’s Affairs, Thapong Visual Arts Centre, the Department of Youth and young Botswana artists.'] },
    ],
  },
  {
    id: 'samora-machel', section: 'museums', group: 'Liberation heritage', name: 'Samora Machel Memorial Museum', place: 'Peleng, Lobatse',
    designation: 'Liberation heritage', pos: [-25.216, 25.668],
    cover: `${IMG}/museums/03samora/monument_photo_samora01.jpg`, card: `${IMG}/museums/03samora/monument_photo_LH_03samora01.jpg`,
    photos: [`${IMG}/museums/03samora/monument_photo_LH_03samora01.jpg`, `${IMG}/museums/03samora/monument_photo_LH_03samora02.jpg`],
    sections: [{ p: ['This house in Peleng township, Lobatse, is an upcoming museum. The Mozambican liberation leader Samora Machel and his entourage stayed here on several occasions in the 1960s.'] }],
  },
  /* Regional museums (names and towns from the BRIEF). */
  {
    id: 'bathoen', section: 'museums', group: 'Regional museums', name: 'Kgosi Bathoen II Museum', place: 'Kanye',
    pos: [-24.979, 25.348],
    cover: `${IMG}/museums/04bathoen/image_SR.jpg`, card: `${IMG}/museums/04bathoen/monument_photo_SR_07BathoenMuseum.jpg`,
    photos: [`${IMG}/museums/04bathoen/monument_photo_SR_07BathoenMuseum.jpg`],
    sections: [{ p: ['The museum houses ethnographic collections and art exhibits of the Bangwaketse and surrounding villages. It was started in the 1990s to preserve the collections of Kgosi Bathoen II.'] }],
  },
  { id: 'sechele', section: 'museums', group: 'Regional museums', name: 'Kgosi Sechele I Museum', place: 'Molepolole', pos: [-24.405, 25.497] },
  { id: 'phuthadikobo', section: 'museums', group: 'Regional museums', name: 'Phuthadikobo Museum', place: 'Mochudi', pos: [-24.376, 26.152] },
  { id: 'khama-iii', section: 'museums', group: 'Regional museums', name: 'Khama III Memorial Museum', place: 'Serowe', pos: [-22.387, 26.711] },
  {
    id: 'supa-ngwao', section: 'museums', group: 'Regional museums', name: 'Supa Ngwao Museum', place: 'Francistown',
    pos: [-21.164, 27.513],
    cover: `${IMG}/museums/05supa/image_FT.jpg`, card: `${IMG}/museums/05supa/monument_photo_FT_03supa.jpg`,
    photos: [`${IMG}/museums/05supa/monument_photo_FT_03supa.jpg`],
    sections: [{ p: ['The museum is housed in a historic building in the Government Camp near Nyangabwe Hill and opened in 1992. It collects and shows temporary exhibitions on the history and ethnography of the Bakalanga.'] }],
  },
  { id: 'nhabe', section: 'museums', group: 'Regional museums', name: 'Nhabe Museum', place: 'Maun', pos: [-19.99, 23.425] },
  { id: 'kuru', section: 'museums', group: 'Regional museums', name: 'Kuru Museum', place: 'Ghanzi', pos: [-21.53, 21.93] },
  { id: 'kavimba', section: 'museums', group: 'Regional museums', name: 'Kavimba Community Museum', place: 'Kavimba, Chobe', pos: [-18.075, 24.56] },
  /* Institutional museums (BRIEF). */
  { id: 'bank-of-botswana', section: 'museums', group: 'Institutional/Specialized Museums', name: 'Bank of Botswana Museum', place: 'Gaborone', pos: [-24.653, 25.9125] },
  { id: 'adrian-gail', section: 'museums', group: 'Institutional/Specialized Museums', name: 'Adrian Gail Diamond Museum', place: 'Orapa', pos: [-21.308, 25.372] },

  /* ---------------- natural history ---------------- */
  {
    id: 'botanical-garden', section: 'botanical-garden', name: 'National Botanical Garden', place: 'Plot 17991, Okwa Road, The Village, Gaborone (opposite Gaborone Club)',
    designation: 'Natural History Division', pos: [-24.648, 25.93],
    cover: `${IMG}/natural-history/01botanical/title_monuments_image.jpg`, card: `${IMG}/natural-history/01botanical/monument_photo_Botanicalgarden01.jpg`,
    brochure: `${BRO}/MB_BotanicalGarden_BO201511.pdf`,
    photos: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `${IMG}/natural-history/01botanical/monument_photo_Botanicalgarden0${n}.jpg`),
    facts: [['Opening times', 'Monday to Friday, 08:00–16:00. Closed on weekends and public holidays.'], ['Entrance', 'Free – donations and sponsorship towards plant conservation projects are most welcome.'], ['Tours', 'Self-guided tours need no booking; guided tours are by appointment.'], ['Address', 'Plot 17991, Okwa Road, The Village, Gaborone – opposite Gaborone Club'], ['Telephone', '+267 361 0488 / 361 0467']],
    sections: [
      { p: [
        'Plants are a valuable resource in Botswana. They bear edible fruits; provide resting sites for birds and shade and shelter for insects, birds and other animals; are used for medicine; and supply material for goods such as paper and furniture. They even keep us alive by supplying the oxygen we breathe. Growing human demand threatens many plant species with extinction or with decline to levels that are no longer environmentally viable.',
        'At the National Botanical Garden in Gaborone we offer a refuge for threatened species by collecting and nurturing wild indigenous plants, particularly endemic or rare ones. Our work covers biodiversity conservation in botany, ecology, horticulture, ecosystems, species recovery programmes and environmental education.',
        'The garden also promotes international agreements on the sustainable use of plant resources, such as the Convention on International Trade in Endangered Species of Wild Fauna and Flora (CITES) and the Convention on Biological Diversity (CBD). Nationally, it works closely with local herbaria, the National Plant Genetic Resource Centre, the Department of Forestry and Range Resources, the Department of Environmental Affairs, NGOs such as the Kalahari Conservation Society and Veld Products Research and Development, and plant nurseries.',
      ] },
      { h: 'The garden', p: [
        'The National Botanical Garden is a unit of the Natural History Division of the Department of National Museum and Monuments. It covers 9 hectares, divided into cultivated and wild sections. A preliminary checklist records about 116 species in 54 families.',
        'Besides growing and displaying indigenous plants, the garden oversees Important Plant Areas throughout the country, including Lithops sites, the Gutsaa baobab at Gweta, Sokwe Botanical Reserve at Serowe and the makosho trees at Lecheng.',
        'Trails lead through Botswana’s indigenous plants. The grounds also contain a visitor centre with exhibitions on our collections, and the National Herbarium, where our collections of preserved plants are kept. There is a kiosk, and the restrooms are wheelchair accessible. For more information, contact the security and reception officers.',
        'Please note that there are rock outcrops, open water, thorny trees and poisonous plants. Visitors are advised to take care, especially with children.',
      ] },
      { h: 'Please note', p: ['The National Botanical Garden is a living plant collection for visitors to enjoy.'], ul: ['No games or pets are allowed.', 'No vehicles, bicycles or horses beyond the designated points.', 'Lighting fires, picnicking (except with permission at designated points), littering, graffiti and discarding cigarette ends are prohibited. Please use the bins provided.', 'Please keep noise to a minimum. Radios and musical instruments are allowed only with permission.', 'Damaging plants and harvesting plant parts (including picking flowers and collecting seeds) are prohibited.', 'All weapons are strictly prohibited.', 'Any behaviour that disturbs other visitors is prohibited.'] },
      { h: 'Support', p: ['The National Botanical Garden is financed and run by the Government of Botswana.'] },
    ],
  },
  {
    id: 'herbarium', section: 'herbarium', name: 'National Herbarium', place: 'Plot 17991, Okwa Road, The Village, Gaborone (opposite Gaborone Club)',
    designation: 'Natural History Division', pos: [-24.6483, 25.9303],
    cover: `${IMG}/natural-history/02herbarium/title_monuments_image.jpg`, card: `${IMG}/natural-history/02herbarium/monument_photo_Herbarium01.jpg`,
    brochure: `${BRO}/MB_Herbarium_HE201511.pdf`,
    photos: [1, 2, 3, 4, 5, 6].map((n) => `${IMG}/natural-history/02herbarium/monument_photo_Herbarium0${n}.jpg`),
    facts: [['Opening hours', 'Monday to Friday, 08:30–16:00. Closed on public holidays.'], ['Address', 'Plot 17991, Okwa Road, The Village, Gaborone – opposite Gaborone Club (in the National Botanical Garden)'], ['Telephone', '+267 361 0488 / 361 0467']],
    sections: [
      { h: 'What is a herbarium?', p: ['A herbarium is a collection of plant specimens carefully prepared and preserved for scientific research, for posterity and as a national reference. The herbarium is also a teaching facility for the public. Our collections are mainly plants from Botswana, with a few from neighbouring countries.'] },
      { h: 'Brief history', p: [
        'The National Herbarium was established in 1975 as a division of the National Museum, Monuments and Art Gallery by the then director, Mr A. C. Campbell, assisted by Mr P. A. Smith, who had long worked for the Department of Water Affairs. Its first collection of three thousand specimens came from the Ministry of Agriculture, including specimens collected by O. B. Miller, L. Hansen and volunteers such as Mrs Janet Barnes.',
        'The collection now holds about 10,000 specimens. Dr L. M. Turton, Dr Wayne Handlos, Mrs A. Kreulen and Mrs Edna Norman were among those who helped to start the herbarium.',
        'At its founding, Mrs Ellen Kalake was appointed herbarium assistant and learnt the basics of botany, plant identification and specimen mounting from Mrs Barnes and Dr Turton. She later gained experience in herbarium management at the Royal Botanic Gardens, Kew, in London.',
      ] },
      { h: 'Objectives', ul: ['To collect and preserve plant specimens of Botswana', 'To gather information about plants and their uses', 'To serve as a reference collection for plant taxonomy', 'To locate rare and endangered plant species in order to develop strategies for conserving them', 'To promote awareness of plant conservation, with the aim of preserving endangered and rare species', 'To maintain a classification of the Botswana flora, keeping a catalogue of indigenous plant information for future use'] },
      { h: 'Activities and services', ul: ['Educating the public – particularly students of environmental studies – about the importance of plants and their preservation', 'Helping the local community to identify plants', 'Promoting research on the local flora', 'Ethnobotanical research', 'Lending plant specimens to other institutions and researchers'] },
      { h: 'Projects', ul: ['Organising collecting expeditions', 'Computerising specimens in PRECIS, a regional database'] },
      { h: 'Who uses the herbarium', p: ['The public, researchers, students from universities, colleges and schools, the Department of Wildlife and National Parks, environmental consultants and the police forensic department.'] },
      { h: 'Links with other herbaria', p: ['The National Herbarium (GAB) has links with the University of Botswana Herbarium (UCBG), Sebele Herbarium (MAH) and the Harry Oppenheimer Okavango Research Centre Herbarium in Maun (PSUB), as well as regional and international herbaria. Within the country it works with other government departments and organisations such as the National Tree Seed Centre, the National Conservation Strategy Coordinating Agency, Thusano Lefatsheng, the Kalahari Conservation Society, Veld Products Research and the Forestry Association of Botswana.'] },
    ],
  },

  /* ---------------- world heritage ---------------- */
  {
    id: 'okavango', section: 'world-heritage', name: 'Okavango Delta', place: 'Ngamiland, northern Botswana',
    designation: 'Natural · World Heritage Site', pos: [-19.3, 22.9],
    cover: `${IMG}/home-slides/imagetop01.jpg`, card: `${IMG}/world-heritage/01okavango/wh_01okavango_02.jpg`,
    photos: [`${IMG}/world-heritage/01okavango/wh_01okavango_02.jpg`, `${IMG}/world-heritage/01okavango/wh_01okavango_04.jpg`, `${IMG}/web/publications/float04_0525_2.jpg`],
    sections: [
      { p: [
        'Known as the “Jewel of the Kalahari”, the Okavango Delta is one of the world’s largest inland deltas, a pristine wilderness that is home to a vast diversity of wildlife and ecosystems. Spreading over 16,000 km² of northern Botswana, this water wonderland is surrounded by Kalahari savanna, offering great contrasts in landscape and culture and bearing witness to the hardiness of its inhabitants. The delta provides an ever-changing array of scenery and experiences for visitors seeking the true heart of Africa, its emerald waters threading through the landscape and sustaining its people and wild animals.',
        'After a meandering journey of over 1,600 km from its source in the highlands of southern Angola, the Cubango River passes between Angola and Namibia and flows into the highly sensitive Panhandle wetland just across the border in Botswana. Here it becomes the Okavango, whose waters fan out to form a myriad of unique habitats. Along its journey the river has provided for people who for millennia have depended on its bounty to survive.',
      ] },
    ],
  },
];

/* ------------------------------------------------------- heritage trails
   The museum's "National Trails" maps. The trail texts are from the
   previous website. `map` is the online map the old site linked to. */
const TR = `${PUB}/heritage-trails`;
export const TRAILS = [
  {
    id: 'makgadikgadi', name: 'Makgadikgadi Pans Heritage Trail', region: 'Makgadikgadi Pans, central Botswana',
    pdf: `${TR}/Map_MakgadikgadiPan_201408.pdf`, thumb: `${IMG}/publications/Map_MK.jpg`, photo: `${IMG}/trails/map_photo_01.jpg`,
    map: 'https://drive.google.com/open?id=1wp94EaMb_GpYWzQTHhKLjC8RkBI&usp=sharing',
    pos: [-20.7, 25.4], sites: ['lekhubu', 'baines'],
    p: ['The Makgadikgadi Pans Heritage Trail links pristine cultural and natural heritage sites on the remains of one of the largest palaeo-lakes in the world. Its attractions include Ntwetwe, Sua, Nxai and Kudiakam pans, the Nxaighaishini fossils, the Boteti River, Lake Xau, Nxai Pan National Park and Makgadikgadi Pans National Park. These sites tell of the formation of the Makgadikgadi Pans and of the cultures that have developed here since time immemorial. A complete tour of the trail offers unparalleled encounters with animals and plants and the scenic mining “hills” of Orapa, Damtshaa and Letlhakane. The trail is also home to the legendary Baines’, Chapman’s and Greens’ baobabs, which still stand guard over a historic road used by early travellers heading into the interior of southern Africa.'],
  },
  {
    id: 'francistown', name: 'Greater Francistown Heritage Trail', region: 'Francistown and the Bukalanga region',
    pdf: `${TR}/Map_FtownTrail.pdf`, thumb: `${IMG}/publications/Map_FT.jpg`, photo: `${IMG}/trails/map_photo_02.jpg`,
    map: 'https://drive.google.com/open?id=1MTneKSWJDA5dvvL2Es-RABfTBOQ&usp=sharing',
    pos: [-21.17, 27.51], sites: ['domboshaba', 'supa-ngwao'],
    p: [
      'This heritage trail promotes cultural heritage tourism in the Greater Francistown region. It covers over 30 sites showcasing the natural and cultural heritage of the Bukalanga area: archaeological and historical sites, rock paintings, shrines, stone-walled ruins and contemporary cultural centres.',
      'The Bakalanga are made up of three distinct groups. The “original” Bakalanga, known as Balilima, include the Bawumbe from Madandume in Tutume, Nshakazhogwe, Mosojane, Mulambakwena, Zwenshambe, Dabgwi, Tsamaya and Senete; the Balilima venerate Tjibelu. The second group, the Banyayi, venerate Moyo and include the Batalaunda, Bamengwe, BaChangate and Banandzwa. The last group are Sotho-Tswana people who moved into the Bukalanga region during the 18th century and adopted Ikalanga as their language. These include the Bapedi of Tjilagwane, Nswazwi, Masunga and Ngwadi, the Bakhurutshe of Matobo, the Bakaa and Barolong of Sebina and the Barolong of Moroka.',
      'The trail starts in Francistown. Most sites can be reached with a 4x2 vehicle, and some have access roads, signage, campsites and custodians. Apart from the sites in Francistown itself, it is essential to visit the kgotla to ask for permission. “Dumilani bazwadzwi”, with a smile, is the accepted greeting among the Bakalanga.',
    ],
  },
  {
    id: 'southern', name: 'Southern Region Heritage Trail', region: 'Southern and south-eastern Botswana',
    pdf: `${TR}/Map_SouthernTrail.pdf`, thumb: `${IMG}/publications/Map_SR.jpg`, photo: `${IMG}/trails/map_photo_03.jpg`,
    map: 'https://drive.google.com/open?id=1_0yesnL3BJfexyuv3idLOOLMAG0&usp=sharing',
    pos: [-24.75, 25.75], sites: ['manyana', 'mogonye', 'matsieng', 'bathoen'],
    p: [
      'Through the Southern Region Heritage Trail, the Botswana National Museum offers a fresh look at diversifying the tourism sector: cultural and natural heritage sites are linked with traditional tourist destinations in the south of Botswana to offer visitors a complete package.',
      'Promoting these sites for tourism answers the growing need to diversify the country’s tourism industry. Developing traditional practices at natural and cultural heritage sites can improve the conservation and management of these resources, and contributes to poverty eradication in the rural communities where most of the sites are found.',
      'The trail offers a wealth of fascinating places to visit, taking you through Botswana’s oldest geological formations, folklore, legends of mystical beings and sacred sites whose spirituality is unique to this region.',
    ],
  },
  {
    id: 'liberation', name: 'Liberation Heritage Trail', region: 'Lobatse, Francistown and Dukwi',
    pdf: `${TR}/Map_LiberationHeritage_20151119.pdf`, thumb: `${IMG}/publications/Map_LH.jpg`, photo: `${IMG}/trails/map_photo_04.jpg`,
    map: 'https://drive.google.com/open?id=1cRY7PqhelVZ-PwVyhiSh-jzjj_U&usp=sharing',
    pos: [-25.216, 25.668], extra: [['Francistown', [-21.17, 27.51]], ['Dukwi refugee camp', [-20.618, 26.433]]], sites: ['samora-machel'],
    p: [
      'Botswana played a vital role in the liberation of many African countries. Because of its location, it became a haven for refugees from South Africa, Namibia, Mozambique, Angola, Zimbabwe and Somalia, among others. Lobatse and Francistown were the main towns where refugees met and networked to discuss how to solve the problems of their countries during the liberation struggles. Botswana has been, and continues to be, supportive of those who qualify for refugee status; some refugees are currently housed at Dukwi refugee camp.',
      'The key places that mark liberation heritage in Botswana include houses, camps and monuments erected in honour of those who lost their lives during the liberation struggles.',
    ],
  },
];

/* BRIEF: the two museum overviews, word for word. */
export const MUSEUMS_TEXT = {
  regional: [
    'Regional museums are important custodians of national heritage. They have in their custodianship important historical relics and documents which are important to Botswana’s cultural heritage. Regional museums are housed in historical buildings which are important time markers in the history of Botswana and the relations of this country with the former protectorate government and other international events. They are also important vehicles for promoting and protecting Botswana’s heritage at local community level since they are in regions with important heritage sites.',
    'Regional museums in Botswana are autonomous trusts run by different boards with their constitutions in accordance with their Public Deeds of Trust. Currently, there are a total of seven regional museums which are operational, namely:',
  ],
  regionalList: [
    ['bathoen', 'Kgosi Bathoen II Museum: Kanye'],
    ['sechele', 'Kgosi Sechele I Museum: Molepolole'],
    ['phuthadikobo', 'Phuthadikobo Museum: Mochudi'],
    ['khama-iii', 'Khama III Memorial Museum: Serowe'],
    ['supa-ngwao', 'Supa Ngwao Museum: Francistown'],
    ['nhabe', 'Nhabe Museum: Maun'],
    ['kuru', 'Kuru Museum: Ghanzi'],
    ['kavimba', 'Kavimba Community Museum'],
  ],
  institutionalList: [
    ['bank-of-botswana', 'Bank of Botswana Museum-Gaborone'],
    ['adrian-gail', 'Adrian Gail Diamond Museum-Orapa'],
  ],
  regionalAfter: 'These museums contribute to heritage education, community engagement and cultural tourism, helping to ensure that Botswana’s diverse heritage remains accessible to present and future generations.',
  institutional: 'In recent times there has been an evolution of new institution based museums. These were developed under the guidance of the DNMM. The new museum document and present the respective institutional mandates. These are:',
};

export const sectionByKey = (k) => SECTIONS.find((s) => s.key === k) || null;
export const siteById = (id) => SITES.find((s) => s.id === id) || null;
export const sitesIn = (k) => SITES.filter((s) => s.section === k || (s.also || []).includes(k));
export const trailById = (id) => TRAILS.find((t) => t.id === id) || null;
/* A site has its own page only when there is something to say about it. */
export const hasPage = (s) => !!(s.sections && s.sections.length);
export const siteHref = (s) => (s.section === s.id ? `#/explore/${s.id}` : `#/explore/${s.section}/${s.id}`);
