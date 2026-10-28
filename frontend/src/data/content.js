// All copy and media wiring for the ELVARA showroom.
// Product copy is derived from the ELVARA pitch deck and MSME 5.0 prototype notes.

const M = '/media';

export const BRAND = {
  name: 'ELVARA',
  tagline: 'Packaging that protects food — and returns to the earth.',
  motto: 'A cleaner tomorrow in your hands',
  promise: 'Packaging that grows a greener tomorrow',
  email: 'aafreenayasmine30@gmail.com',
  location: 'Chennai, Tamil Nadu, India',
  logo: `${M}/logo.jpg`,
  heroVideo: `${M}/vid/problem.mp4`,
};

// Colour authority: the supplied palette, plus tones sampled from the silk
// reference (champagne highlight) and the logo's indicator dots.
export const PALETTE = {
  emeraldDeep: '#02110c',
  olive: '#1a422f',
  cream: '#f3ebd6',
  champagne: '#b9a27a',
  stone: '#d8cfba',
  indicatorFresh: '#7a4a93',
  indicatorSpoilt: '#6f8f4e',
};

// Atmospheres the WebGL silk, background and type interpolate between.
export const ATMOS = {
  night: { bg: '#020a07', fg: '#f3ebd6', muted: '#8f9a8f', deep: '#010604', mid: '#0d2a1d', hi: '#8d7a58', hiAmt: 0.55, grain: 0.07 },
  problem: { bg: '#030504', fg: '#f3ebd6', muted: '#7f877f', deep: '#000000', mid: '#081a12', hi: '#4c4434', hiAmt: 0.25, grain: 0.09 },
  emerald: { bg: '#02110c', fg: '#f3ebd6', muted: '#9aa898', deep: '#02110c', mid: '#1a422f', hi: '#b9a27a', hiAmt: 0.9, grain: 0.06 },
  olive: { bg: '#0e2b1f', fg: '#f3ebd6', muted: '#a7b4a2', deep: '#06170f', mid: '#173d2b', hi: '#bfa97f', hiAmt: 0.45, grain: 0.06 },
  cream: { bg: '#f3ebd6', fg: '#02110c', muted: '#5d6a5f', deep: '#e6dbc0', mid: '#f3ebd6', hi: '#fffaf0', hiAmt: 0.6, grain: 0.05 },
  basic: { bg: '#efe8d9', fg: '#02110c', muted: '#5f6b60', deep: '#e2d8c2', mid: '#f2ecdf', hi: '#ffffff', hiAmt: 0.55, grain: 0.05 },
  niche: { bg: '#ece0cc', fg: '#2a1d12', muted: '#76634f', deep: '#d9c5a6', mid: '#efe4d2', hi: '#fff7ea', hiAmt: 0.55, grain: 0.05 },
  limited: { bg: '#f3e4dd', fg: '#2c1814', muted: '#7d5f58', deep: '#e3c8bd', mid: '#f6eae4', hi: '#fff6f2', hiAmt: 0.55, grain: 0.05 },
  premium: { bg: '#e9e1cc', fg: '#02110c', muted: '#556455', deep: '#cfc3a4', mid: '#ece4d0', hi: '#fff8e6', hiAmt: 0.7, grain: 0.05 },
};

export const PROBLEM_STATS = [
  { value: 500, suffix: 'yrs', topic: 'Time', viz: 'time', label: 'for a conventional plastic wrapper to break down in landfill — long after the food inside is gone.' },
  { value: 11, suffix: 'M t', topic: 'Oceans', viz: 'ocean', label: 'of plastic enter our oceans every year. Single-use packaging is the largest contributor.', source: 'UNEP' },
  { value: 600, suffix: 'M', topic: 'Health', viz: 'people', label: 'people fall ill each year from contaminated food — often from poor packaging and no way to detect spoilage.', source: 'WHO' },
  { value: 33, suffix: '%', topic: 'Waste', viz: 'ring', label: 'of all food produced is lost or wasted before it is eaten.', source: 'FAO' },
  { value: 9, suffix: '%', topic: 'Recycling', viz: 'bar', label: 'of all plastic ever produced has been recycled. The rest is still with us.' },
];

export const COMPARISON = {
  columns: ['Plastic', 'Paper', 'PLA / Starch', 'ELVARA'],
  rows: [
    { k: 'Fully biodegradable', v: ['No', 'Partial', 'Industrial only', 'Home compostable'] },
    { k: 'Moisture & heat resistant', v: ['Yes', 'No', 'Partial', 'Yes'] },
    { k: 'Food-safe & heat sealable', v: ['Yes', 'Limited', 'Yes', 'Yes'] },
    { k: 'Freshness indication', v: ['No', 'No', 'No', 'Built in'] },
    { k: 'Cost-competitive at scale', v: ['Yes', 'Yes', 'No', 'Parity target'] },
  ],
};

export const LAYERS = [
  { name: 'Outer barrier layer', mat: 'Lignin-nanoparticle biopolymer', role: 'Moisture and mechanical protection' },
  { name: 'Core structural layer', mat: 'Agro-waste cellulose composite', role: 'Tensile strength and flexibility' },
  { name: 'Indicator layer', mat: 'Natural anthocyanin pigment', role: 'Visual freshness signal at the seal edge' },
];

export const SPECS = [
  { v: '25–80', u: 'µm', l: 'Film thickness, tuned per application' },
  { v: '38–45', u: 'MPa', l: 'Tensile strength — vs 28–32 for PLA' },
  { v: '90', u: 'days', l: 'Home-compostable degradation' },
  { v: '120–140', u: '°C', l: 'Heat-seal on standard FFS lines' },
  { v: '−22', u: '%', l: 'Water-vapour transmission vs uncoated cellulose' },
];

