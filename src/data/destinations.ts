import type { Destination } from '@/types/travel'

/**
 * The destination catalog. All money figures are in USD, the base currency;
 * the UI converts them on the way out.
 *
 * Guide prose is authored in English. UI chrome is translated (see src/i18n),
 * but the long-form guide copy is not.
 */
export const destinations: Destination[] = [
  {
    slug: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    emoji: '⛩️',
    tagline: 'Temple mornings and lantern-lit alleys',
    summary:
      'Japan’s old capital keeps a thousand years of craft alive in its tea houses, moss gardens and cedar shrines. Mornings belong to the temples, evenings to the riverside lanes of Pontocho.',
    dailyBudget: 145,
    budgetBreakdown: { stay: 70, food: 40, transport: 15, activities: 20 },
    bestMonths: ['Mar', 'Apr', 'Oct', 'Nov'],
    tags: ['culture', 'food', 'walkable'],
    highlights: ['Fushimi Inari at sunrise', 'Arashiyama bamboo grove', 'Kaiseki dinner in Gion'],
    gradient: ['#f3a5b1', '#8f5fbf'],
    overview: [
      'Kyoto was the imperial capital for over a thousand years, and it escaped the worst of the wartime bombing that flattened other Japanese cities. What survives is an unusually dense concentration of wooden temples, imperial villas and merchant townhouses, wrapped around a modern city of 1.5 million people.',
      'The city sits in a basin ringed by mountains on three sides, which traps the heat in August and the cold in January. The grid of the old capital makes the centre easy to read: streets run north–south and east–west, numbered avenues climb from the station towards the Imperial Palace.',
      'The mistake most first-timers make is treating it as a checklist of temples. Kyoto rewards the opposite — pick two sights a day, go early, and leave the afternoons for wandering Nishiki market, the philosopher’s path or a long lunch in a machiya townhouse.',
    ],
    neighbourhoods: [
      {
        name: 'Gion & Higashiyama',
        bestFor: 'First visits, evening atmosphere',
        description:
          'The postcard Kyoto of wooden facades and stone lanes. Expensive and busy by day, quietly magical after the coach tours leave around six.',
      },
      {
        name: 'Downtown (Kawaramachi)',
        bestFor: 'Food, nightlife, transport links',
        description:
          'The practical base. Walk to Nishiki market, Pontocho’s riverside bars and two subway lines. Less charming, far more convenient.',
      },
      {
        name: 'Arashiyama',
        bestFor: 'Quiet mornings, ryokan stays',
        description:
          'Twenty minutes west by train, at the foot of the bamboo groves. Wonderful before nine and after five, mobbed in between.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'Southern shrines',
        morning: 'Fushimi Inari before 7am — the vermilion gates are empty and cool at that hour.',
        afternoon: 'Tofuku-ji’s rock gardens, then Nishiki market for lunch on the hoof.',
        evening: 'Cross to Pontocho for yakitori on a riverside balcony.',
      },
      {
        day: 2,
        title: 'Eastern hills',
        morning: 'Kiyomizu-dera at opening, walking down through Sannenzaka’s stone streets.',
        afternoon: 'The Philosopher’s Path north to Ginkaku-ji, stopping at Nanzen-ji’s aqueduct.',
        evening: 'Kaiseki dinner in Gion — book weeks ahead, or try a cheaper obanzai counter.',
      },
      {
        day: 3,
        title: 'West and north',
        morning: 'Arashiyama bamboo grove at dawn, then the Okochi Sanso villa garden.',
        afternoon: 'The Sagano railway, or Kinkaku-ji’s golden pavilion if the weather is clear.',
        evening: 'Sento bathhouse, then a quiet izakaya near the station.',
      },
    ],
    foodPicks: [
      'Kaiseki — the multi-course seasonal tasting menu Kyoto invented',
      'Yudofu, simmered tofu, at a temple restaurant in Nanzen-ji',
      'Nishin soba: buckwheat noodles with sweet-simmered herring',
      'Matcha and warabimochi in an Uji tea house',
    ],
    dayTrips: [
      'Nara — the great bronze Buddha and a park full of bowing deer, 45 minutes away',
      'Osaka — a louder, hungrier city an hour by train, best after dark',
      'Uji — the home of Japanese green tea and the Byodo-in phoenix hall',
    ],
    practical: {
      language: 'Japanese; English signage on transport, less so in small restaurants',
      currency: 'Japanese yen (¥). Cash still matters at temples and small shops',
      timeZone: 'JST (UTC+9), no daylight saving',
      plug: 'Type A/B, 100V',
      visa: 'Visa-free short stays for most Western passports',
      gettingAround:
        'Buses reach the temples, subways are faster but limited. An IC card covers both. Cycling is the local’s choice — the basin is flat.',
      safety:
        'Exceptionally safe. The real risks are heatstroke in August and overtourism etiquette in Gion, where photographing geiko is prohibited on private lanes.',
    },
    seasons: [
      {
        months: ['Mar', 'Apr'],
        label: 'Cherry blossom',
        note: 'The busiest and most beautiful weeks. Book accommodation three months ahead.',
      },
      {
        months: ['Jun', 'Jul', 'Aug'],
        label: 'Rainy then very hot',
        note: 'Humid and draining, though temples are blissfully empty in the afternoon downpours.',
      },
      {
        months: ['Oct', 'Nov'],
        label: 'Autumn colour',
        note: 'Maples turn late November. Clear, mild days — arguably better than spring.',
      },
      {
        months: ['Dec', 'Jan', 'Feb'],
        label: 'Cold and quiet',
        note: 'Grey but uncrowded, and snow on the golden pavilion is a genuine event.',
      },
    ],
    monthlyNote: {
      Mar: 'Early blossom and plum gardens, before the April crowds arrive.',
      Apr: 'Peak cherry blossom — the single most spectacular week of the Kyoto year.',
      Oct: 'Warm days, cool nights and the start of the maple turn.',
      Nov: 'Autumn colour at its absolute peak, with temple gardens lit after dark.',
    },
  },
  {
    slug: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    region: 'Europe',
    emoji: '🚋',
    tagline: 'Seven hills, tiled facades, endless custard tarts',
    summary:
      'A city built on viewpoints. Ride the 28 tram up through Alfama, eat your weight in pastéis de nata, and end the night with fado drifting out of a basement bar.',
    dailyBudget: 95,
    budgetBreakdown: { stay: 45, food: 28, transport: 8, activities: 14 },
    bestMonths: ['Apr', 'May', 'Sep', 'Oct'],
    tags: ['food', 'coast', 'budget'],
    highlights: ['Tram 28 through Alfama', 'Belém at golden hour', 'Day trip to Sintra'],
    gradient: ['#ffd76f', '#ff8a5c'],
    overview: [
      'Lisbon is a port city that faces the Atlantic through the mouth of the Tagus, and it has the light to prove it — low, golden and bouncing off a million azulejo tiles. The 1755 earthquake levelled the centre, so the downtown Baixa is a rational grid while the surrounding hills kept their medieval tangle.',
      'It is among the cheapest capitals in Western Europe, though a decade of tourism has pushed the centre upmarket. The trade-off is a food scene that still runs on €10 lunches in tiled tascas alongside tasting menus that would cost triple in Paris.',
      'Plan for the hills. Lisbon is a genuinely steep city, and the funiculars and the great iron Santa Justa lift exist because walking it is hard work. Comfortable shoes matter more here than in almost any European capital.',
    ],
    neighbourhoods: [
      {
        name: 'Alfama',
        bestFor: 'Atmosphere, fado, getting lost',
        description:
          'The oldest quarter, a knot of stairways below the castle that survived the earthquake. Beautiful, noisy and hard to reach with a suitcase.',
      },
      {
        name: 'Baixa & Chiado',
        bestFor: 'First visits, walkability',
        description:
          'Flat, grand and central, with the best transport links and the bookshops and cafés of Chiado just up the hill.',
      },
      {
        name: 'Príncipe Real',
        bestFor: 'Food, design shops, calm',
        description:
          'Residential and leafy above the centre. The best restaurants per square metre and a Saturday organic market.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'The old city',
        morning: 'Tram 28 up to São Jorge castle, walking back down through Alfama.',
        afternoon: 'The Sé cathedral and the Miradouro das Portas do Sol for the rooftop view.',
        evening: 'A fado house in Alfama — the small, no-menu ones are the real thing.',
      },
      {
        day: 2,
        title: 'Belém and the river',
        morning: 'The Jerónimos monastery at opening, then the Tower of Belém.',
        afternoon: 'Pastéis de Belém straight from the oven, then the MAAT museum along the water.',
        evening: 'Sunset at Cais do Sodré, dinner at the Time Out market or a Bica tasca.',
      },
      {
        day: 3,
        title: 'Hills and viewpoints',
        morning: 'Príncipe Real’s market and the botanical garden.',
        afternoon: 'The Gulbenkian museum — an outstanding and often-missed collection.',
        evening: 'Bairro Alto, where the bars spill into the street after ten.',
      },
    ],
    foodPicks: [
      'Pastel de nata, still warm, dusted with cinnamon',
      'Bacalhau à Brás — salt cod, egg and matchstick potatoes',
      'Grilled sardines, essential in June, mediocre out of season',
      'A bifana pork sandwich and a beer, standing at the counter',
    ],
    dayTrips: [
      'Sintra — Romantic palaces in a misty hilltop forest, 40 minutes by train',
      'Cascais — a seaside town at the end of the coastal line, good for swimming',
      'Setúbal — the best seafood near Lisbon, plus dolphins in the Sado estuary',
    ],
    practical: {
      language: 'Portuguese; English very widely spoken in the centre',
      currency: 'Euro (€). Cards accepted almost everywhere',
      timeZone: 'WET (UTC+0), one hour behind most of Western Europe',
      plug: 'Type F, 230V',
      visa: 'Schengen area rules apply',
      gettingAround:
        'Metro, trams and funiculars on one Viva Viagem card. The 28 tram is a sight rather than transport — it is slow and pickpocketed.',
      safety:
        'Very safe for violent crime. Pickpocketing on tram 28 and in Baixa is the one genuine nuisance.',
    },
    seasons: [
      {
        months: ['Apr', 'May'],
        label: 'Spring',
        note: 'Jacaranda in bloom, warm days, prices still reasonable. Arguably the best window.',
      },
      {
        months: ['Jun', 'Jul', 'Aug'],
        label: 'High summer',
        note: 'Hot and packed, though the June Santo António street parties are wonderful.',
      },
      {
        months: ['Sep', 'Oct'],
        label: 'Golden autumn',
        note: 'Warm ocean, thinner crowds, the best light of the year.',
      },
      {
        months: ['Nov', 'Dec', 'Jan', 'Feb'],
        label: 'Mild and wet',
        note: 'Rarely cold, often grey. Cheap flights and empty restaurants compensate.',
      },
    ],
    monthlyNote: {
      Apr: 'Spring warmth without the crowds, and the jacarandas beginning to turn purple.',
      May: 'Long, clear days and comfortable heat — the sweet spot before high season.',
      Sep: 'The sea is at its warmest and the summer crowds have gone home.',
      Oct: 'Mild, golden and cheap, with the year’s best light on the tiles.',
    },
  },
  {
    slug: 'reykjavik',
    name: 'Reykjavík',
    country: 'Iceland',
    region: 'Europe',
    emoji: '🌋',
    tagline: 'Basecamp for volcanoes and northern lights',
    summary:
      'A pocket-sized capital with outsized ambition: geothermal pools on every corner, and a ring road that drops you into glaciers, black sand and steam within the hour.',
    dailyBudget: 210,
    budgetBreakdown: { stay: 95, food: 55, transport: 35, activities: 25 },
    bestMonths: ['Feb', 'Mar', 'Sep', 'Oct'],
    tags: ['nature', 'adventure', 'nordic'],
    highlights: ['Golden Circle loop', 'Aurora hunt from Grótta', 'Soak at Sky Lagoon'],
    gradient: ['#7ad7f0', '#3b5bdb'],
    overview: [
      'Reykjavík holds around a third of Iceland’s population in a low-rise sprawl of corrugated-iron houses, and you can cross the old centre on foot in twenty minutes. It is best understood as a warm, well-fed basecamp rather than a destination in itself.',
      'Everything is expensive — Iceland imports most of its food and taxes alcohol heavily. The offsetting truth is that the best things are cheap or free: the geothermal neighbourhood pools cost a few dollars, and the landscape costs nothing at all.',
      'The light dominates the experience. In June the sun barely sets; in December you get four usable hours. Pick your month according to whether you want midnight hiking or the aurora, because you cannot have both.',
    ],
    neighbourhoods: [
      {
        name: '101 Reykjavík',
        bestFor: 'First visits, restaurants, nightlife',
        description:
          'The old centre around Laugavegur. Everything walkable, everything pricey, and the Saturday night runtur is an institution.',
      },
      {
        name: 'Laugardalur',
        bestFor: 'Families, the big thermal pool',
        description:
          'Green and residential, twenty minutes east, built around Iceland’s largest swimming complex and a botanical garden.',
      },
      {
        name: 'Grandi',
        bestFor: 'Harbour food, whale watching',
        description:
          'A converted fishing harbour now full of ice cream, seafood shacks and the departure point for whale tours.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'City and steam',
        morning: 'Hallgrímskirkja tower for the view over the coloured roofs.',
        afternoon: 'The Settlement Exhibition, then a soak at Sundhöllin, the old town pool.',
        evening: 'Dinner on Laugavegur, then an aurora check from the Grótta lighthouse.',
      },
      {
        day: 2,
        title: 'The Golden Circle',
        morning: 'Þingvellir, where the Atlantic plates pull apart under a rift valley.',
        afternoon:
          'The Geysir field and Gullfoss, which is far bigger than the photographs suggest.',
        evening: 'Back via the Secret Lagoon at Flúðir, quieter than the Blue Lagoon.',
      },
      {
        day: 3,
        title: 'South coast',
        morning: 'Seljalandsfoss and Skógafoss, two waterfalls you can walk behind and under.',
        afternoon: 'Reynisfjara’s black sand and basalt columns — stay well back from the surf.',
        evening: 'Sky Lagoon back in town, timed for sunset over the Atlantic.',
      },
    ],
    foodPicks: [
      'A lamb hot dog with crispy onions from Bæjarins Beztu',
      'Plokkfiskur — the mashed fish and potato comfort dish',
      'Rye bread baked in geothermal ground, with salted butter',
      'Skyr, thicker and sharper than the export version',
    ],
    dayTrips: [
      'The Golden Circle — rift valley, geyser and waterfall in one 300km loop',
      'Snæfellsnes peninsula — Iceland in miniature, with the glacier at the tip',
      'The Reykjanes lava fields and the Blue Lagoon, right by the airport',
    ],
    practical: {
      language: 'Icelandic; English near-universal',
      currency: 'Icelandic króna (kr). Effectively a cashless country',
      timeZone: 'GMT (UTC+0) year round, no daylight saving',
      plug: 'Type F, 230V',
      visa: 'Schengen area rules apply',
      gettingAround:
        'The city is walkable and buses are adequate, but seeing the country needs a rental car. In winter that means a 4x4 and checking road.is every morning.',
      safety:
        'Crime is close to nonexistent. The danger is entirely environmental: sneaker waves at Reynisfjara, sudden storms, and unmarked hot ground near geothermal fields.',
    },
    seasons: [
      {
        months: ['Jun', 'Jul', 'Aug'],
        label: 'Midnight sun',
        note: 'Endless daylight, all roads open, puffins ashore — and no aurora at all.',
      },
      {
        months: ['Sep', 'Oct'],
        label: 'Aurora returns',
        note: 'Dark enough for northern lights, mild enough for the highland roads. The best compromise.',
      },
      {
        months: ['Nov', 'Dec', 'Jan'],
        label: 'Deep winter',
        note: 'Four hours of light, frequent road closures, but ice caves and the strongest aurora odds.',
      },
      {
        months: ['Feb', 'Mar'],
        label: 'Late winter',
        note: 'Lengthening days with the aurora still active — many regulars’ favourite window.',
      },
    ],
    monthlyNote: {
      Feb: 'Aurora season with usable daylight returning and ice caves still open.',
      Mar: 'The best balance of the year: dark nights, long days and shoulder-season prices.',
      Sep: 'Northern lights come back while the highland roads are still passable.',
      Oct: 'Autumn colour on the lava fields and the first serious aurora nights.',
    },
  },
  {
    slug: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    region: 'Africa',
    emoji: '🕌',
    tagline: 'Souks, riad courtyards and mint tea at dusk',
    summary:
      'The medina is a maze worth getting lost in. Trade the noise of Jemaa el-Fnaa for a quiet riad rooftop, then head for the Atlas foothills when the heat peaks.',
    dailyBudget: 80,
    budgetBreakdown: { stay: 38, food: 20, transport: 8, activities: 14 },
    bestMonths: ['Mar', 'Apr', 'Oct', 'Nov'],
    tags: ['culture', 'markets', 'budget'],
    highlights: ['Jardin Majorelle', 'Atlas Mountains day trip', 'Rooftop dinner over the medina'],
    gradient: ['#ff9d6c', '#c2410c'],
    overview: [
      'Marrakech is a thousand-year-old caravan city on the edge of the Sahara, and the red walls of its medina still enclose a working neighbourhood rather than a museum. Donkeys, mopeds and tourists share lanes barely wide enough for two people.',
      'The city splits cleanly in two. Inside the walls is the medina, where the souks, the riads and the Jemaa el-Fnaa square are. Outside is Gueliz, the French-built new town, with wide boulevards, wine lists and none of the intensity.',
      'It is an intense place for first-time visitors, and the hassle is real — persistent guides, wrong directions given confidently, and a firm expectation of haggling. Approached with humour and a fixed idea of what you want to pay, it is one of the great sensory cities.',
    ],
    neighbourhoods: [
      {
        name: 'The Medina',
        bestFor: 'Riads, souks, atmosphere',
        description:
          'Inside the walls. Staying in a riad here — a courtyard house turned inwards away from the street — is the whole point of coming.',
      },
      {
        name: 'Gueliz',
        bestFor: 'Restaurants, calm, modern hotels',
        description:
          'The new town: wide streets, galleries, good coffee and bars that serve alcohol. A relief after a day in the souks.',
      },
      {
        name: 'Palmeraie',
        bestFor: 'Resorts, pools, quiet',
        description:
          'A palm grove north of the city, full of low-rise resorts. Lovely and isolated — you will be taxiing in for everything.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'Inside the walls',
        morning: 'The Ben Youssef Madrasa and the Almoravid Koubba, before the heat.',
        afternoon: 'Lose an afternoon in the souks — dyers, metalworkers, then mint tea.',
        evening: 'Jemaa el-Fnaa as the food stalls light up, seen from a café balcony.',
      },
      {
        day: 2,
        title: 'Gardens and palaces',
        morning: 'Jardin Majorelle and the Yves Saint Laurent museum — book a timed slot.',
        afternoon: 'The Bahia Palace and the Saadian tombs.',
        evening: 'Dinner in Gueliz, where the pace drops by half.',
      },
      {
        day: 3,
        title: 'The Atlas',
        morning: 'Drive to the Ourika valley or Imlil, 90 minutes into the mountains.',
        afternoon: 'A walk between Berber villages, lunch on a terrace over the river.',
        evening: 'Back for a hammam and a scrub, which you will have earned.',
      },
    ],
    foodPicks: [
      'Tagine — lamb with prune, or chicken with preserved lemon and olive',
      'Harira, the tomato and lentil soup that breaks the fast',
      'Mechoui: slow-roast lamb shoulder pulled apart with bread',
      'Fresh orange juice from the square, for about a dollar',
    ],
    dayTrips: [
      'The Ourika valley — waterfalls and Berber villages in the Atlas foothills',
      'Essaouira — a breezy Atlantic fortress town, three hours west',
      'The Agafay desert — stony, not sandy, but an easy sunset camp',
    ],
    practical: {
      language: 'Arabic and Berber; French widely spoken, English in tourist areas',
      currency: 'Moroccan dirham (MAD). Cash rules in the medina',
      timeZone: 'UTC+1',
      plug: 'Type C/E, 220V',
      visa: 'Visa-free short stays for most Western passports',
      gettingAround:
        'Walk the medina — cars cannot enter most of it. Petits taxis are cheap but agree the fare or insist on the meter.',
      safety:
        'Low violent crime, high hassle. Ignore unsolicited offers to guide you, and be firm about tannery "tours" that end in a hard sell.',
    },
    seasons: [
      {
        months: ['Mar', 'Apr', 'May'],
        label: 'Spring',
        note: 'Warm days, snow still on the Atlas behind the city. The ideal window.',
      },
      {
        months: ['Jun', 'Jul', 'Aug'],
        label: 'Furnace',
        note: 'Regularly above 40°C. Only worth it with a pool and a strict siesta.',
      },
      {
        months: ['Sep', 'Oct', 'Nov'],
        label: 'Autumn',
        note: 'Heat breaks in late September; November is mild and clear.',
      },
      {
        months: ['Dec', 'Jan', 'Feb'],
        label: 'Cool and bright',
        note: 'Pleasant by day, genuinely cold at night — riads are often unheated.',
      },
    ],
    monthlyNote: {
      Mar: 'Warm without the furnace, with Atlas snow as a backdrop to the red walls.',
      Apr: 'The best month: gardens in bloom, comfortable heat, long evenings on the square.',
      Oct: 'The summer heat finally breaks and the medina becomes walkable again.',
      Nov: 'Clear, mild and cheap, with the lowest crowds of the good months.',
    },
  },
  {
    slug: 'queenstown',
    name: 'Queenstown',
    country: 'New Zealand',
    region: 'Oceania',
    emoji: '🏔️',
    tagline: 'Adventure capital on a glacial lake',
    summary:
      'Bungee, ski and hike straight out of town, with the Remarkables at your back and Lake Wakatipu in front. Fiordland is close enough for a long, spectacular day.',
    dailyBudget: 165,
    budgetBreakdown: { stay: 70, food: 40, transport: 20, activities: 35 },
    bestMonths: ['Jan', 'Feb', 'Mar', 'Dec'],
    tags: ['adventure', 'nature', 'hiking'],
    highlights: ['Milford Sound cruise', 'Ben Lomond track', 'Gibbston valley wineries'],
    gradient: ['#6ee7b7', '#0f766e'],
    overview: [
      'Queenstown is a resort town of about 16,000 people wedged between a glacial lake and a wall of mountains called the Remarkables, and it has built an entire economy on adrenaline. Commercial bungee jumping was invented here in 1988.',
      'The setting does most of the work. Lake Wakatipu is a 80km zigzag of meltwater, and the town sits on a small delta halfway along it, which is why everything feels vertical — you climb out of town in every direction.',
      'It is not a cheap or a quiet place, and in peak summer the centre is wall-to-wall. The escape is easy though: an hour’s drive gets you to Glenorchy, Arrowtown or the Gibbston wine valley, and the crowds evaporate.',
    ],
    neighbourhoods: [
      {
        name: 'Town centre',
        bestFor: 'First visits, nightlife, no car',
        description:
          'Compact and walkable, right on the lakefront. Everything departs from here, and you pay for the convenience.',
      },
      {
        name: 'Frankton',
        bestFor: 'Value, families, airport access',
        description:
          'Ten minutes east by the airport. Cheaper beds, supermarkets, and a lakeside track back into town.',
      },
      {
        name: 'Arrowtown',
        bestFor: 'Charm, autumn colour, quiet',
        description:
          'A restored gold-rush village 20 minutes away. Wooden shopfronts, excellent food, and spectacular in April.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'Lake and ridge',
        morning: 'The Skyline gondola, then the Ben Lomond track if the weather holds.',
        afternoon: 'The TSS Earnslaw steamship across the lake to Walter Peak.',
        evening: 'A Fergburger queue, then drinks on the waterfront.',
      },
      {
        day: 2,
        title: 'Fiordland',
        morning: 'The long drive to Milford Sound through the Homer tunnel — leave by six.',
        afternoon: 'A boat into the fiord beneath Mitre Peak and the Stirling Falls.',
        evening: 'Back late via Te Anau; eat there rather than driving hungry.',
      },
      {
        day: 3,
        title: 'Wine and gold',
        morning: 'The Gibbston valley by bike, tasting pinot noir along the river trail.',
        afternoon: 'Arrowtown’s Chinese settlement and the Arrow river.',
        evening: 'Back to town for the Kawarau bridge bungee, if you must.',
      },
    ],
    foodPicks: [
      'Central Otago pinot noir, the reason the valley exists',
      'Green-lipped mussels and Bluff oysters in season',
      'A proper lamb roast, which New Zealand still does better than anywhere',
      'Hokey pokey ice cream — vanilla shot through with honeycomb',
    ],
    dayTrips: [
      'Milford Sound — a 12-hour round trip, and worth every hour of it',
      'Glenorchy — the head of the lake, and the road there is the attraction',
      'Wanaka — a calmer lake town an hour north over the Crown Range',
    ],
    practical: {
      language: 'English',
      currency: 'New Zealand dollar (NZ$). Card everywhere',
      timeZone: 'NZST (UTC+12), NZDT (UTC+13) in summer',
      plug: 'Type I, 230V',
      visa: 'NZeTA required in advance for most visa-waiver nationalities',
      gettingAround:
        'The town centre is walkable; everything else needs a car. Book rentals early over the December–February peak.',
      safety:
        'Very safe. The hazards are alpine: weather that turns in an hour, and sandflies on the Fiordland side that are genuinely relentless.',
    },
    seasons: [
      {
        months: ['Dec', 'Jan', 'Feb'],
        label: 'Summer',
        note: 'Long days, every track open, and the busiest and priciest weeks of the year.',
      },
      {
        months: ['Mar', 'Apr'],
        label: 'Autumn',
        note: 'Golden poplars around Arrowtown, stable weather, far fewer people. A local favourite.',
      },
      {
        months: ['Jun', 'Jul', 'Aug'],
        label: 'Ski season',
        note: 'Four fields within an hour. Cold, dark early, and a completely different town.',
      },
      {
        months: ['Sep', 'Oct', 'Nov'],
        label: 'Spring',
        note: 'Unsettled and changeable, but cheap, green and quiet before the rush.',
      },
    ],
    monthlyNote: {
      Dec: 'Long summer evenings and every alpine track finally clear of snow.',
      Jan: 'Peak summer — warm lake swims, midnight light and full-tilt adventure season.',
      Feb: 'The most settled weather of the year, just after the January crowds thin.',
      Mar: 'Autumn light, stable skies and the start of the golden poplars.',
    },
  },
  {
    slug: 'mexico-city',
    name: 'Mexico City',
    country: 'Mexico',
    region: 'Americas',
    emoji: '🌮',
    tagline: 'Murals, mezcal and the best street food anywhere',
    summary:
      'An endlessly layered capital: Aztec foundations under colonial squares, Art Deco Roma Norte, and a food scene that runs from taquería stools to the world’s best tables.',
    dailyBudget: 85,
    budgetBreakdown: { stay: 40, food: 22, transport: 8, activities: 15 },
    bestMonths: ['Mar', 'Apr', 'Oct', 'Nov'],
    tags: ['food', 'culture', 'budget'],
    highlights: ['Teotihuacán pyramids', 'Frida Kahlo’s Casa Azul', 'Sunday in Chapultepec'],
    gradient: ['#fca5a5', '#be185d'],
    overview: [
      'Mexico City is built on a drained lake bed at 2,240 metres, on top of the Aztec capital Tenochtitlán, and it is sinking — you can see it in the tilted colonial facades around the Zócalo. Nine million people live in the city proper and over twenty in the metro area.',
      'It is one of the great museum cities: the Museo Nacional de Antropología alone justifies the trip. But the real draw is how liveable the central neighbourhoods are, with jacaranda-lined streets, Art Deco apartment blocks and a park bigger than Central Park.',
      'The altitude is the thing people underestimate. Give yourself a slow first day, drink more water than feels necessary, and go easy on the mezcal until you have adjusted.',
    ],
    neighbourhoods: [
      {
        name: 'Roma Norte & Condesa',
        bestFor: 'First visits, food, walkability',
        description:
          'Leafy, Art Deco and full of the restaurants and cafés everyone comes for. The default base, and deservedly so.',
      },
      {
        name: 'Centro Histórico',
        bestFor: 'Sights, history, cheap eats',
        description:
          'The Zócalo, the Templo Mayor and the Bellas Artes palace. Loud and commercial by day, quieter than you would expect at night.',
      },
      {
        name: 'Coyoacán',
        bestFor: 'Weekends, Frida Kahlo, calm',
        description:
          'A colonial village swallowed by the city, with cobbles, a market and the Casa Azul. Best on a Sunday.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'The historic centre',
        morning: 'The Zócalo, the cathedral and the Templo Mayor excavation beside it.',
        afternoon: 'Diego Rivera’s murals in the Palacio Nacional, then Bellas Artes.',
        evening: 'Tacos al pastor in Roma Norte, carved off the spit.',
      },
      {
        day: 2,
        title: 'Park and museums',
        morning: 'The Museo Nacional de Antropología — allow three hours minimum.',
        afternoon: 'Chapultepec castle and a walk through the park.',
        evening: 'Mezcal in a Condesa cantina, dinner late by local habit.',
      },
      {
        day: 3,
        title: 'Pyramids and Coyoacán',
        morning: 'Teotihuacán at opening, climbing the Pyramid of the Sun before the heat.',
        afternoon: 'Back for the Casa Azul in Coyoacán — book online days ahead.',
        evening: 'The Coyoacán market for tostadas and churros.',
      },
    ],
    foodPicks: [
      'Tacos al pastor, shaved from the trompo with a slice of pineapple',
      'Mole poblano — thirty-odd ingredients including chocolate and chilli',
      'Chilaquiles for breakfast, green or red, with a fried egg',
      'Tlacoyos from a comal on the street, filled with beans and cactus',
    ],
    dayTrips: [
      'Teotihuacán — the vast pre-Aztec pyramid complex an hour north',
      'Xochimilco — punt the surviving Aztec canals on a painted trajinera',
      'Puebla — colonial arcades and the country’s best mole, two hours east',
    ],
    practical: {
      language: 'Spanish; English limited outside tourist areas and upmarket restaurants',
      currency: 'Mexican peso (MXN). Cards in restaurants, cash for street food',
      timeZone: 'CST (UTC−6), no daylight saving since 2022',
      plug: 'Type A/B, 127V',
      visa: 'Visa-free short stays for most Western passports',
      gettingAround:
        'The metro is cheap and extensive but packed at rush hour. Use Uber or authorised sitio taxis rather than hailing on the street.',
      safety:
        'The central neighbourhoods are fine with normal city sense. Avoid hailing street taxis, keep phones away on the metro, and be cautious after dark outside the main areas.',
    },
    seasons: [
      {
        months: ['Mar', 'Apr', 'May'],
        label: 'Dry and warm',
        note: 'Jacarandas turn the city purple in March. May is the hottest and haziest month.',
      },
      {
        months: ['Jun', 'Jul', 'Aug', 'Sep'],
        label: 'Rainy season',
        note: 'Sunny mornings and a heavy afternoon downpour most days. Green and uncrowded.',
      },
      {
        months: ['Oct', 'Nov'],
        label: 'The best window',
        note: 'Rain stops, air clears, and Día de Muertos fills the city at the start of November.',
      },
      {
        months: ['Dec', 'Jan', 'Feb'],
        label: 'Cool and dry',
        note: 'Warm days, cold nights, and the worst of the winter air quality.',
      },
    ],
    monthlyNote: {
      Mar: 'The jacarandas bloom and the whole city turns lilac for three weeks.',
      Apr: 'Dry, warm and clear, before the May heat and the June rains.',
      Oct: 'The rains end, the air clears, and Día de Muertos preparations begin.',
      Nov: 'Día de Muertos, the best weather of the year, and perfect walking temperatures.',
    },
  },
  {
    slug: 'hanoi',
    name: 'Hanoi',
    country: 'Vietnam',
    region: 'Asia',
    emoji: '🍜',
    tagline: 'Old Quarter chaos and lakeside calm',
    summary:
      'Plastic stools, charcoal smoke and motorbike rivers — then a block later, a still lake and a temple. Hạ Long Bay and the Ninh Bình karsts are both easy escapes.',
    dailyBudget: 55,
    budgetBreakdown: { stay: 25, food: 14, transport: 6, activities: 10 },
    bestMonths: ['Oct', 'Nov', 'Mar', 'Apr'],
    tags: ['food', 'budget', 'culture'],
    highlights: ['Bún chả lunch', 'Train Street coffee', 'Ninh Bình boat ride'],
    gradient: ['#fde68a', '#15803d'],
    overview: [
      'Hanoi is a thousand years old and wears its history in layers: a Chinese-influenced old quarter of guild streets, a French colonial quarter of villas and boulevards, and a socialist capital of monuments and parade grounds.',
      'The Old Quarter is the heart of it — 36 streets each historically dedicated to one trade, now a dense tangle of shophouses, street kitchens and motorbikes. It is loud and relentless, and the lakes scattered through the city are the pressure valve.',
      'It is exceptionally cheap by any standard, and the food is the main event. A bowl of phở from a street kitchen costs about two dollars and will be better than anything you can get for thirty at home.',
    ],
    neighbourhoods: [
      {
        name: 'Old Quarter',
        bestFor: 'Street food, energy, first visits',
        description:
          'The dense historic core by Hoàn Kiếm lake. Chaotic, cheap and endlessly interesting, though noisy well into the night.',
      },
      {
        name: 'French Quarter (Hoàn Kiếm south)',
        bestFor: 'Comfort, architecture, quiet',
        description:
          'Wide boulevards, the opera house and colonial villas. Calmer and smarter, a ten-minute walk from the chaos.',
      },
      {
        name: 'Tây Hồ (West Lake)',
        bestFor: 'Longer stays, cafés, expat food',
        description:
          'A large lake north of the centre ringed by cafés and restaurants. Residential, leafy and much more relaxed.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'The Old Quarter',
        morning: 'Hoàn Kiếm lake at dawn, when the city does tai chi on the shore.',
        afternoon: 'Walk the guild streets, then the Temple of Literature.',
        evening: 'Bia hơi on a street corner — fresh draught beer for under a dollar.',
      },
      {
        day: 2,
        title: 'History and coffee',
        morning: 'The Ho Chi Minh mausoleum and the One Pillar Pagoda.',
        afternoon: 'The Museum of Ethnology, the city’s most underrated.',
        evening: 'Egg coffee at a hidden upstairs café, then a water puppet show.',
      },
      {
        day: 3,
        title: 'Karst country',
        morning: 'Drive to Ninh Bình, two hours south through rice paddy.',
        afternoon: 'A rowboat through the Tam Cốc caves between limestone towers.',
        evening: 'Back to Hanoi for bún chả — grilled pork in broth, Obama-style.',
      },
    ],
    foodPicks: [
      'Phở bò at 6am, the way locals actually eat it',
      'Bún chả — charcoal-grilled pork patties in a sweet-sour dipping broth',
      'Bánh mì from a street cart, pâté and pickled carrot in a crisp baguette',
      'Cà phê trứng, the egg-yolk coffee Hanoi invented during a milk shortage',
    ],
    dayTrips: [
      'Ninh Bình — limestone karsts and rice fields, the "Hạ Long Bay on land"',
      'Hạ Long Bay — best as an overnight cruise rather than a rushed day trip',
      'Bát Tràng — the ceramic village on the Red River, an hour out',
    ],
    practical: {
      language: 'Vietnamese; English common in tourist areas, limited elsewhere',
      currency: 'Vietnamese đồng (VND). Cash for street food, cards in hotels',
      timeZone: 'ICT (UTC+7)',
      plug: 'Type A/C, 220V',
      visa: 'E-visa required for most nationalities — apply online in advance',
      gettingAround:
        'Walk the Old Quarter and use Grab for everything else. Crossing the road means walking slowly and steadily so bikes can flow around you.',
      safety:
        'Low violent crime. Watch for bag-snatching from passing motorbikes, and be careful with traffic — it does not stop for pedestrians.',
    },
    seasons: [
      {
        months: ['Mar', 'Apr'],
        label: 'Spring',
        note: 'Mild and pleasant, though often grey with drizzle in March.',
      },
      {
        months: ['May', 'Jun', 'Jul', 'Aug'],
        label: 'Hot and wet',
        note: 'Humid, above 35°C, with heavy monsoon rain and typhoon risk on the coast.',
      },
      {
        months: ['Oct', 'Nov'],
        label: 'The best months',
        note: 'Dry, clear and warm without the humidity. Peak season for good reason.',
      },
      {
        months: ['Dec', 'Jan', 'Feb'],
        label: 'Cool winter',
        note: 'Surprisingly chilly and damp — down to 10°C, and buildings are not heated.',
      },
    ],
    monthlyNote: {
      Mar: 'Spring warmth returns and the winter damp lifts off the lakes.',
      Apr: 'Comfortable heat before the monsoon, with long clear evenings.',
      Oct: 'The finest month: dry, clear, warm and free of summer humidity.',
      Nov: 'Cool, bright days ideal for walking the Old Quarter all afternoon.',
    },
  },
  {
    slug: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    emoji: '🐧',
    tagline: 'A mountain, two oceans and a wine valley',
    summary:
      'Table Mountain anchors the city; on either side there are penguins, surf beaches and some of the oldest vineyards in the southern hemisphere.',
    dailyBudget: 105,
    budgetBreakdown: { stay: 50, food: 28, transport: 15, activities: 12 },
    bestMonths: ['Nov', 'Dec', 'Feb', 'Mar'],
    tags: ['nature', 'coast', 'wine'],
    highlights: ['Table Mountain at dawn', 'Cape Point drive', 'Stellenbosch tasting'],
    gradient: ['#93c5fd', '#1d4ed8'],
    overview: [
      'Cape Town is wrapped around a 1,000-metre flat-topped mountain that sits in the middle of the city, and almost every decision you make here — where to stay, what to do, whether the beach is windy — comes back to it.',
      'The peninsula runs 50km south from the centre to the Cape of Good Hope, with the cold Atlantic on one side and the warmer False Bay on the other. That geography packs an improbable amount into a short drive: penguins, baboons, vineyards and empty white beaches.',
      'It is also a city marked by apartheid’s spatial legacy, with enormous inequality visible between the Atlantic seaboard and the Cape Flats. Visitors who engage with that — through a District Six museum visit or a Langa walking tour led by residents — get a far truer picture.',
    ],
    neighbourhoods: [
      {
        name: 'City Bowl & Gardens',
        bestFor: 'First visits, museums, walkability',
        description:
          'The centre in the mountain’s amphitheatre. Close to Company’s Garden, Bo-Kaap and the cable car station.',
      },
      {
        name: 'Camps Bay & Sea Point',
        bestFor: 'Beaches, sunsets, restaurants',
        description:
          'The Atlantic seaboard under the Twelve Apostles. Spectacular, pricey, and windy when the southeaster blows.',
      },
      {
        name: 'Woodstock',
        bestFor: 'Design, markets, coffee',
        description:
          'A rapidly changing old industrial quarter with galleries and the Saturday Neighbourgoods market. Take care after dark.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'The mountain',
        morning: 'Table Mountain by cable car at opening, or up Platteklip Gorge on foot.',
        afternoon: 'Bo-Kaap’s coloured houses and the Cape Malay food history.',
        evening: 'Sundowners at Signal Hill as the noon gun city goes gold.',
      },
      {
        day: 2,
        title: 'The peninsula',
        morning: 'Chapman’s Peak drive south to Hout Bay and Noordhoek.',
        afternoon: 'Cape Point and the Cape of Good Hope, watching for baboons.',
        evening: 'Boulders Beach penguins on the way back, then dinner in Kalk Bay.',
      },
      {
        day: 3,
        title: 'Winelands',
        morning: 'Drive to Stellenbosch, 45 minutes inland through the mountains.',
        afternoon: 'Two estates, slowly — chenin blanc and cabernet, with lunch between.',
        evening: 'Back via Franschhoek for the drive over the pass at sunset.',
      },
    ],
    foodPicks: [
      'A braai — the national barbecue, and a social institution',
      'Cape Malay bobotie: curried mince under a savoury custard',
      'Snoek, a local fish, smoked or grilled with apricot jam',
      'Chenin blanc from Stellenbosch, South Africa’s signature white',
    ],
    dayTrips: [
      'The Cape Peninsula loop — Chapman’s Peak, Cape Point and the penguins',
      'Stellenbosch and Franschhoek — three centuries of winemaking, an hour east',
      'Hermanus — land-based whale watching from June to November',
    ],
    practical: {
      language: 'English, Afrikaans and isiXhosa; English universal',
      currency: 'South African rand (ZAR). Cards widely accepted',
      timeZone: 'SAST (UTC+2)',
      plug: 'Type M/N, 230V — an unusual large three-pin, bring an adapter',
      visa: 'Visa-free short stays for most Western passports',
      gettingAround:
        'A car is close to essential for the peninsula and winelands. In the centre use Uber; the MyCiTi bus is good but limited.',
      safety:
        'Take it seriously. Stick to well-used areas, do not walk at night, keep valuables out of sight, and never hike Table Mountain alone or off the main routes.',
    },
    seasons: [
      {
        months: ['Dec', 'Jan', 'Feb'],
        label: 'Summer',
        note: 'Hot, dry and busy, with the southeaster "Cape Doctor" wind most afternoons.',
      },
      {
        months: ['Mar', 'Apr'],
        label: 'Autumn',
        note: 'The wind drops, the heat eases and the vineyards harvest. Locals’ favourite.',
      },
      {
        months: ['Jun', 'Jul', 'Aug'],
        label: 'Winter',
        note: 'Cold, wet and green, with whales offshore and the lowest prices of the year.',
      },
      {
        months: ['Sep', 'Oct', 'Nov'],
        label: 'Spring',
        note: 'Wildflowers, whales still around, and warm days before the summer crowds.',
      },
    ],
    monthlyNote: {
      Nov: 'Spring warmth, wildflowers inland and the last of the whale season.',
      Dec: 'Peak summer beaches and long evenings, if you can take the crowds.',
      Feb: 'Hot, dry and settled, with the grape harvest beginning in the winelands.',
      Mar: 'The wind finally drops — the clearest, calmest month on the peninsula.',
    },
  },
  {
    slug: 'florence',
    name: 'Florence',
    country: 'Italy',
    region: 'Europe',
    emoji: '🎨',
    tagline: 'The Renaissance at walking pace',
    summary:
      'Small enough to cross on foot, dense enough to fill a week. Book the Uffizi ahead, climb the Duomo early, and let Tuscany take the rest of the trip.',
    dailyBudget: 130,
    budgetBreakdown: { stay: 65, food: 38, transport: 7, activities: 20 },
    bestMonths: ['Apr', 'May', 'Sep', 'Oct'],
    tags: ['culture', 'food', 'walkable'],
    highlights: ['Duomo cupola climb', 'Uffizi Gallery', 'Sunset at Piazzale Michelangelo'],
    gradient: ['#fbcfe8', '#9d174d'],
    overview: [
      'Florence packed more artistic invention into a century than most countries manage in a millennium, and the compact medieval centre still holds most of it. You can walk from the Duomo to the Pitti Palace in twenty minutes, crossing the Arno on a bridge built in 1345.',
      'That density is also the problem: around 15 million visitors a year funnel through a historic centre you could cross in half an hour. The fix is timing rather than avoidance — the same streets that are impassable at noon are yours at eight in the morning.',
      'Book everything. The Uffizi, the Accademia and the Duomo cupola all sell timed entry, and turning up on the day in season means either a three-hour queue or no entry at all.',
    ],
    neighbourhoods: [
      {
        name: 'Duomo & Centro',
        bestFor: 'First visits, sights on the doorstep',
        description:
          'Inside the historic core. Unbeatable for access, priced accordingly, and noisy with foot traffic until late.',
      },
      {
        name: 'Oltrarno & Santo Spirito',
        bestFor: 'Food, artisans, local life',
        description:
          'Across the river. Workshops, trattorias and a square that fills with locals at aperitivo. The best base for a second visit.',
      },
      {
        name: 'San Niccolò',
        bestFor: 'Quiet, views, evening walks',
        description:
          'Tucked under the hill below Piazzale Michelangelo. Residential and calm, ten minutes from the Ponte Vecchio.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'The Duomo',
        morning: 'Brunelleschi’s cupola at the first slot, then the baptistery doors.',
        afternoon: 'Santa Croce and the tombs of Michelangelo, Galileo and Machiavelli.',
        evening: 'Aperitivo in Santo Spirito, dinner at a neighbourhood trattoria.',
      },
      {
        day: 2,
        title: 'The galleries',
        morning: 'The Uffizi at opening — Botticelli, Leonardo and the Caravaggio rooms.',
        afternoon: 'The Accademia for the David, then the San Marco friars’ cells.',
        evening: 'Sunset at Piazzale Michelangelo, walking up rather than taking the bus.',
      },
      {
        day: 3,
        title: 'Oltrarno and Tuscany',
        morning: 'The Pitti Palace and the Boboli gardens behind it.',
        afternoon: 'A train to Siena or a drive through the Chianti hills.',
        evening: 'Bistecca alla fiorentina, shared, cooked rare whether you like it or not.',
      },
    ],
    foodPicks: [
      'Bistecca alla fiorentina — a vast T-bone, charred outside, blue within',
      'Lampredotto, the tripe sandwich sold from street carts',
      'Ribollita: the bread and bean soup that Tuscan cooking is built on',
      'Chianti Classico from the hills between Florence and Siena',
    ],
    dayTrips: [
      'Siena — the great Gothic rival city and its shell-shaped square, 90 minutes south',
      'The Chianti hills — vineyards and hill towns, best with a car',
      'Pisa and Lucca — the tower plus a walled town that is far more charming',
    ],
    practical: {
      language: 'Italian; English widely spoken in the centre',
      currency: 'Euro (€). Cards accepted nearly everywhere',
      timeZone: 'CET (UTC+1), CEST in summer',
      plug: 'Type F/L, 230V',
      visa: 'Schengen area rules apply',
      gettingAround:
        'Walk — the centre is largely pedestrianised and a limited traffic zone fines drivers automatically. Trains handle Tuscany well.',
      safety: 'Very safe. Pickpocketing around the Duomo and on the Pisa train is the main risk.',
    },
    seasons: [
      {
        months: ['Apr', 'May'],
        label: 'Spring',
        note: 'Warm, green and busy. Book everything well ahead.',
      },
      {
        months: ['Jun', 'Jul', 'Aug'],
        label: 'Hot and crowded',
        note: 'Above 35°C in a stone valley, with peak crowds. August empties of locals.',
      },
      {
        months: ['Sep', 'Oct'],
        label: 'Harvest',
        note: 'The best combination of weather, light and food all year.',
      },
      {
        months: ['Nov', 'Dec', 'Jan', 'Feb'],
        label: 'Low season',
        note: 'Cold and often wet, but the galleries are walk-in and the city feels Italian again.',
      },
    ],
    monthlyNote: {
      Apr: 'Spring light on the stone and gardens opening before the summer heat.',
      May: 'Warm, long evenings and the last month before the crowds peak.',
      Sep: 'Harvest in the Chianti hills and the heat finally breaking.',
      Oct: 'Golden light, truffle season and galleries you can actually move through.',
    },
  },
  {
    slug: 'patagonia',
    name: 'Patagonia',
    country: 'Chile & Argentina',
    region: 'Americas',
    emoji: '🏕️',
    tagline: 'Granite towers, glaciers and relentless wind',
    summary:
      'The end of the continent, and the best multi-day trekking on it. Torres del Paine’s W circuit and El Chaltén’s day hikes bookend a long, wild road.',
    dailyBudget: 140,
    budgetBreakdown: { stay: 55, food: 35, transport: 30, activities: 20 },
    bestMonths: ['Nov', 'Dec', 'Jan', 'Feb'],
    tags: ['adventure', 'hiking', 'nature'],
    highlights: ['W trek in Torres del Paine', 'Perito Moreno glacier', 'Fitz Roy sunrise'],
    gradient: ['#a5b4fc', '#334155'],
    overview: [
      'Patagonia is not a country but a region split between Chile and Argentina, covering a million square kilometres of steppe, ice field and granite. Most visitors focus on a small southern corner: Torres del Paine in Chile and El Chaltén and El Calafate in Argentina.',
      'The Southern Patagonian Ice Field is the largest outside the poles, and it feeds glaciers you can walk up to — Perito Moreno calves house-sized blocks into a lake all day, in full view of a boardwalk.',
      'Distances and wind define everything. Bus journeys run five to eight hours, border crossings eat half a day, and the westerly wind regularly gusts past 100km/h in summer. Build slack into the itinerary, because weather will take a day from you.',
    ],
    neighbourhoods: [
      {
        name: 'Puerto Natales (Chile)',
        bestFor: 'Torres del Paine basecamp',
        description:
          'A small port town two hours from the park, where every trek is provisioned and every gear rental happens.',
      },
      {
        name: 'El Chaltén (Argentina)',
        bestFor: 'Day hiking, no car needed',
        description:
          'A trekking village where the trails start at the end of the street. Fitz Roy and Cerro Torre both walkable from town.',
      },
      {
        name: 'El Calafate (Argentina)',
        bestFor: 'Glaciers, transport hub',
        description:
          'The airport town for the region and the base for Perito Moreno. More functional than charming.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'Perito Moreno',
        morning: 'Drive from El Calafate to the glacier boardwalks in Los Glaciares park.',
        afternoon: 'A boat to the ice face, or a mini-trek roped onto the glacier itself.',
        evening: 'Back to El Calafate for Patagonian lamb, slow-roasted on a cross.',
      },
      {
        day: 2,
        title: 'Fitz Roy',
        morning: 'Bus to El Chaltén, three hours north across the steppe.',
        afternoon: 'The Laguna Capri trail for the first clear view of the Fitz Roy massif.',
        evening: 'Craft beer in town and an early night before the dawn start.',
      },
      {
        day: 3,
        title: 'Laguna de los Tres',
        morning: 'Leave at 4am to reach the lake below Fitz Roy for sunrise on the granite.',
        afternoon: 'The long descent, with a detour to Piedras Blancas glacier.',
        evening: 'Recover. The final kilometre climbs 400 metres and it is brutal.',
      },
    ],
    foodPicks: [
      'Cordero al palo — lamb splayed on an iron cross over embers',
      'Centolla, king crab, from the Beagle Channel',
      'Calafate berry ice cream, which legend says guarantees your return',
      'Argentine malbec, or a Chilean carmenère on the other side of the border',
    ],
    dayTrips: [
      'Perito Moreno glacier — the one glacier in the world still advancing',
      'Torres del Paine base of the towers — a hard 19km day hike',
      'Estancia visits — working sheep stations with shearing demonstrations',
    ],
    practical: {
      language: 'Spanish; English in tourist operations, rarely elsewhere',
      currency: 'Chilean peso and Argentine peso — carry both, and USD cash for Argentina',
      timeZone: 'UTC−3 both sides in summer',
      plug: 'Type C/I, 220V',
      visa: 'Visa-free short stays for most Western passports; separate entries for each country',
      gettingAround:
        'Long-distance buses connect everything and are reliable. Renting a car across the border needs paperwork arranged in advance.',
      safety:
        'Very low crime. The risks are exposure and weather — carry layers, book refugios ahead, and register your trek with park rangers.',
    },
    seasons: [
      {
        months: ['Dec', 'Jan', 'Feb'],
        label: 'Peak summer',
        note: 'Long days and open trails, but the strongest wind and full refugios. Book months ahead.',
      },
      {
        months: ['Nov', 'Mar'],
        label: 'Shoulder',
        note: 'Less wind, fewer people, still-open trails. The connoisseur’s choice.',
      },
      {
        months: ['Apr', 'May'],
        label: 'Autumn',
        note: 'Beech forests turn red, services wind down, and the weather gets unreliable.',
      },
      {
        months: ['Jun', 'Jul', 'Aug'],
        label: 'Winter',
        note: 'Most of the region closes. Short days, deep cold, limited access.',
      },
    ],
    monthlyNote: {
      Nov: 'Spring on the steppe with the trails open and the wind not yet at full strength.',
      Dec: 'Long days and the whole trekking network open for the season.',
      Jan: 'Peak summer: 17 hours of daylight and every refugio running.',
      Feb: 'Slightly calmer winds than January and the warmest water for kayaking.',
    },
  },
  {
    slug: 'istanbul',
    name: 'Istanbul',
    country: 'Türkiye',
    region: 'Europe',
    emoji: '🫖',
    tagline: 'Two continents, one ferry ride',
    summary:
      'Byzantine domes, Ottoman palaces and a bazaar that has been trading for 500 years — best seen with a tea in hand from the deck of a Bosphorus ferry.',
    dailyBudget: 75,
    budgetBreakdown: { stay: 35, food: 20, transport: 7, activities: 13 },
    bestMonths: ['Apr', 'May', 'Sep', 'Oct'],
    tags: ['culture', 'food', 'budget'],
    highlights: ['Hagia Sophia', 'Bosphorus ferry at dusk', 'Spice Bazaar crawl'],
    gradient: ['#fcd34d', '#b45309'],
    overview: [
      'Istanbul has been the capital of two empires and sits on both sides of the Bosphorus, the strait that separates Europe from Asia. Sixteen million people live here, and the commuter ferries crossing between continents are ordinary public transport.',
      'The historic peninsula holds the headline sights — Hagia Sophia, the Blue Mosque, Topkapı, the Grand Bazaar — within a walkable square kilometre. But the city that people fall for is usually the other one: Karaköy’s coffee, Kadıköy’s fish market, the Asian side’s ordinary streets.',
      'Give the Bosphorus a proper afternoon. A public ferry up the strait costs a couple of dollars, takes 90 minutes, and passes Ottoman palaces, wooden waterfront mansions and two intercontinental bridges.',
    ],
    neighbourhoods: [
      {
        name: 'Sultanahmet',
        bestFor: 'Sights within walking distance',
        description:
          'The historic peninsula. Every major monument on your doorstep, but touristy and quiet after the sights close.',
      },
      {
        name: 'Karaköy & Galata',
        bestFor: 'Food, design, nightlife',
        description:
          'Across the Golden Horn below the Galata tower. Third-wave coffee, meyhane taverns and the best base for a first trip.',
      },
      {
        name: 'Kadıköy (Asian side)',
        bestFor: 'Local life, markets, value',
        description:
          'A twenty-minute ferry east. Where Istanbul eats and drinks without an audience — and noticeably cheaper.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'The peninsula',
        morning: 'Hagia Sophia at opening, then the Blue Mosque across the park.',
        afternoon: 'The Basilica Cistern and Topkapı’s harem and treasury.',
        evening: 'Fish sandwiches at Eminönü, watching the ferries come in.',
      },
      {
        day: 2,
        title: 'Bazaars and the Horn',
        morning: 'The Grand Bazaar, then downhill through the Spice Bazaar.',
        afternoon: 'The Süleymaniye mosque for the best view over the Golden Horn.',
        evening: 'Meyhane dinner in Karaköy — rakı, meze and a lot of small plates.',
      },
      {
        day: 3,
        title: 'Two continents',
        morning: 'The public ferry up the Bosphorus to Anadolu Kavağı.',
        afternoon: 'Cross to Kadıköy for the produce market and the mural streets.',
        evening: 'Moda seafront for sunset back across the water at the old city.',
      },
    ],
    foodPicks: [
      'Balık ekmek — grilled fish in bread, eaten standing by the Galata bridge',
      'İskender kebab: doner over bread with tomato butter and yoghurt',
      'Menemen for breakfast, eggs scrambled with pepper and tomato',
      'Baklava with a Turkish coffee, and a glass of water alongside',
    ],
    dayTrips: [
      'The Princes’ Islands — car-free islands an hour out in the Sea of Marmara',
      'The upper Bosphorus villages — Bebek, Rumeli Hisarı and the fortress',
      'Bursa — the first Ottoman capital and its green mosque, 2.5 hours away',
    ],
    practical: {
      language: 'Turkish; English common in tourist areas, patchy elsewhere',
      currency: 'Turkish lira (TRY). Inflation is high, so prices move fast',
      timeZone: 'UTC+3 year round',
      plug: 'Type C/F, 230V',
      visa: 'E-visa or visa-free depending on nationality — check before booking',
      gettingAround:
        'Get an İstanbulkart: it covers trams, metro, buses and the ferries. Traffic is severe, so rail and boat beat taxis.',
      safety:
        'Generally safe. Watch for inflated taxi fares, the shoeshine scam, and men inviting solo male travellers to bars with enormous bills.',
    },
    seasons: [
      {
        months: ['Apr', 'May'],
        label: 'Tulip season',
        note: 'Mild, blossoming and clear. April brings the tulip festival to the parks.',
      },
      {
        months: ['Jun', 'Jul', 'Aug'],
        label: 'Hot and humid',
        note: 'Above 30°C with heavy crowds. The ferries are the best relief.',
      },
      {
        months: ['Sep', 'Oct'],
        label: 'Autumn',
        note: 'Warm days, cool evenings, thinner crowds. The best all-round window.',
      },
      {
        months: ['Dec', 'Jan', 'Feb'],
        label: 'Cold and grey',
        note: 'Wet, windy and occasionally snowy — though Hagia Sophia in snow is unforgettable.',
      },
    ],
    monthlyNote: {
      Apr: 'Tulips fill the parks and the Bosphorus finally warms enough for deck seats.',
      May: 'Long, mild days before the summer humidity settles over the city.',
      Sep: 'Summer heat eases and the ferry commute becomes the best seat in town.',
      Oct: 'Clear, cool and quiet — the sweet spot for walking the historic peninsula.',
    },
  },
  {
    slug: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    emoji: '🌴',
    tagline: 'Rice terraces, reef breaks and temple smoke',
    summary:
      'Split the trip: Ubud for jungle, ceremony and long lunches, then the Bukit peninsula for cliffs, surf and sunsets over the Indian Ocean.',
    dailyBudget: 70,
    budgetBreakdown: { stay: 32, food: 18, transport: 10, activities: 10 },
    bestMonths: ['May', 'Jun', 'Sep', 'Oct'],
    tags: ['beach', 'budget', 'nature'],
    highlights: ['Tegallalang rice terraces', 'Uluwatu cliff temple', 'Nusa Penida day trip'],
    gradient: ['#86efac', '#0369a1'],
    overview: [
      'Bali is a Hindu island in the world’s largest Muslim country, and that distinctiveness shapes everything: the daily canang sari offerings on every doorstep, the temple festivals, the volcanic landscape terraced into rice paddies by a thousand-year-old irrigation system.',
      'Tourism has hit the south hard. Canggu and Seminyak are dense with traffic and construction, and the "real Bali" of the brochures now takes some seeking out — usually north and east, towards Sidemen, Amed and the slopes of Mount Agung.',
      'The island is small, about 150km across, but the roads are slow. Two hours on a map is often four in practice, so it pays to base yourself in two or three places rather than day-tripping from one.',
    ],
    neighbourhoods: [
      {
        name: 'Ubud',
        bestFor: 'Culture, rice terraces, jungle',
        description:
          'Inland among the paddies and monkey forest. Yoga, craft villages and the island’s cultural heart, though the centre is now busy.',
      },
      {
        name: 'Uluwatu & the Bukit',
        bestFor: 'Surf, cliffs, sunsets',
        description:
          'The limestone peninsula in the far south. World-class reef breaks, dramatic clifftop bars and white-sand coves below.',
      },
      {
        name: 'Amed & Sidemen (east)',
        bestFor: 'Quiet, diving, real village life',
        description:
          'Black-sand fishing villages and terraced valleys under Mount Agung. The Bali most people say they want.',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'Ubud and the paddies',
        morning: 'The Campuhan ridge walk at dawn, before the humidity builds.',
        afternoon: 'Tegallalang terraces and a silversmith workshop in Celuk.',
        evening: 'A legong dance performance at the Ubud palace.',
      },
      {
        day: 2,
        title: 'Volcano and water temples',
        morning: 'Sunrise from Mount Batur, a two-hour climb in the dark.',
        afternoon: 'Tirta Empul’s purification springs, then Lake Beratan’s temple.',
        evening: 'Back to Ubud for babi guling — Balinese suckling pig.',
      },
      {
        day: 3,
        title: 'The south coast',
        morning: 'Transfer to Uluwatu and a morning surf or a beach club.',
        afternoon: 'Padang Padang and Bingin beaches down the cliff stairs.',
        evening: 'The kecak fire dance at Uluwatu temple as the sun drops.',
      },
    ],
    foodPicks: [
      'Babi guling — spit-roast suckling pig with turmeric and lemongrass',
      'Nasi campur, a plate of rice with whatever the warung made that morning',
      'Sate lilit: minced fish satay wrapped around lemongrass stalks',
      'Kopi luwak is a tourist trap — drink ordinary Kintamani arabica instead',
    ],
    dayTrips: [
      'Nusa Penida — cliffs and manta rays, 45 minutes by fast boat',
      'Mount Batur — a pre-dawn volcano climb for sunrise above the clouds',
      'The Gili islands — car-free sand off Lombok, though a long boat ride',
    ],
    practical: {
      language: 'Indonesian and Balinese; English widely spoken in tourist areas',
      currency: 'Indonesian rupiah (IDR). Cash for warungs, cards in resorts',
      timeZone: 'WITA (UTC+8)',
      plug: 'Type C/F, 230V',
      visa: 'Visa on arrival for most nationalities, extendable once',
      gettingAround:
        'Scooters are the local norm but crashes are the top cause of tourist injury. Grab and Gojek work in the south; a driver for the day is cheap and safer.',
      safety:
        'Low violent crime. Real risks are scooter accidents, rip currents on the west coast beaches, and methanol in cheap spirits.',
    },
    seasons: [
      {
        months: ['May', 'Jun', 'Sep', 'Oct'],
        label: 'Dry shoulder',
        note: 'Dry, sunny and less crowded than July. The best value window of the year.',
      },
      {
        months: ['Jul', 'Aug'],
        label: 'Peak dry',
        note: 'The best weather and the highest prices, with the south at a standstill.',
      },
      {
        months: ['Nov', 'Dec'],
        label: 'Wet season starts',
        note: 'Short heavy afternoon downpours, green landscape, Christmas prices in late December.',
      },
      {
        months: ['Jan', 'Feb', 'Mar'],
        label: 'Monsoon',
        note: 'Wettest and most humid, with seaweed on the southern beaches. Cheapest by far.',
      },
    ],
    monthlyNote: {
      May: 'The dry season starts without the July crowds or prices.',
      Jun: 'Reliable sun, calm seas and the best diving visibility before peak season.',
      Sep: 'Dry, quiet and warm after the August rush has cleared out.',
      Oct: 'The last of the dry season, with green landscapes and low-season rates.',
    },
  },
]

export function findDestination(slug: string): Destination | undefined {
  return destinations.find((destination) => destination.slug === slug)
}

export const regions = [...new Set(destinations.map((d) => d.region))].sort()

export const allTags = [...new Set(destinations.flatMap((d) => d.tags))].sort()
