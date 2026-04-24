// Approximate coordinates for a subset of quests, keyed by Quest.id.
// Quests not in this map simply don't appear on the in-app map.
// Coordinates are hand-picked landmarks near each venue; they are
// not a substitute for navigation — the "Open in Maps" button on the
// detail sheet remains the canonical route-planning link.
export const QUEST_COORDS: Record<string, { lat: number; lng: number }> = {
  'outdoors-viaduct-viewpoint': { lat: 53.4093, lng: -2.1590 },
  'outdoors-woodbank-park': { lat: 53.4108, lng: -2.1423 },
  'outdoors-vernon-park': { lat: 53.4127, lng: -2.1335 },
  'outdoors-reddish-vale': { lat: 53.4413, lng: -2.1520 },
  'outdoors-etherow-long': { lat: 53.4487, lng: -2.0681 },
  'outdoors-marple-aqueduct': { lat: 53.3959, lng: -2.0633 },
  'outdoors-marple-locks': { lat: 53.3959, lng: -2.0527 },
  'outdoors-roman-lakes': { lat: 53.3824, lng: -2.0350 },
  'outdoors-brabyns-park': { lat: 53.3956, lng: -2.0546 },
  'outdoors-heaton-moor-park': { lat: 53.4276, lng: -2.1887 },
  'outdoors-chadkirk': { lat: 53.4123, lng: -2.0907 },
  'outdoors-torkington-park': { lat: 53.3841, lng: -2.1068 },

  'food-bramall-cream-tea': { lat: 53.3822, lng: -2.1701 },
  'food-produce-hall': { lat: 53.4098, lng: -2.1552 },
  'food-robinsons-brewery': { lat: 53.4065, lng: -2.1525 },
  'food-heaton-moor-dining': { lat: 53.4267, lng: -2.1883 },
  'food-bramhall-village-cafe': { lat: 53.3572, lng: -2.1632 },

  'culture-plaza-cinema': { lat: 53.4092, lng: -2.1570 },
  'culture-hat-works': { lat: 53.4080, lng: -2.1625 },
  'culture-art-gallery': { lat: 53.4097, lng: -2.1558 },
  'culture-plaza-theatre': { lat: 53.4092, lng: -2.1570 },
  'culture-library-local-history': { lat: 53.4069, lng: -2.1520 },

  'history-air-raid-shelters': { lat: 53.4100, lng: -2.1583 },
  'history-bramall-hall': { lat: 53.3822, lng: -2.1701 },
  'history-staircase-house': { lat: 53.4097, lng: -2.1562 },
  'history-underbanks': { lat: 53.4096, lng: -2.1557 },
  'history-st-marys-church': { lat: 53.4093, lng: -2.1551 },
  'history-castle-hill': { lat: 53.4098, lng: -2.1560 },

  'family-pyramid-swim': { lat: 53.4322, lng: -2.1553 },
  'family-light-cinema-redrock': { lat: 53.4104, lng: -2.1515 },

  'hidden-fred-perry-statue': { lat: 53.4098, lng: -2.1546 },
  'hidden-underbanks-murals': { lat: 53.4095, lng: -2.1560 },
  'hidden-viaduct-mersey-square': { lat: 53.4093, lng: -2.1590 },
  'hidden-boars-head-sign': { lat: 53.4095, lng: -2.1558 },
  'hidden-peel-moat': { lat: 53.4274, lng: -2.1897 },

  'nightlife-petersgate-tap': { lat: 53.4079, lng: -2.1537 },

  'fitness-etherow-lake-run': { lat: 53.4487, lng: -2.0681 },
};