export const PROCESS = [
  { t: 'Agro-waste collection', d: 'Bark, fruit peel and mill residue gathered from regional processors — feedstock that would otherwise be burned or landfilled.' },
  { t: 'Lignin & cellulose extraction', d: 'Alkaline extraction and acid precipitation recover and purify the two natural biopolymers.' },
  { t: 'Nanoparticle formulation', d: 'Lignin is refined into nanoparticles that reinforce the barrier and strength of the film.' },
  { t: 'Film casting', d: 'Cast or extruded into 25–80 µm film on standard lines — no bespoke machinery.' },
  { t: 'Indicator lamination', d: 'A natural anthocyanin layer is bonded at the seal edge to read freshness.' },
  { t: 'QC & certification', d: 'Tensile, vapour-barrier, seal-integrity and food-contact checks on every batch.' },
  { t: 'Back to soil', d: 'Home compostable in about 90 days — nutrients return to grow the next harvest.' },
];

// Interaction keyframes from the concept doc: 0 / 15 / 35 / 65 / 85 / 100 % of scroll.
export const STAGES = [0, 0.15, 0.35, 0.65, 0.85, 1];
export const STAGE_LABELS = ['Complete form', 'Approach', 'Interaction', 'Reveal', 'Macro', 'Material'];


// Series and products follow the ELVARA catalogue: numbers 1–12, in order.
export const CATEGORIES = [
  {
    id: 'basic',
    index: '01',
    name: 'Basic',
    title: 'Everyday essentials',
    taglines: ['Everyday use', 'Simple', 'Functional', 'Sustainable'],
    line: 'The packaging people touch most — re-made from agricultural waste, without asking any production line to change.',
    atmo: 'basic',
    products: [
      {
        id: 'mailer', no: 1, name: 'Seed-Embedded Mailer', kind: 'Mailer / Envelope', img: `${M}/img/basic-envelope.jpg`, video: `${M}/vid/basic-2.mp4`,
        tags: ['Biodegradable', 'Plant after use', 'Grows into plants'],
        statement: 'An e-commerce mailer that arrives protected — then goes into the soil and grows.',
        layers: [
          { t: 'Material', d: ['Seed-embedded lignin–cellulose film', 'Matte, paper-like hand feel'] },
          { t: 'Construction', d: ['Fold-over flap with heat seal', 'Tear-resistant body'] },
          { t: 'Function', d: ['Protects garments, books and goods in transit', 'Moisture resistant through the delivery chain'] },
          { t: 'Sustainability', d: ['Plant it after use — the embedded seeds grow', 'Home compostable in about 90 days'] },
          { t: 'Use case', d: ['E-commerce, apparel, D2C brands, documents'] },
        ],
      },
      {
        id: 'cling', no: 2, name: 'Freshness Indicator Food Wrap', kind: 'Food Wrap / Film', img: `${M}/img/basic-wrap.jpg`, video: `${M}/vid/basic-3.mp4`, indicator: true,
        tags: ['Keeps food fresh', 'Breathable film', 'Safe for food'],
        statement: 'The kitchen wrap that keeps food fresh — and shows you when it no longer is.',
        layers: [
          { t: 'Material', d: ['Thin-gauge biofilm, from 25 µm', 'Natural freshness-indicator pigment'] },
          { t: 'Construction', d: ['Supplied on a compostable paper core', 'Unrolls and clings to bowls and food'] },
          { t: 'Innovation', d: ['Breathable film keeps cut produce fresh', 'Colour shift signals spoilage — no device needed'] },
          { t: 'Sustainability', d: ['Food-contact safe, plastic-free', 'Home compostable in about 90 days'] },
          { t: 'Use case', d: ['Households, restaurants, cloud kitchens, catering'] },
        ],
      },
      {
        id: 'carrybag', no: 3, name: 'Seed-Embedded Produce Bag', kind: 'Produce Bag', img: `${M}/img/basic-carrybag.jpg`, video: `${M}/vid/basic-1.mp4`,
        tags: ['Keeps produce fresh', 'Strong & durable', 'Plant after use'],
        statement: 'The everyday produce bag, rebuilt to carry more — and return to the soil.',
        layers: [
          { t: 'Material', d: ['Translucent seed-embedded biofilm', 'High-strength lignin reinforcement'] },
          { t: 'Construction', d: ['Vest-style handles, welded seams', 'Folds flat for dispensing'] },
          { t: 'Function', d: ['Strong and durable for heavy produce', 'Breathable enough to keep greens fresh'] },
          { t: 'Sustainability', d: ['Replaces <120 µm single-use plastic bags', 'Plant it after use'] },
          { t: 'Use case', d: ['Grocery, fresh markets, organic stores'] },
        ],
      },
      {
        id: 'pouch', no: 4, name: 'Compostable Tea/Snack Pouch', kind: 'Stand-Up Pouch', img: `${M}/img/basic-pouch.jpg`, video: `${M}/vid/basic-0.mp4`,
        tags: ['Compostable', 'Suitable for dry food', 'Plant-based'],
        statement: 'A reclosable stand-up pouch that keeps tea and snacks crisp — and leaves nothing behind.',
        layers: [
          { t: 'Material', d: ['Plant-based lignin–cellulose biofilm, 60–80 µm', 'Clear cellulose window, no plastic laminate'] },
          { t: 'Construction', d: ['Gusseted base stands on the shelf', 'Press-to-close zip seal'] },
          { t: 'Function', d: ['Low moisture transmission for dry food', 'Heat-seals at 120–140 °C on existing lines'] },
          { t: 'Sustainability', d: ['Fully compostable', 'Made from valorised agricultural waste'] },
          { t: 'Use case', d: ['Tea, coffee, nuts, dry fruit, grains, snacks'] },
        ],
      },
    ],
  },
  {
    id: 'niche',
    index: '02',
    name: 'Niche',
    title: 'Targeted solutions',
    taglines: ['Targeted solutions', 'Value-added', 'Functional', 'Differentiated'],
    line: 'Value-added packaging engineered for specific foods and products — freshness, hygiene and barrier exactly where they matter.',
    atmo: 'niche',
    products: [
      {
        id: 'freshpack', no: 5, name: 'Meat/Fish Vacuum Pack', kind: 'Vacuum Pack / Vacuum Pouch', img: `${M}/img/premium-freshpack.jpg`, video: `${M}/vid/niche-1.mp4`, indicator: true,
        tags: ['Extends freshness', 'Vacuum seal', 'Food safe'],
        statement: 'A vacuum pack that extends freshness and speaks: purple while fresh, shifting to green as spoilage begins.',
        layers: [
          { t: 'Material', d: ['Full three-layer ELVARA film', 'Anthocyanin indicator at the seal edge'] },
          { t: 'Construction', d: ['Vacuum-sealed clear window', 'Printed seed-embedded header panel'] },
          { t: 'Innovation', d: ['Responds to real spoilage volatiles — not a timer', 'No device needed: the colour is the reading'] },
          { t: 'Sustainability', d: ['Less premature discard, less food waste', 'Home compostable after use'] },
          { t: 'Use case', d: ['Meat, fish and seafood, dairy, cold chain'] },
        ],
      },
      {
        id: 'pharma', no: 6, name: 'Pharma/Nutraceutical Pack', kind: 'Sachet / Pouch', img: `${M}/img/premium-pharma.jpg`, video: `${M}/vid/niche-3.mp4`,
        tags: ['Moisture protection', 'Safe & hygienic', 'Plant-based'],
        statement: 'Hygienic, moisture-tight packs for capsules, supplements and wellness — without plastic laminates.',
        layers: [
          { t: 'Material', d: ['High-barrier, plant-based three-layer film', 'Clear inspection window'] },
          { t: 'Construction', d: ['Resealable zip pouch and single-dose sachet', 'Hermetic heat seal'] },
          { t: 'Function', d: ['Moisture protection for capsules and powders', 'Safe, hygienic, batch-traceable printing'] },
          { t: 'Sustainability', d: ['Replaces multilayer plastic laminates', 'Home compostable in about 90 days'] },
          { t: 'Use case', d: ['Nutraceuticals, Ayurveda, pharma secondary packs, cosmetics'] },
        ],
      },
      {
        id: 'container', no: 7, name: 'Ready-to-Eat Food Box', kind: 'Food Box / Meal Tray', img: `${M}/img/premium-container.jpg`, video: `${M}/vid/niche-0.mp4`,
        tags: ['Microwave safe (optional)', 'Sturdy & leak-resistant', 'Compostable'],
        statement: 'A sturdy, leak-resistant meal tray with a clear lid — from kitchen to table to compost.',
        layers: [
          { t: 'Material', d: ['Moulded lignin–cellulose tray', 'Clear biofilm lid'] },
          { t: 'Construction', d: ['Snap-fit lid over a deep tray', 'Seed-embedded label panel'] },
          { t: 'Function', d: ['Sturdy and leak-resistant for hot and wet food', 'Microwave-safe option available'] },
          { t: 'Sustainability', d: ['Fully compostable', 'Made from valorised agricultural waste'] },
          { t: 'Use case', d: ['Ready-to-eat meals, cloud kitchens, airline and rail catering'] },
        ],
      },
      {
        id: 'foodwrap', no: 8, name: 'Edible Coating + Packaging', kind: 'Wrap / Food Wrapper', img: `${M}/img/premium-wrap.jpg`, video: `${M}/vid/niche-2.mp4`,
        tags: ['Edible coating', 'Keeps food fresh', 'Natural ingredients'],
        statement: 'A grab-and-go wrapper with a natural edible coating that keeps food fresh to the last bite.',
        layers: [
          { t: 'Material', d: ['Soft-fold ELVARA film with a natural edible coating', 'Grease resistant'] },
          { t: 'Construction', d: ['Rolled and tucked, sealed at the end', 'Peel-back opening'] },
          { t: 'Function', d: ['Edible coating keeps food fresh', 'Made from natural ingredients'] },
          { t: 'Sustainability', d: ['Nothing left behind but compost', 'Home compostable in about 90 days'] },
          { t: 'Use case', d: ['Quick-service restaurants, cafés, bakeries, delis'] },
        ],
      },
    ],
  },
  {
    id: 'limited',
    index: '03',
    name: 'Limited Edition',
    title: 'For special occasions',
    taglines: ['Premium', 'Aesthetic', 'Special occasions', 'High-value market'],
    line: 'Artful, giftable and plantable — packaging made to be remembered, and then grown.',
    atmo: 'limited',
    products: [
      {
        id: 'giftbox', no: 9, name: 'Festival Seed Gift Box', kind: 'Gift Box', img: `${M}/img/niche-giftbox.jpg`, video: `${M}/vid/premium-3.mp4`,
        tags: ['Premium look', 'Plant after use', 'Custom designs'],
        statement: 'A festival unboxing that ends in the garden, not the bin.',
        layers: [
          { t: 'Material', d: ['Rigid seed-embedded fibre board', 'Natural jute twine and seeded tag'] },
          { t: 'Construction', d: ['Lift-off lid over a fitted tray', 'Botanical print on every face'] },
          { t: 'Function', d: ['A premium look for festive gifting', 'Custom designs for every occasion'] },
          { t: 'Sustainability', d: ['Box, tag and twine — plant after use', 'Made from valorised agricultural waste'] },
          { t: 'Use case', d: ['Diwali, Pongal and festive hampers, corporate gifting, jewellery'] },
        ],
      },
      {
        id: 'giftbag', no: 10, name: 'Wedding/Favour Packaging', kind: 'Favour Bag / Gift Bag', img: `${M}/img/niche-giftbag.jpg`, video: `${M}/vid/premium-1.mp4`,
        tags: ['Elegant & stylish', 'Plantable bag', 'Personalised options'],
        statement: 'Soft-gathered, hand-tied favour bags your guests take home — and plant.',
        layers: [
          { t: 'Material', d: ['Seed-embedded handmade-texture sheet', 'Jute rope handles'] },
          { t: 'Construction', d: ['Gathered top tied with twine', 'Gusseted body with a personalised tag'] },
          { t: 'Function', d: ['Elegant, stylish return-gift presentation', 'Personalised names, dates and motifs'] },
          { t: 'Sustainability', d: ['A plantable bag — nothing goes to waste', 'Home compostable in about 90 days'] },
          { t: 'Use case', d: ['Weddings, receptions, events, boutique gifting'] },
        ],
      },
      {
        id: 'tags', no: 11, name: 'Plantable Labels/Stickers', kind: 'Plantable Label / Sticker', img: `${M}/img/niche-tags.jpg`, video: `${M}/vid/premium-0.mp4`,
        tags: ['Product labels', 'Plantable', 'Custom shapes & sizes'],
        statement: 'The smallest surface of a brand, made from the same living, plantable material.',
        layers: [
          { t: 'Material', d: ['Seed-embedded fibre card', 'Visible natural inclusions'] },
          { t: 'Construction', d: ['Custom die-cut shapes and sizes', 'Swing-tag and peel-and-stick formats'] },
          { t: 'Function', d: ['Product labels, seals and swing tags', 'Sharp print of logos and marks'] },
          { t: 'Sustainability', d: ['Plantable — no plastic face-stock or liner', 'Home compostable in about 90 days'] },
          { t: 'Use case', d: ['Apparel, gifting, cosmetics, food labelling'] },
        ],
      },
      {
        id: 'paperbag', no: 12, name: 'Themed Collection', kind: 'Art Box / Printed Pouch', img: `${M}/img/niche-paperbag.jpg`, video: `${M}/vid/premium-2.mp4`,
        tags: ['Unique artwork', 'Plant after use', 'Limited edition'],
        statement: 'Collectible, artist-printed packaging in limited runs — a story on every surface.',
        layers: [
          { t: 'Material', d: ['Seed-embedded fibre board with a lignin binder', 'Full-wrap illustrated print'] },
          { t: 'Construction', d: ['Square block bottom stands upright', 'Fold-down top closure'] },
          { t: 'Function', d: ['Unique artwork for seasonal and themed drops', 'Holds bakery, coffee and dry goods'] },
          { t: 'Sustainability', d: ['Plant after use', 'Made from valorised agricultural waste'] },
          { t: 'Use case', d: ['Limited-edition launches, cafés, specialty food, boutique retail'] },
        ],
      },
    ],
  },
];

