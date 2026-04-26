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
  'nightlife-ale-blossoms':   { lat: 53.3975, lng: -2.1578 },
  'nightlife-armoury-micropub': { lat: 53.4049, lng: -2.1718 },

  'hidden-mural-sarah-harding': { lat: 53.4096, lng: -2.1548 },

  'fitness-etherow-lake-run': { lat: 53.4487, lng: -2.0681 },

  // Music heritage quests
  'culture-stockport-college-music': { lat: 53.4068, lng: -2.1516 },
  'history-strawberry-studios':      { lat: 53.4071, lng: -2.1573 },
  'history-10cc-stockport':          { lat: 53.4097, lng: -2.1559 },

  // Outdoors — extra
  'outdoors-mersey-valley':          { lat: 53.4093, lng: -2.1593 },
  'outdoors-goyt-valley':            { lat: 53.3185, lng: -1.9925 },
  'outdoors-fpw-north':              { lat: 53.4486, lng: -2.1648 },
  'outdoors-fpw-middle':             { lat: 53.4090, lng: -2.1551 },
  'outdoors-fpw-south':              { lat: 53.3837, lng: -2.1148 },

  // Food — extra (town centre eateries + Produce Hall vendors)
  'food-stockport-pie':              { lat: 53.4097, lng: -2.1556 },
  'food-street-food-saturday':       { lat: 53.4097, lng: -2.1554 },
  'food-ph-black-market':            { lat: 53.4097, lng: -2.1552 },
  'food-ph-chaat-cart':              { lat: 53.4097, lng: -2.1552 },
  'food-ph-angkor-soul':             { lat: 53.4097, lng: -2.1552 },
  'food-ph-thief-street':            { lat: 53.4097, lng: -2.1552 },
  'food-ph-mamma-g':                 { lat: 53.4097, lng: -2.1552 },
  'food-laco':                       { lat: 53.4096, lng: -2.1560 },
  'food-bruk':                       { lat: 53.4096, lng: -2.1561 },
  'food-cantaloupe':                 { lat: 53.4097, lng: -2.1556 },
  'food-wtlgi':                      { lat: 53.4099, lng: -2.1554 },
  'food-easy-fish-co':               { lat: 53.4267, lng: -2.1882 },
  'food-roost-heaton-moor':          { lat: 53.4271, lng: -2.1880 },

  // Culture — Frog Trail (one frog per Stockport ward) + festival
  'culture-jazz-festival':           { lat: 53.4093, lng: -2.1551 },
  'culture-frog-tudor':              { lat: 53.3737, lng: -2.1633 },
  'culture-frog-view':               { lat: 53.3582, lng: -2.1644 },
  'culture-frog-baker':              { lat: 53.4366, lng: -2.0987 },
  'culture-frog-theatre':            { lat: 53.4196, lng: -2.0863 },
  'culture-frog-glow':               { lat: 53.4254, lng: -2.1349 },
  'culture-frog-blossom':            { lat: 53.3975, lng: -2.2100 },
  'culture-frog-forest':             { lat: 53.3950, lng: -2.2123 },
  'culture-frog-resilience':         { lat: 53.4014, lng: -2.1565 },
  'culture-frog-sunshine':           { lat: 53.4045, lng: -2.1700 },
  'culture-frog-hazel':              { lat: 53.3839, lng: -2.1067 },
  'culture-frog-mercury':            { lat: 53.3661, lng: -2.2330 },
  'culture-frog-river':              { lat: 53.4242, lng: -2.2030 },
  'culture-frog-park':               { lat: 53.4108, lng: -2.1423 },
  'culture-frog-canal':              { lat: 53.3975, lng: -2.0651 },
  'culture-frog-industry':           { lat: 53.4047, lng: -2.1281 },
  'culture-frog-farm':               { lat: 53.4413, lng: -2.1520 },
  'culture-frog-florence':           { lat: 53.3850, lng: -2.1142 },

  // History — extra (incl. blue plaques)
  'history-churchgate-walk':         { lat: 53.4087, lng: -2.1545 },
  'history-reddish-vale-viaduct':    { lat: 53.4413, lng: -2.1520 },
  'history-plaque-fred-perry':       { lat: 53.4076, lng: -2.1610 },
  'history-plaque-gabrielle-ray':    { lat: 53.3985, lng: -2.1608 },
  'history-plaque-samuel-oldknow':   { lat: 53.4060, lng: -2.1518 },
  'history-plaque-john-bradshaw':    { lat: 53.3953, lng: -2.1499 },
  'history-plaque-alan-turing':      { lat: 53.3990, lng: -2.1620 },
  'history-plaque-channel-island':   { lat: 53.4090, lng: -2.1560 },
  'history-plaque-stockport-county': { lat: 53.4012, lng: -2.1684 },
  'history-plaque-air-raid':         { lat: 53.4100, lng: -2.1583 },

  // Family — extra
  'family-bramall-day-out':          { lat: 53.3822, lng: -2.1701 },
  'family-reddish-vale-farm':        { lat: 53.4413, lng: -2.1520 },
  'family-vernon-park-picnic':       { lat: 53.4127, lng: -2.1335 },
  'family-market-saturday':          { lat: 53.4097, lng: -2.1552 },
  'family-woodbank-nature-trail':    { lat: 53.4108, lng: -2.1423 },

  // Hidden — extra (incl. mural trail stops)
  'hidden-great-stone':              { lat: 53.4392, lng: -2.2170 },
  'hidden-mural-hendrix':            { lat: 53.4096, lng: -2.1559 },
  'hidden-mural-garden-tiger':       { lat: 53.4076, lng: -2.1538 },
  'hidden-mural-life':               { lat: 53.4096, lng: -2.1560 },
  'hidden-mural-water':              { lat: 53.4096, lng: -2.1559 },
  'hidden-mural-shop-local':         { lat: 53.4080, lng: -2.1543 },

  // Nightlife — extra (incl. Robinsons Ale Trail stops)
  'nightlife-craft-beer-crawl':      { lat: 53.4079, lng: -2.1537 },
  'nightlife-heaton-moor-late':      { lat: 53.4267, lng: -2.1883 },
  'nightlife-ale-arden-arms':        { lat: 53.4115, lng: -2.1568 },
  'nightlife-ale-armoury':           { lat: 53.4049, lng: -2.1718 },
  'nightlife-ale-bakers-vaults':     { lat: 53.4097, lng: -2.1552 },
  'nightlife-ale-queens-head':       { lat: 53.4097, lng: -2.1560 },
  'nightlife-ale-red-bull':          { lat: 53.4068, lng: -2.1528 },
  'nightlife-ale-visitor-centre':    { lat: 53.4065, lng: -2.1525 },
  'nightlife-ale-swan':              { lat: 53.4093, lng: -2.1545 },

  // Fitness — extra
  'fitness-vernon-park-parkrun':     { lat: 53.4127, lng: -2.1335 },
  'fitness-cycle-goyt-valley':       { lat: 53.3300, lng: -2.0094 },
  'fitness-goyt-trail-challenge':    { lat: 53.3975, lng: -2.0651 },

  // Food — vegan / bakery / dessert additions
  'food-hillgate-cakery':            { lat: 53.4068, lng: -2.1530 },
  'food-otto-vegan-empire':          { lat: 53.3573, lng: -2.1631 },
  'food-the-allotment-vegan':        { lat: 53.4097, lng: -2.1556 },
  'food-yellowhammer':               { lat: 53.4275, lng: -2.1882 },
  'food-bake-house-stockport':       { lat: 53.4090, lng: -2.1555 },
  'food-thatchers-bakery':           { lat: 53.4090, lng: -2.1545 },
  'food-cafe-sanjuan':               { lat: 53.4090, lng: -2.1555 },
  'food-grand-caffe':                { lat: 53.3784, lng: -2.1239 },
  'food-sticky-fingers':             { lat: 53.4095, lng: -2.1550 },
  'food-silver-birch-cafe':          { lat: 53.4090, lng: -2.1555 },
  'food-ginkgo-cafe':                { lat: 53.4090, lng: -2.1555 },
  'food-wow-shakes-cakes':           { lat: 53.4090, lng: -2.1555 },
  'food-icestone-gelato':            { lat: 53.4090, lng: -2.1555 },
  'food-amai-desserts':              { lat: 53.4090, lng: -2.1555 },
  'food-dessert-outlet':             { lat: 53.3779, lng: -2.1908 },
  'food-convene':                    { lat: 53.4090, lng: -2.1555 },
};
