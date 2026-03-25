import type {
  DeveloperCompany,
  DeveloperProject,
  DeveloperProjectLookup,
  MapPin,
  ProjectBuilding,
  ProjectBuildingLookup,
} from "@/types/developers";

const dreamHouseRiversideBuildings: ProjectBuilding[] = [
  {
    id: "dream-house-riverside-a",
    slug: "building-a",
    code: "A",
    name: "Building A",
    status: "Facade finishing",
    handover: "Q4 2026",
    summary: "The signature waterfront block with the highest view premium and the calmest family layouts.",
    totalApartments: 86,
    apartmentsLeft: 19,
    priceFrom: "168000",
    priceTo: "312000",
    areaRange: "54-128 sqm",
    roomTypes: ["1 room", "2 room", "3 room"],
    coverImage: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
    ],
    apartmentTypes: [
      {
        id: "a1",
        slug: "one-bedroom-river",
        title: "One Bedroom River Line",
        summary: "Efficient entry apartment with a full-height living room window and open kitchen core.",
        rooms: 1,
        sizeSqm: "54 sqm",
        price: "168000",
        priceLabel: "From",
        remainingUnits: 8,
        floorRange: "Floors 3-14",
        orientation: "East / river light",
        coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "a2",
        slug: "two-bedroom-corner",
        title: "Two Bedroom Corner Suite",
        summary: "Dual-aspect apartment with dining island, balcony, and balanced family room proportions.",
        rooms: 2,
        sizeSqm: "86 sqm",
        price: "228000",
        priceLabel: "From",
        remainingUnits: 7,
        floorRange: "Floors 5-16",
        orientation: "South-west corner",
        coverImage: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "a3",
        slug: "three-bedroom-family",
        title: "Three Bedroom Family View",
        summary: "Premium family plan with two bathrooms, generous storage, and a larger sunset-facing living zone.",
        rooms: 3,
        sizeSqm: "128 sqm",
        price: "312000",
        priceLabel: "From",
        remainingUnits: 4,
        floorRange: "Floors 10-18",
        orientation: "West terrace side",
        coverImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "dream-house-riverside-b",
    slug: "building-b",
    code: "B",
    name: "Building B",
    status: "Interior fit-out",
    handover: "Q1 2027",
    summary: "The balanced middle tower with the broadest mix of layouts and the strongest value-per-meter ratio.",
    totalApartments: 102,
    apartmentsLeft: 27,
    priceFrom: "154000",
    priceTo: "268000",
    areaRange: "48-112 sqm",
    roomTypes: ["1 room", "2 room", "3 room"],
    coverImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    ],
    apartmentTypes: [
      {
        id: "b1",
        slug: "studio-plus",
        title: "Studio Plus",
        summary: "Compact investor-friendly plan with flexible furniture zoning and an enlarged entry wardrobe.",
        rooms: 1,
        sizeSqm: "48 sqm",
        price: "154000",
        priceLabel: "From",
        remainingUnits: 12,
        floorRange: "Floors 2-11",
        orientation: "Courtyard side",
        coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "b2",
        slug: "two-bedroom-family",
        title: "Two Bedroom Family Core",
        summary: "A practical two-bedroom plan with efficient circulation and quiet separation between rooms.",
        rooms: 2,
        sizeSqm: "79 sqm",
        price: "206000",
        priceLabel: "From",
        remainingUnits: 9,
        floorRange: "Floors 4-15",
        orientation: "East courtyard",
        coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "b3",
        slug: "three-bedroom-sky",
        title: "Three Bedroom Sky Residence",
        summary: "Upper-level premium plan with extended glazing and a larger social living room sequence.",
        rooms: 3,
        sizeSqm: "112 sqm",
        price: "268000",
        priceLabel: "From",
        remainingUnits: 6,
        floorRange: "Floors 12-18",
        orientation: "South-west skyline",
        coverImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "dream-house-riverside-c",
    slug: "building-c",
    code: "C",
    name: "Building C",
    status: "Launch release",
    handover: "Q2 2027",
    summary: "The newest release with the most limited inventory and the cleanest premium corner inventory.",
    totalApartments: 74,
    apartmentsLeft: 14,
    priceFrom: "182000",
    priceTo: "348000",
    areaRange: "60-136 sqm",
    roomTypes: ["2 room", "3 room", "4 room"],
    coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
    ],
    apartmentTypes: [
      {
        id: "c1",
        slug: "two-bedroom-premium",
        title: "Two Bedroom Premium Bay",
        summary: "A brighter corner plan with a larger kitchen island and more layered entertaining space.",
        rooms: 2,
        sizeSqm: "60 sqm",
        price: "182000",
        priceLabel: "From",
        remainingUnits: 5,
        floorRange: "Floors 3-9",
        orientation: "South-east bay",
        coverImage: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "c2",
        slug: "three-bedroom-terrace",
        title: "Three Bedroom Terrace Line",
        summary: "Large living frontage with balcony depth designed for premium end-user buyers.",
        rooms: 3,
        sizeSqm: "104 sqm",
        price: "264000",
        priceLabel: "From",
        remainingUnits: 5,
        floorRange: "Floors 8-17",
        orientation: "River terrace",
        coverImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "c3",
        slug: "four-bedroom-signature",
        title: "Four Bedroom Signature Home",
        summary: "Limited top-tier family residence with private foyer, laundry room, and formal dining zone.",
        rooms: 4,
        sizeSqm: "136 sqm",
        price: "348000",
        priceLabel: "From",
        remainingUnits: 2,
        floorRange: "Floors 15-19",
        orientation: "Panoramic dual aspect",
        coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
];

function createProjectPins(projects: { id: string; name: string; city: string; district: string; caption: string; top: string; left: string }[]): MapPin[] {
  return projects.map((project, index) => ({
    id: `${project.id}-pin`,
    label: project.name,
    city: project.city,
    district: project.district,
    top: project.top,
    left: project.left,
    caption: project.caption,
    emphasis: index === 0 ? "primary" : "muted",
  }));
}

export const developers: DeveloperCompany[] = [
  {
    id: "dream-house",
    slug: "dream-house",
    name: "Dream House",
    logoLettermark: "DH",
    logoWordmark: "Dream House",
    tagline: "Contemporary residential projects with calm luxury, verified delivery, and high-trust presentation.",
    shortDescription: "A premium developer focused on branded apartment living across Tashkent's fastest-growing districts.",
    description:
      "Dream House designs residential projects with a hospitality-grade first impression, practical layouts, and a clear operations standard from launch sales to resident handover. On UyTop, the company experience is designed to feel branded, trustworthy, and decision-ready rather than like a generic listing feed.",
    trustNote: "Verified developer with moderated project presentation, construction updates, and clear availability visibility by building.",
    verified: true,
    foundedYear: 2014,
    headquarters: "Tashkent City",
    homesDelivered: 1240,
    activeCities: 3,
    heroImage: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1800&q=80",
    projects: [
      {
        id: "riverside-signature",
        slug: "riverside-signature",
        name: "Riverside Signature",
        headline: "Waterfront family living with three premium residential blocks and curated apartment layouts.",
        description:
          "Riverside Signature is Dream House's flagship multi-building community. The project combines river-facing apartments, a landscaped courtyard, and a building-by-building release strategy that helps buyers compare inventory with more confidence.",
        locationLabel: "Riverside promenade, Mirabad",
        city: "Tashkent",
        district: "Mirabad",
        address: "38 Riverside Avenue, Mirabad District, Tashkent",
        startingPrice: "154000",
        currency: "USD",
        availabilitySummary: "60 apartments currently available across Buildings A, B, and C.",
        deliveryWindow: "Q4 2026 - Q2 2027",
        heroImage: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1800&q=80",
          "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1800&q=80",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1800&q=80",
        ],
        mapPins: createProjectPins([
          {
            id: "riverside-signature",
            name: "Riverside Signature",
            city: "Tashkent",
            district: "Mirabad",
            caption: "Flagship river-facing launch",
            top: "36%",
            left: "46%",
          },
        ]),
        buildings: dreamHouseRiversideBuildings,
      },
      {
        id: "garden-terrace-residences",
        slug: "garden-terrace-residences",
        name: "Garden Terrace Residences",
        headline: "Quiet mid-rise residences with landscaped decks and premium family floor plans.",
        description:
          "Garden Terrace Residences is designed for buyers who value calmer neighborhood living with boutique-scale density, terrace-facing social areas, and a more intimate building mix.",
        locationLabel: "Yunusabad garden district",
        city: "Tashkent",
        district: "Yunusabad",
        address: "12 Botanica Street, Yunusabad District, Tashkent",
        startingPrice: "138000",
        currency: "USD",
        availabilitySummary: "24 apartments available in two family-oriented blocks.",
        deliveryWindow: "Q3 2027",
        heroImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1800&q=80",
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80",
        ],
        mapPins: createProjectPins([
          {
            id: "garden-terrace-residences",
            name: "Garden Terrace Residences",
            city: "Tashkent",
            district: "Yunusabad",
            caption: "Boutique family block",
            top: "24%",
            left: "63%",
          },
        ]),
        buildings: [
          {
            id: "garden-terrace-a",
            slug: "garden-a",
            code: "A",
            name: "Garden Building A",
            status: "Sales open",
            handover: "Q3 2027",
            summary: "A boutique mid-rise with larger two-bedroom and three-bedroom homes.",
            totalApartments: 42,
            apartmentsLeft: 16,
            priceFrom: "138000",
            priceTo: "254000",
            areaRange: "58-118 sqm",
            roomTypes: ["2 room", "3 room"],
            coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
            gallery: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80"],
            apartmentTypes: [
              {
                id: "g1",
                slug: "garden-two-bedroom",
                title: "Garden Two Bedroom",
                summary: "A light-filled family plan with terrace-facing living space.",
                rooms: 2,
                sizeSqm: "58 sqm",
                price: "138000",
                priceLabel: "From",
                remainingUnits: 10,
                floorRange: "Floors 2-7",
                orientation: "Courtyard green",
                coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
                layoutImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
              },
            ],
          },
        ],
      },
      {
        id: "azure-heights",
        slug: "azure-heights",
        name: "Azure Heights",
        headline: "A skyline-facing high-rise collection for buyers seeking more view-driven premium inventory.",
        description:
          "Azure Heights extends the Dream House brand into more elevated skyline living, with fewer units per floor and more limited premium family layouts.",
        locationLabel: "Shaykhantahur skyline edge",
        city: "Tashkent",
        district: "Shaykhantahur",
        address: "44 Blue Avenue, Shaykhantahur District, Tashkent",
        startingPrice: "176000",
        currency: "USD",
        availabilitySummary: "18 premium apartments available in the current release.",
        deliveryWindow: "Q1 2028",
        heroImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=80",
        ],
        mapPins: createProjectPins([
          {
            id: "azure-heights",
            name: "Azure Heights",
            city: "Tashkent",
            district: "Shaykhantahur",
            caption: "High-rise skyline inventory",
            top: "56%",
            left: "28%",
          },
        ]),
        buildings: [
          {
            id: "azure-a",
            slug: "tower-a",
            code: "A",
            name: "Tower A",
            status: "Reservation phase",
            handover: "Q1 2028",
            summary: "Higher-floor residences with more limited inventory and larger glazing packages.",
            totalApartments: 38,
            apartmentsLeft: 12,
            priceFrom: "176000",
            priceTo: "336000",
            areaRange: "62-132 sqm",
            roomTypes: ["2 room", "3 room", "4 room"],
            coverImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
            gallery: ["https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80"],
            apartmentTypes: [
              {
                id: "az1",
                slug: "azure-two-bedroom",
                title: "Azure Two Bedroom",
                summary: "A premium corner apartment with deeper skyline glazing.",
                rooms: 2,
                sizeSqm: "62 sqm",
                price: "176000",
                priceLabel: "From",
                remainingUnits: 8,
                floorRange: "Floors 6-18",
                orientation: "City skyline",
                coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                layoutImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "meridian-living",
    slug: "meridian-living",
    name: "Meridian Living",
    logoLettermark: "ML",
    logoWordmark: "Meridian Living",
    tagline: "Boutique urban homes shaped around quieter streets, resident comfort, and efficient premium layouts.",
    shortDescription: "A smaller developer brand focused on low-density city residences and gentle architectural detailing.",
    description:
      "Meridian Living develops boutique apartment projects with a residential hospitality mindset. Their product language is quieter than Dream House, but still premium, structured, and trust-led.",
    trustNote: "Verified developer profile with moderated project pages and clear release-stage visibility.",
    verified: true,
    foundedYear: 2018,
    headquarters: "Tashkent, Mirzo-Ulugbek",
    homesDelivered: 320,
    activeCities: 1,
    heroImage: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1800&q=80",
    projects: [
      {
        id: "cedar-lane-homes",
        slug: "cedar-lane-homes",
        name: "Cedar Lane Homes",
        headline: "Low-rise city homes for buyers who prefer a more intimate premium neighborhood experience.",
        description: "A low-density project with terrace-ready plans, soft landscaping, and a narrower unit mix.",
        locationLabel: "Mirzo-Ulugbek residential pocket",
        city: "Tashkent",
        district: "Mirzo-Ulugbek",
        address: "6 Cedar Lane, Mirzo-Ulugbek District, Tashkent",
        startingPrice: "129000",
        currency: "USD",
        availabilitySummary: "12 apartments currently available in the last release phase.",
        deliveryWindow: "Q4 2027",
        heroImage: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1800&q=80",
        gallery: ["https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1800&q=80"],
        mapPins: createProjectPins([
          {
            id: "cedar-lane-homes",
            name: "Cedar Lane Homes",
            city: "Tashkent",
            district: "Mirzo-Ulugbek",
            caption: "Boutique low-rise release",
            top: "42%",
            left: "66%",
          },
        ]),
        buildings: [
          {
            id: "cedar-a",
            slug: "house-a",
            code: "A",
            name: "House A",
            status: "Last release",
            handover: "Q4 2027",
            summary: "Final family layouts in a terrace-led corner building.",
            totalApartments: 24,
            apartmentsLeft: 12,
            priceFrom: "129000",
            priceTo: "214000",
            areaRange: "56-104 sqm",
            roomTypes: ["2 room", "3 room"],
            coverImage: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1400&q=80",
            gallery: ["https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1400&q=80"],
            apartmentTypes: [
              {
                id: "cedar-type-a",
                slug: "cedar-two-bedroom",
                title: "Cedar Two Bedroom",
                summary: "A practical low-rise family apartment with a wider kitchen-living frontage.",
                rooms: 2,
                sizeSqm: "56 sqm",
                price: "129000",
                priceLabel: "From",
                remainingUnits: 7,
                floorRange: "Floors 1-4",
                orientation: "Garden side",
                coverImage: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
                layoutImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "atlas-crest",
    slug: "atlas-crest",
    name: "Atlas Crest",
    logoLettermark: "AC",
    logoWordmark: "Atlas Crest",
    tagline: "Urban mixed-density residential projects with stronger investment positioning and polished launch presentation.",
    shortDescription: "An emerging developer focused on launch-ready urban inventory and clearer release-stage pricing.",
    description:
      "Atlas Crest pairs faster-moving city inventory with a more investment-oriented product narrative, while still maintaining a premium project presentation and verified trust layer.",
    trustNote: "Verified developer identity and moderated project launch flow.",
    verified: true,
    foundedYear: 2020,
    headquarters: "Tashkent, Mirobod",
    homesDelivered: 180,
    activeCities: 1,
    heroImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80",
    projects: [
      {
        id: "north-bank-lofts",
        slug: "north-bank-lofts",
        name: "North Bank Lofts",
        headline: "Compact premium apartments near the business corridor with stronger investor appeal.",
        description: "A more compact urban project with investor-friendly floor plans and higher rental demand positioning.",
        locationLabel: "Mirobod business edge",
        city: "Tashkent",
        district: "Mirobod",
        address: "27 North Bank Road, Mirobod District, Tashkent",
        startingPrice: "118000",
        currency: "USD",
        availabilitySummary: "20 apartments available in the active release phase.",
        deliveryWindow: "Q2 2027",
        heroImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80",
        gallery: ["https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80"],
        mapPins: createProjectPins([
          {
            id: "north-bank-lofts",
            name: "North Bank Lofts",
            city: "Tashkent",
            district: "Mirobod",
            caption: "Compact investor-led project",
            top: "52%",
            left: "54%",
          },
        ]),
        buildings: [
          {
            id: "north-bank-a",
            slug: "north-block-a",
            code: "A",
            name: "North Block A",
            status: "Sales open",
            handover: "Q2 2027",
            summary: "Entry block with compact layouts designed for buyers seeking faster turnover.",
            totalApartments: 40,
            apartmentsLeft: 20,
            priceFrom: "118000",
            priceTo: "198000",
            areaRange: "42-86 sqm",
            roomTypes: ["1 room", "2 room"],
            coverImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
            gallery: ["https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80"],
            apartmentTypes: [
              {
                id: "north-type-a",
                slug: "north-one-bedroom",
                title: "North One Bedroom",
                summary: "A compact plan optimized for premium first-home or investor buyers.",
                rooms: 1,
                sizeSqm: "42 sqm",
                price: "118000",
                priceLabel: "From",
                remainingUnits: 12,
                floorRange: "Floors 2-10",
                orientation: "Street-facing",
                coverImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
                layoutImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getDevelopers() {
  return developers;
}

export function getDeveloperBySlug(companySlug: string) {
  return developers.find((developer) => developer.slug === companySlug) ?? null;
}

export function getFeaturedDeveloper() {
  return getDeveloperBySlug("dream-house");
}

export function getFeaturedProject() {
  return getProjectBySlug("riverside-signature");
}

export function getProjects() {
  return developers.flatMap((developer) => developer.projects);
}

export function getProjectBySlug(projectSlug: string): DeveloperProjectLookup | null {
  for (const company of developers) {
    const project = company.projects.find((entry) => entry.slug === projectSlug);
    if (project) {
      return { company, project };
    }
  }

  return null;
}

export function getBuildingBySlug(projectSlug: string, buildingSlug: string): ProjectBuildingLookup | null {
  const projectLookup = getProjectBySlug(projectSlug);
  if (!projectLookup) {
    return null;
  }

  const building = projectLookup.project.buildings.find((entry) => entry.slug === buildingSlug);
  if (!building) {
    return null;
  }

  return {
    ...projectLookup,
    building,
  };
}

export function getCompanyMapPins(company: DeveloperCompany) {
  return company.projects.flatMap((project) => project.mapPins);
}

export function getProjectApartmentCount(project: DeveloperProject) {
  return project.buildings.reduce((total, building) => total + building.totalApartments, 0);
}

export function getProjectApartmentsLeft(project: DeveloperProject) {
  if (typeof project.apartmentsLeftCount === "number") {
    return project.apartmentsLeftCount;
  }
  return project.buildings.reduce((total, building) => total + building.apartmentsLeft, 0);
}

export function getCompanyApartmentsLeft(company: DeveloperCompany) {
  if (typeof company.apartmentInventoryCount === "number") {
    return company.apartmentInventoryCount;
  }
  return company.projects.reduce((total, project) => total + getProjectApartmentsLeft(project), 0);
}

export function getCompanyProjectCount(company: DeveloperCompany) {
  if (typeof company.projectCount === "number") {
    return company.projectCount;
  }
  return company.projects.length;
}