export const ALL_PRODUCTS = CATEGORIES.flatMap((c) => c.products.map((p) => ({ ...p, category: c })));

export const APPLICATIONS = [
  { name: 'Dairy', note: 'Spoilage-sensitive, high return volume', product: 'freshpack' },
  { name: 'Meat & Fish', note: 'High barrier with freshness signalling', product: 'freshpack' },
  { name: 'Fruits & Vegetables', note: 'Moisture control, plastic-ban compliant', product: 'carrybag' },
  { name: 'Bakery', note: 'Shelf life and shelf appeal', product: 'paperbag' },
  { name: 'Ready-to-Eat', note: 'Hot-fill trays and to-go wraps', product: 'container' },
  { name: 'Pharma & Nutra', note: 'Sustainable secondary packaging', product: 'pharma' },
  { name: 'Cosmetics', note: 'Labels, tags and premium boxes', product: 'tags' },
  { name: 'E-commerce', note: 'Compliant mailers and wraps at scale', product: 'mailer' },
  { name: 'Gifting & Retail', note: 'Unboxing that returns to the earth', product: 'giftbox' },
];

export const MARKET = [
  { k: 'TAM', v: '₹28,000 Cr', l: 'Indian food & FMCG flexible packaging spend' },
  { k: 'SAM', v: '₹3,200 Cr', l: 'Addressable by compostable, bio-based film under current mandates' },
  { k: 'SOM', v: '₹95 Cr', l: 'Year-5 target at ~1,900 tonnes a year' },
];

