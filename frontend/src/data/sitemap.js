// Site map: six pages — Home, five chapter pages, Contact.
// Each chapter is one page; its sections are stacked on it, in this order.
// #/story jumps to the page, #/story/founders to a section on it.
// Section components are wired to these ids in components/Pages.jsx.

const M = '/media';

export const CHAPTERS = [
  {
    id: 'story',
    no: '01',
    title: 'Our Story',
    short: 'Story',
    kicker: 'Problem, answer & founders',
    line: 'Plastic outlives the food it protects by five centuries — while a third of all food spoils before it is eaten. Why ELVARA exists, and the two people who started it.',
    img: `${M}/hub/why.jpg`,
    atmo: 'night',
    subs: [
      { id: 'crisis', img: `${M}/hub/why.jpg`, title: 'The crisis', line: 'Five numbers that define the packaging gap.', points: ['500-year wrappers', '11 M t into oceans', '33% of food wasted'] },
      { id: 'answer', img: `${M}/img/premium-container.jpg`, title: 'The answer', line: 'ELVARA, revealed — and how it compares.', points: ['Home compostable', 'Freshness built in', 'Plastic vs paper vs PLA'] },
      { id: 'vision', img: `${M}/img/basic-envelope.jpg`, title: 'Vision & mission', line: 'Where we are going, and the numbers at a glance.', points: ['Vision', 'Mission', 'At a glance'] },
      { id: 'origin', img: `${M}/cofounder.jpg`, title: 'Our story', line: 'From waste-stream question to company.', points: ['Origin', 'Milestones', 'Team plan'] },
      { id: 'founders', img: `${M}/founder.jpg`, title: 'Founders', line: 'The two co-founders behind ELVARA.', points: ['Aafreena Yasmine MK', 'Rithan A R', 'LinkedIn'] },
    ],
  },
  {
    id: 'product',
    no: '02',
    title: 'Product & Technology',
    short: 'Product',
    kicker: 'The material · 12 products',
    line: 'Agricultural waste, re-engineered into a three-layer living film — and made into twelve products you can pick up, turn and inspect.',
    img: `${M}/img/premium-container.jpg`,
    video: `${M}/vid/niche-0.mp4`,
    atmo: 'olive',
    subs: [
      { id: 'material', img: `${M}/img/basic-wrap.jpg`, title: 'Living film', line: 'Three layers, a colour-shift indicator and a closed loop back to soil.', points: ['Exploded film', 'Freshness indicator', 'Specs & process'] },
      { id: 'technology', img: `${M}/img/premium-pharma.jpg`, title: 'Technology & IP', line: 'Six properties, technology readiness, the prototype and our patent.', points: ['Six properties', 'TRL', 'Prototype results'] },
      { id: 'series', img: `${M}/img/premium-container.jpg`, title: 'Three series', line: 'Twelve products to pick up, turn and inspect.', points: ['Basic', 'Niche', 'Limited Edition'] },
      { id: 'applications', img: `${M}/img/niche-paperbag.jpg`, title: 'Applications', line: 'Wherever packaging meets food, health or a brand.', points: ['Food & produce', 'Pharma', 'Gifting'] },
    ],
  },
  {
    id: 'business',
    no: '03',
    title: 'Business',
    short: 'Business',
    kicker: 'Model, market, impact & operations',
    line: 'One material, three revenue engines — entering a market pushed by plastic bans and EPR mandates, built on a plant designed to scale.',
    img: `${M}/img/niche-giftbox.jpg`,
    video: `${M}/vid/premium-1.mp4`,
    atmo: 'night',
    subs: [
      { id: 'model', img: `${M}/img/niche-giftbox.jpg`, title: 'Business model', line: 'Revenue streams, cost curve and channel mix.', points: ['3 revenue engines', 'Cost vs plastic', 'Distribution'] },
      { id: 'pricing', img: `${M}/img/niche-tags.jpg`, title: 'Pricing & go-to-market', line: 'Per-kg B2B pricing, segments and the business canvas.', points: ['B2B pricing', 'Segments', 'Business canvas'] },
      { id: 'market', img: `${M}/img/premium-wrap.jpg`, title: 'Market & roadmap', line: 'A regulatory tailwind meets an unmet need.', points: ['19% CAGR', 'TAM · SAM · SOM', 'Roadmap'] },
      { id: 'strategy', img: `${M}/img/niche-giftbag.jpg`, title: 'Strategic analysis', line: 'SWOT, PESTLE, Porter and the competitive landscape.', points: ['SWOT', 'PESTLE', "Porter's five forces"] },
      { id: 'sdg', img: `${M}/img/basic-carrybag.jpg`, title: 'UN SDG impact', line: 'Aligned with five Sustainable Development Goals.', points: ['5 SDGs', 'Stakeholder value', 'Agro-waste valorised'] },
      { id: 'operations', img: `${M}/img/basic-pouch.jpg`, title: 'Operations', line: 'Plant layout, quality gates and sourcing.', points: ['Plant zones', 'Quality gates', 'Sourcing'] },
    ],
  },
  {
    id: 'invest',
    no: '04',
    title: 'Investment',
    short: 'Investment',
    kicker: 'The ask & the numbers',
    line: 'The round, five-year forecast, full financial statements, cap table — and the risks we have already planned for.',
    img: `${M}/img/premium-freshpack.jpg`,
    video: `${M}/vid/premium-0.mp4`,
    atmo: 'emerald',
    subs: [
      { id: 'ask', img: `${M}/img/premium-freshpack.jpg`, title: 'The ask', line: 'The round, use of funds, forecast and returns.', points: ['₹1.5 Cr seed', 'Revenue forecast', 'Funding path'] },
      { id: 'financials', img: `${M}/img/premium-wrap.jpg`, title: 'Financials & cap table', line: 'P&L, balance sheet, sensitivity, ratios and ownership.', points: ['P&L', 'Balance sheet', 'Cap table'] },
      { id: 'risks', img: `${M}/img/premium-pharma.jpg`, title: 'Risks & exits', line: 'Risks anticipated, and pathways to liquidity.', points: ['Risk register', 'Mitigation', 'Exit routes'] },
    ],
  },
];

export const chapterById = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));

// The enquiry page: the sixth page, after Investment.
export const CONTACT = {
  id: 'contact',
  path: '/contact',
  no: '05',
  title: 'Contact',
  short: 'Contact',
  heading: 'Business enquiry',
  kicker: 'Orders, partnerships & investment',
  line: 'Orders, partnerships and investment — start a conversation with the founders.',
  img: `${M}/img/basic-envelope.jpg`,
};

// The six pages in reading order, for the dock and the menu.
export const PAGES = [
  { id: 'home', path: '/', no: '00', title: 'Home', short: 'Home', kicker: 'The film & investor snapshot', line: 'The problem film, the investment case at a glance, and a door to every page.', img: `${M}/hub/why.jpg` },
  ...CHAPTERS.map((c) => ({ ...c, path: `/${c.id}` })),
  CONTACT,
];

// Numbers that scroll past on the home page ticker.
export const TICKER = [
  ['500 yrs', 'plastic in landfill'],
  ['90 days', 'ELVARA back to soil'],
  ['38–45 MPa', 'tensile strength'],
  ['3 layers', 'one living film'],
  ['12', 'products · 3 series'],
  ['5', 'UN SDGs'],
  ['19%', 'segment CAGR'],
  ['1', 'patent filed'],
];