export const ROADMAP = [
  { y: '2026', t: 'Pilot line scale-up, FSSAI certification, first anchor customers' },
  { y: '2027', t: 'Fruit & vegetable and meat & fish segments' },
  { y: '2028', t: '3× capacity, national distributor network' },
  { y: '2029', t: 'Category leadership in India, licensing in Southeast Asia' },
  { y: '2030', t: 'International market entry' },
];

export const FOUNDERS = [
  {
    role: 'Co-Founder',
    name: 'Aafreena Yasmine MK',
    img: `${M}/founder.jpg`,
    linkedin: 'https://www.linkedin.com/in/aafreena-yasmine-mk',
    // Crop focus within the photo (object-position) for the portrait frame.
    focus: '50% 18%',
  },
  {
    role: 'Co-Founder',
    name: 'Rithan A R',
    img: `${M}/cofounder.jpg`,
    linkedin: 'https://www.linkedin.com/in/rithan-a-r',
    focus: '80% 12%',
    // Wider source shot: zoom toward the face so both portraits read at the same scale.
    zoom: 1.4,
    origin: '46% 24%',
  },
];

/* ───────── Pitch-deck content (rebranded to ELVARA) ───────── */

export const GLANCE = [
  { k: 'Founded', v: '2026 · Chennai, Tamil Nadu' },
  { k: 'Sector', v: 'Biotechnology & sustainable materials' },
  { k: 'Stage', v: 'Pre-seed → Seed' },
  { k: 'Team', v: '2 co-founders + 4 R&D and technical staff' },
  { k: 'Route to market', v: 'B2B direct + distributor network' },
  { k: 'Recognition', v: 'Startup TN Arambam Finalist · Green Tech Award' },
  { k: 'Intellectual property', v: '1 patent filed' },
];

export const VISION = 'A world where every package returns safely to the earth — where packaging protects food without outliving it by five hundred years.';

export const MISSION = [
  'Convert agricultural waste — fruit-peel cellulose and lignin by-products — into food-safe, high-performance biodegradable film.',
  'Give every package a voice: a built-in freshness indicator that reduces food waste at the point of decision.',
  'Make sustainable packaging cost-competitive with plastic within three years, at scale, for Indian manufacturers.',
];

export const STORY = [
  { k: 'The waste stream', t: 'Tamil Nadu discards over 4 lakh tonnes of fruit peel and agro-lignin residue every year — a cellulose- and lignin-rich resource with nowhere to go.' },
  { k: 'The lab bench', t: 'Early trials on cellulose-composite biofilms matched commercial PLA on tensile strength, while degrading in a home compost bin in under 90 days.' },
  { k: 'The second insight', t: 'A conversation with a dairy co-operative about spoilage-driven returns: packaging that only protects food is not enough — it should tell you when food has stopped being safe.' },
  { k: 'ELVARA', t: 'Founded to combine both innovations in one product: a compostable film with an integrated, natural freshness indicator.' },
];

export const INDIA_FACTS = [
  { v: '9.4M t', l: 'plastic packaging waste generated in India every year' },
  { v: '₹92,000 Cr', l: 'estimated value of food lost in India’s supply chain each year' },
  { v: '14%', l: 'post-harvest loss for fruits and vegetables in India' },
  { v: '31%', l: 'of food produced in India is lost before it is consumed — much of it in the supply chain' },
  { v: '<120 µm', l: 'single-use plastics now banned in India — brands need compliant alternatives' },
];

export const PROPERTIES = [
  { t: 'Biodegradable', d: 'Home compostable in about 90 days' },
  { t: 'Food-safe', d: 'FSSAI food-contact compliance per batch' },
  { t: 'Heat-sealable', d: '120–140 °C on standard FFS lines' },
  { t: 'Moisture resistant', d: '22% lower vapour transmission' },
  { t: 'High strength', d: '38–45 MPa tensile strength' },
  { t: 'Freshness indicator', d: 'Colour shift as spoilage begins' },
];

export const TECH = [
  { t: 'Lignin nanoparticle synthesis', f: 'Reinforces barrier and mechanical strength', trl: 5, s: 'Lab-validated' },
  { t: 'Cellulose composite extraction', f: 'Structural film base from low-cost agro-waste', trl: 5, s: 'Pilot-validated' },
  { t: 'Anthocyanin pH-indicator chemistry', f: 'Colorimetric freshness signalling', trl: 4, s: 'Lab-validated' },
  { t: 'Film casting & co-extrusion', f: 'Turns the formulation into finished roll film', trl: 8, s: 'Industry-standard' },
  { t: 'Heat-seal & lamination integration', f: 'Bonds the indicator layer at the pack seal edge', trl: 4, s: 'Prototype-validated' },
];

export const IP = [
  { t: 'Novel composition', d: 'First reported combination of lignin nanoparticles with fruit-peel cellulose for food packaging — tuned for both strength and compostability, usually a trade-off.' },
  { t: 'Integrated indicator', d: 'Co-laminated inside the film itself, not a separate label or sachet. It responds to real spoilage volatiles, not just time or temperature.' },
  { t: 'Process innovation', d: 'A waste-to-film pipeline that runs on standard extrusion lines with no bespoke capex — and cuts feedstock cost by 30–40% versus virgin biopolymers.' },
  { t: 'Patent strategy', d: '1 patent filed. The strategy covers three areas: the composite formulation, the indicator lamination method and the extraction process. Freedom-to-operate search complete; PCT (international) filing planned within 12 months.' },
];

export const SDGS = [
  { n: 2, t: 'Zero Hunger', d: 'Freshness indicator reduces premature food discard' },
  { n: 9, t: 'Industry, Innovation & Infrastructure', d: 'A new biomaterial manufacturing process' },
  { n: 12, t: 'Responsible Consumption', d: 'Compostable packaging displaces single-use plastic' },
  { n: 13, t: 'Climate Action', d: 'Lower embodied carbon than petrochemical plastics' },
  { n: 15, t: 'Life on Land', d: 'Agro-waste valorisation reduces open burning and landfill' },
];

export const STAKEHOLDERS = [
  { k: 'Brand owners', p: ['Meet EPR and sustainability targets without re-engineering packaging lines', 'Differentiate on shelf with a visible freshness cue'] },
  { k: 'Retailers', p: ['Reduce shrinkage from unsold, spoiled stock', 'Lower return and complaint rates'] },
  { k: 'Consumers', p: ['Confidence in food safety without opening the pack', 'Guilt-free disposal — compostable at home'] },
  { k: 'The planet', p: ['Diverts agro-waste from landfill and burning into productive use', 'Cuts plastic pollution and food waste at the same time'] },
];

// Relative cost versus conventional plastic (1.0×).
export const COST = [
  { k: 'Plastic', v: 1.0 },
  { k: 'Paper', v: 1.1 },
  { k: 'Corn starch film', v: 1.6 },
  { k: 'Other biofilms', v: 1.7 },
  { k: 'PLA film', v: 1.8 },
  { k: 'ELVARA today', v: 1.5, elvara: true },
  { k: 'ELVARA by Year 3', v: 1.1, elvara: true, target: true },
];

export const REVENUE_STREAMS = [
  { v: '~78%', t: 'Direct film sales', d: 'Per-kg roll-stock film to converters and brand owners' },
  { v: '~15%', t: 'Licensing & contract manufacturing', d: 'Formulation and process licensed to regional converters' },
  { v: '+18%', t: 'Premium indicator tier', d: 'Freshness-indicator lamination lifts blended price' },
  { v: 'Grants', t: 'Non-dilutive funding', d: 'BIRAC BIG, MSME Innovation and state green-tech grants' },
];

export const CHANNELS = [
  { v: 70, t: 'Direct B2B sales', d: 'Dairy, bakery and ready-to-eat brands' },
  { v: 20, t: 'Regional distributors', d: 'Converters reaching mid-size manufacturers' },
  { v: 7, t: 'E-commerce & marketplaces', d: 'B2B marketplaces for SME buyers' },
  { v: 3, t: 'Licensing partners', d: 'Regional manufacturing licensees (Year 3+)' },
];

export const PLANT = [
  { k: 'Built-up area', v: '4,500 sq ft' },
  { k: 'Location', v: 'SIPCOT Industrial Park, Tamil Nadu' },
  { k: 'Line capacity', v: '8 t / month → 160 t / month by Year 5' },
  { k: 'Compliance', v: 'FSSAI · Pollution Control Board NOC' },
];

export const PLANT_ZONES = ['Raw material storage', 'Extraction & formulation lab', 'Film casting / extrusion line', 'Lamination & indicator station', 'QC & testing lab', 'Slitting, packing & dispatch'];

export const QUALITY_GATES = [
  'Tensile and elongation testing (ASTM D882) on every production batch',
  'Water-vapour transmission and heat-seal integrity checks',
  'Food-contact safety compliance (FSSAI) verified per batch before dispatch',
];

export const SOURCING = [
  { k: 'Fruit peel & agro-cellulose', s: 'Regional fruit processors, Tamil Nadu & Kerala', p: 'Multi-vendor contracts + seasonal buffer stock' },
  { k: 'Lignin by-product', s: 'Paper mill and agro-processing partners', p: '12-month offtake agreements' },
  { k: 'Natural anthocyanin', s: 'Red cabbage, flower petals and plant waste streams', p: 'In-house extraction from secondary waste' },
  { k: 'Bio-based plasticisers', s: 'Certified domestic suppliers', p: 'Dual-sourced for continuity' },
  { k: 'Packaging consumables', s: 'Local converters', p: 'Just-in-time procurement' },
];

// ₹ Lakhs, Years 1–5
export const FINANCE = {
  years: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
  revenue: [90, 310, 640, 1150, 1900],
  ebitda: [-36, 16, 130, 344, 705],
  margin: ['40%', '47%', '50%', '52.5%', '55%'],
};

export const RETURNS = [
  { v: '34%', l: 'Projected 5-year IRR' },
  { v: '₹2.14 Cr', l: 'NPV at 15% discount rate' },
  { v: '~18 mo', l: 'Break-even' },
  { v: '6.1×', l: '5-year ROI multiple' },
];

export const ASK = {
  amount: '₹1.5 Cr',
  round: 'Seed round',
  line: 'An 18-month runway to certified commercial-scale production, five anchor customers and Series A readiness.',
  use: ['Pilot line scale-up', 'Food-safety certification', 'Go-to-market with anchor customers'],
  invest: { total: '₹170 L', capex: '₹106 L', opex: '₹64 L' },
};

export const FUNDING_PATH = [
  { k: 'Bootstrapping', s: 'Complete', src: 'Founder savings', p: 'Prove concept, initial R&D' },
  { k: 'Government grants', s: 'BIRAC BIG in progress', src: 'BIRAC BIG, MSME Innovation, Startup India Seed Fund, SIDBI', p: 'Non-dilutive R&D and pilot scale-up' },
  { k: 'Angel + Seed', s: 'Current round · ₹1.5 Cr', src: 'Angels and micro-VCs', p: 'Scale pilot production, first commercial customers' },
  { k: 'Series A', s: '18–24 months out', src: 'Venture capital', p: 'Manufacturing capacity, national distribution' },
  { k: 'Series B', s: 'Year 4', src: 'Growth VC / strategic investors', p: 'Multi-state expansion, category leadership' },
];

export const RISKS = [
  { r: 'Raw material supply disruption', m: 'Multi-vendor sourcing + 6-week buffer inventory' },
  { r: 'Delayed food-safety certification', m: 'Early FSSAI engagement and parallel-track testing' },
  { r: 'Slower customer adoption', m: 'Pilot-first sales with performance guarantees' },
  { r: 'Working capital shortfall', m: 'Milestone-staged funding with a non-dilutive grant buffer' },
  { r: 'Competitive entry from larger players', m: 'IP protection and first-mover anchor relationships' },
  { r: 'Key personnel attrition', m: 'ESOP retention pool and documented process ownership' },
];

export const EXITS = [
  { t: 'Strategic acquisition', d: 'By an FMCG, packaging or materials group seeking sustainable-packaging IP — the most probable path.' },
  { t: 'Licensing & technology transfer', d: 'Royalty income from regional and global manufacturers.' },
  { t: 'Global merger', d: 'With an international bioplastics player — Southeast Asia, EU and Middle East access.' },
  { t: 'IPO', d: 'NSE / BSE SME platform once revenue passes ~₹150 Cr with sustained profitability — an 8–10 year horizon.' },
];

export const TEAM_PLAN = { y1: 6, y3: 18, roles: ['2 Co-Founders', 'R&D Lead', 'Production Manager', 'QC & Compliance', 'Sales & Partnerships'] };

/* ───────── Remaining deck + MSME 5.0 content ───────── */

export const HEADLINE = [
  { v: '38%', l: 'Tensile strength gain over PLA film' },
  { v: '90 days', l: 'Home-compostable degradation' },
  { v: '1', l: 'Patent filed' },
  { v: '₹28,000+ Cr', l: 'Indian food & FMCG packaging market' },
];

// From the MSME Idea Hackathon 5.0 prototype.
export const PROTOTYPE = [
  { t: 'Lignin extraction', d: 'Lignin extracted from Vachellia nilotica bark by an alkaline method, then purified by acid precipitation.' },
  { t: 'Natural indicator', d: 'Hibiscus petals processed in acidified ethanol to draw out stable, natural indicator pigments.' },
  { t: 'Formulation', d: 'Lignin blended with a starch support for flexibility, with the indicator dispersed evenly through the film.' },
  { t: 'Casting', d: 'Film cast and dried at room temperature — smooth, flexible and slightly tinted.' },
];
export const PROTOTYPE_RESULT = [
  { k: 'Fresh food', v: 'Red / purple' },
  { k: 'As food spoils', v: 'Purple → green, as pH rises' },
  { k: 'After use', v: 'Fully compostable' },
];

export const MARKET_EDGE = [
  { k: 'Plastic packaging', w: 'Cheap, but not biodegradable and blind to spoilage', e: 'Eco-friendly and smart' },
  { k: 'Bioplastics', w: 'Need industrial composting; no smart indicator', e: 'Naturally compostable with real-time spoilage detection' },
  { k: 'Smart packaging', w: 'Costly synthetic sensors, often not biodegradable', e: 'Low-cost, natural, food-safe indicators' },
  { k: 'Academic prototypes', w: 'Not market-ready or scalable', e: 'A scalable, dual-function product for real use' },
];

export const SWOT = [
  { k: 'Strengths', p: ['Proprietary lignin–cellulose formulation with filed IP', 'Dual value: compostable + freshness indicator', 'Low-cost agro-waste feedstock'] },
  { k: 'Weaknesses', p: ['Pre-revenue, single pilot production line', 'Small founding team, limited manufacturing track record', 'Certification and scale-up still in progress'] },
  { k: 'Opportunities', p: ['Regulatory tailwinds — plastic bans and EPR mandates', 'Grant ecosystem: BIRAC, MSME, Startup India', 'White space: no competitor combines both innovations'] },
  { k: 'Threats', p: ['Entrenched distribution of plastic converters', 'Seasonality of agro-waste raw material', 'New biopolymer entrants and price competition'] },
];

export const PESTLE = [
  { k: 'Political', d: 'Strong support through Startup India, BIRAC BIG grants and Tamil Nadu green-tech incentives.' },
  { k: 'Economic', d: 'Rising virgin-resin costs improve biofilm competitiveness; inflation pressures raw-material budgets.' },
  { k: 'Social', d: 'Growing preference for visibly sustainable brands and awareness of food waste.' },
  { k: 'Technological', d: 'Advances in nanocellulose and bio-indicator chemistry lower R&D risk over time.' },
  { k: 'Legal', d: 'Plastic Waste Management Rules and the EPR framework mandate cuts in single-use plastic.' },
  { k: 'Environmental', d: 'Direct fit with circular-economy and net-zero packaging commitments across FMCG.' },
];

// level: 1 low … 4 moderate-high
export const PORTER = [
  { k: 'Threat of new entrants', l: 'Moderate', n: 2.5, d: 'IP and process know-how raise barriers, but biomaterials R&D attracts new startups.' },
  { k: 'Supplier power', l: 'Low', n: 1, d: 'Agro-waste feedstock is abundant and spread across many regional sources.' },
  { k: 'Buyer power', l: 'Moderate', n: 2.5, d: 'Large FMCG buyers can press on price, but few alternatives match the spec.' },
  { k: 'Threat of substitutes', l: 'Moderate–High', n: 3.5, d: 'Paper, PLA and starch films compete, yet each lacks the combined properties.' },
  { k: 'Industry rivalry', l: 'Moderate', n: 2.5, d: 'Few direct competitors combine compostability with freshness indication today.' },
];

export const LANDSCAPE = {
  cols: ['Plastic', 'Paper', 'PLA film', 'Corn starch', 'Other biofilms', 'ELVARA'],
  rows: [
    { k: 'Biodegradable', v: ['No', 'Partial', 'Industrial only', 'Partial', 'Varies', 'Yes — home compost'] },
    { k: 'Moisture resistance', v: ['Excellent', 'Poor', 'Good', 'Fair', 'Fair', 'Good'] },
    { k: 'Tensile strength', v: ['High', 'Low', 'Moderate', 'Low–Moderate', 'Moderate', 'High'] },
    { k: 'Freshness indicator', v: ['No', 'No', 'No', 'No', 'No', 'Yes'] },
    { k: 'Relative cost', v: ['1.0×', '1.1×', '1.8×', '1.6×', '1.7×', '1.5× → 1.1× by Y3'] },
  ],
};

export const CANVAS = [
  { k: 'Key partners', a: 'kp', d: 'Agro-waste aggregators, contract film manufacturers, FSSAI labs, packaging converters' },
  { k: 'Key activities', a: 'ka', d: 'R&D and formulation, film production, QC and certification, B2B sales' },
  { k: 'Key resources', a: 'kr', d: 'Patented formulation, pilot production line, technical team' },
  { k: 'Value proposition', a: 'vp', d: 'Compostable, high-strength film with built-in freshness signalling — one material, two problems solved' },
  { k: 'Customer relationships', a: 'cr', d: 'Direct technical account management and co-development pilots' },
  { k: 'Channels', a: 'ch', d: 'Direct B2B sales, packaging distributors, industry expos' },
  { k: 'Customer segments', a: 'cs', d: 'Dairy, meat and fish, fruit and veg, bakery, ready-to-eat, pharma and cosmetic brands, e-commerce sellers' },
  { k: 'Cost structure', a: 'co', d: 'Raw materials, manufacturing and labour, R&D, certification, marketing and distribution' },
  { k: 'Revenue streams', a: 're', d: 'Per-kg film sales, licensing to converters, premium indicator-tier pricing' },
];

// B2B film pricing, per kilogram of roll stock.
export const PRICING = [
  { k: 'Base film', s: 'Structural + barrier layers', v: '₹420–480', d: 'A 40–50% premium to standard PLA, justified by superior strength and true home-compostability.' },
  { k: 'Freshness-indicator tier', s: 'Full three-layer film', v: '₹560–640', d: 'For high-spoilage categories — dairy, meat, fish — where reduced returns offset the premium.' },
];
export const PRICING_NOTES = [
  'Volume discounts above 500 kg / month',
  'Annual contracts lock a further 5–8% reduction',
  'Target: parity with premium PLA by Year 3 as scale cuts processing cost ~35%',
];

export const SEGMENTS = [
  { phase: 'Phase 1 · Year 1', items: [{ k: 'Dairy processors & co-operatives', n: 'Spoilage-sensitive, high return volume' }, { k: 'Bakery & ready-to-eat brands', n: 'Shelf-life extension, shelf appeal' }] },
  { phase: 'Phase 2 · Year 2', items: [{ k: 'Fresh produce packers', n: 'Moisture control, biodegradability mandate' }, { k: 'Meat & fish processors', n: 'High barrier + freshness signalling' }] },
  { phase: 'Phase 3 · Year 3', items: [{ k: 'Pharma & cosmetic brands', n: 'Sustainable secondary packaging' }, { k: 'E-commerce sellers', n: 'Compliant mailers and wraps at scale' }] },
];

export const GTM = [
  { k: 'Direct enterprise sales', d: 'Technical account managers running co-development pilots with anchor dairy and bakery customers in Year 1.' },
  { k: 'Industry credibility', d: 'PackPlus and AAHAR expos, plus peer-reviewed publication of film performance data.' },
  { k: 'Science-led content', d: 'LinkedIn and trade-press features positioning the founders as biomaterials experts.' },
  { k: 'Channel partnerships', d: 'Two to three regional packaging distributors onboarded by Year 2.' },
  { k: 'Certification marketing', d: 'FSSAI, compostability and green-tech award credentials in all B2B collateral.' },
];

// ₹ Lakhs
export const STARTUP_COSTS = [
  { k: 'Machinery & processing equipment', v: 55, c: 'CapEx' },
  { k: 'Working capital (3 months)', v: 35, c: 'OpEx' },
  { k: 'Laboratory & QC equipment', v: 25, c: 'CapEx' },
  { k: 'Land & building (lease, deposit, fit-out)', v: 20, c: 'CapEx' },
  { k: 'Pre-launch marketing & branding', v: 12, c: 'OpEx' },
  { k: 'Contingency (5%)', v: 9, c: 'OpEx' },
  { k: 'Legal, registration & IP filing', v: 8, c: 'OpEx' },
  { k: 'Furniture & IT infrastructure', v: 6, c: 'CapEx' },
];

// ₹ Lakhs per month, Year 1
export const OPEX_MONTHLY = [
  { k: 'Salaries (12 staff)', v: 9.0 },
  { k: 'Raw materials', v: 8.0 },
  { k: 'Marketing', v: 2.0 },
  { k: 'Utilities', v: 1.5 },
  { k: 'Transport & logistics', v: 1.2 },
  { k: 'Admin & misc.', v: 1.0 },
  { k: 'Packaging', v: 0.8 },
];

export const PNL = {
  cols: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
  rows: [
    { k: 'Revenue', v: [90, 310, 640, 1150, 1900], strong: true },
    { k: 'COGS', v: [54, 164, 320, 546, 855] },
    { k: 'Gross profit', v: [36, 146, 320, 604, 1045] },
    { k: 'Gross margin', v: ['40%', '47%', '50%', '52.5%', '55%'] },
    { k: 'Operating expenses', v: [72, 130, 190, 260, 340] },
    { k: 'EBITDA', v: [-36, 16, 130, 344, 705], strong: true },
    { k: 'EBITDA margin', v: ['-40%', '5%', '20%', '30%', '37%'] },
    { k: 'Depreciation', v: [12, 14, 16, 18, 20] },
    { k: 'EBIT', v: [-48, 2, 114, 326, 685] },
    { k: 'Interest', v: [6, 6, 5, 4, 3] },
    { k: 'Tax (25%, where positive)', v: [0, 0, 27, 80, 170] },
    { k: 'Net profit', v: [-54, -4, 82, 242, 512], strong: true },
  ],
};

export const BALANCE = {
  cols: ['Year 1', 'Year 3', 'Year 5'],
  rows: [
    { k: 'Fixed assets (net)', v: [94, 108, 142] },
    { k: 'Current assets', v: [58, 245, 980] },
    { k: 'Total assets', v: [152, 353, 1122], strong: true },
    { k: 'Current liabilities', v: [18, 42, 95] },
    { k: 'Long-term debt', v: [45, 30, 10] },
    { k: 'Total liabilities', v: [63, 72, 105], strong: true },
    { k: 'Shareholders’ equity', v: [89, 281, 1017], strong: true },
  ],
};

export const SENSITIVITY = [
  { k: 'Downside', g: '−20% vs base', m: '+15% vs base', v: 310 },
  { k: 'Raw material shock', g: 'As forecast', m: '+30% vs base', v: 480 },
  { k: 'Delayed certification (+6 mo)', g: '−15% in Years 1–2', m: 'As forecast', v: 640 },
  { k: 'Base case', g: 'As forecast', m: 'As forecast', v: 705, base: true },
  { k: 'Upside', g: '+20% vs base', m: '−10% vs base', v: 1120 },
];

export const RATIOS = [
  { v: '5.8×', l: 'Current ratio (Y3)' },
  { v: '0.11×', l: 'Debt-to-equity (Y3)' },
  { v: '55%', l: 'Gross margin (Y5)' },
  { v: '3.2 yrs', l: 'Payback period' },
];

// Approximate ownership after each round, %.
export const CAP_TABLE = [
  { k: 'Pre-seed', f: 100, i: 0, e: 0 },
  { k: 'Post angel / seed', f: 75, i: 20, e: 5 },
  { k: 'Post Series A', f: 58, i: 37, e: 5 },
  { k: 'Post Series B', f: 45, i: 42, e: 8 },
];

export const VALUATION = [
  { k: 'Pre-money valuation', v: '₹6 Cr' },
  { k: 'Seed raise', v: '₹1.5 Cr' },
  { k: 'Post-money valuation', v: '₹7.5 Cr' },
  { k: 'Seed investors’ ownership', v: '20%' },
  { k: 'ESOP pool', v: '5–8%' },
];
