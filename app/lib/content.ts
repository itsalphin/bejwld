/**
 * Editorial copy for the house — the considered, on-voice content that isn't a
 * product (craft notes, trust row, reviews, static pages, sizing). Kept in one
 * place so the voice stays consistent and copy edits never touch layout. In
 * production the static pages become Shopify `pages` / metaobjects; the rest are
 * merchandising content.
 */

export const CRAFT_ITEMS = [
  {h: '14k & 18k gold', p: 'Solid gold or true vermeil. Nothing plated thin, nothing hollow.'},
  {h: 'Diamonds, both ways', p: 'Natural and lab-grown, disclosed plainly and priced plainly.'},
  {h: 'Numbered & certified', p: 'Every piece leaves with its own certificate of authenticity.'},
  {h: 'Made in New York', p: 'To order, by hand, in four to six weeks. Insured to your door.'},
];

export const TRUST_ITEMS = [
  {h: 'Returns', p: '30 days, unworn, no questions'},
  {h: 'Warranty', p: 'Lifetime craftsmanship promise'},
  {h: 'Insured delivery', p: 'Signature on arrival'},
  {h: 'Certificate', p: 'Numbered, in every box'},
];

export const REVIEWS = [
  {
    stars: 5,
    text: 'Bought for our anniversary — she has not taken it off since. The pavé catches the light exactly the way the listing promised.',
    who: 'Elena M. · verified',
  },
  {
    stars: 5,
    text: 'I play four mornings a week and wanted something that was not merch. This is the opposite of merch.',
    who: 'Priya S. · verified',
  },
  {
    stars: 4,
    text: 'The engraving is tiny and perfect. Sizing guide was accurate to the millimetre.',
    who: 'Dan W. · verified',
  },
];

export const RATING = {value: 4.9, count: 27};

/** Ring sizes for the interactive, printable sizing guide (§5.5). */
export const RING_SIZES = [
  {us: 4, mm: 46.8},
  {us: 5, mm: 49.3},
  {us: 6, mm: 51.9},
  {us: 7, mm: 54.4},
  {us: 8, mm: 57.0},
  {us: 9, mm: 59.5},
  {us: 10, mm: 62.1},
];

export const CONCIERGE_TOPICS = [
  {id: 'bespoke', label: 'A bespoke commission'},
  {id: 'sizing', label: 'Sizing & fit'},
  {id: 'gift', label: 'A gift, guided'},
  {id: 'appointment', label: 'An atelier appointment'},
  {id: 'repair', label: 'Care, repair or resize'},
];

export interface StaticBlock {
  h: string;
  p: string;
}
export interface StaticPage {
  kicker: string;
  title: string;
  intro?: string;
  blocks: StaticBlock[];
}

export const STATIC_PAGES: Record<string, StaticPage> = {
  about: {
    kicker: 'The house',
    title: 'Sport, made precious.',
    blocks: [
      {
        h: 'Why we exist',
        p: 'The games we love shape our days, our friendships, our years — and until now they were commemorated in rubber wristbands and printed cotton. bejwld was founded on a simple conviction: the sporting life deserves heirlooms.',
      },
      {
        h: 'How we work',
        p: 'Every piece begins as a drawing in our New York atelier, is cast in solid gold or true vermeil, set by hand, numbered, and certified. We make to order, in four to six weeks, and we do not discount — ever.',
      },
      {
        h: 'Where we are going',
        p: 'We launch with pickleball. Tennis, golf, and running follow as the house grows — each a capsule of its own, designed with the same restraint.',
      },
    ],
  },
  care: {
    kicker: 'Client care',
    title: 'Care & warranty',
    blocks: [
      {
        h: 'Caring for gold',
        p: 'Wipe with the soft cloth in your box after wear. Warm water, a drop of mild soap, and a soft brush restore full lustre. Keep vermeil away from perfume and pools.',
      },
      {
        h: 'Caring for diamonds',
        p: 'Diamonds love a gentle soak. Have settings checked yearly — we do it without charge, for life.',
      },
      {
        h: 'The warranty',
        p: 'Every bejwld piece carries a lifetime craftsmanship warranty. If a stone loosens or a clasp tires, we repair it. Plainly, and at our cost.',
      },
    ],
  },
  certificate: {
    kicker: 'Provenance',
    title: 'The certificate',
    intro:
      'Every piece is a numbered thing, recorded in the house registry. This is the concept — the certificate travels with the piece for life.',
    blocks: [
      {
        h: 'Numbered, always',
        p: 'Every piece leaves the atelier with a numbered certificate of authenticity — the metal, the stones, their origin and weight, and the date it was finished, in the house hand.',
      },
      {
        h: 'A registry, not a receipt',
        p: 'Your number is recorded in the house registry. Should the piece ever be resized, repaired, or passed on, its history travels with it.',
      },
    ],
  },
  contact: {
    kicker: 'Client care',
    title: 'Write to us',
    blocks: [
      {
        h: 'The concierge',
        p: 'concierge@bejwld.com — appointments, commissions, and considered advice. We reply within the day.',
      },
      {
        h: 'The atelier',
        p: 'By appointment only, in New York. The concierge will arrange it.',
      },
      {h: 'Press', p: 'press@bejwld.com — imagery and loans for editorial use.'},
    ],
  },
  policies: {
    kicker: 'The fine print',
    title: 'Policies',
    blocks: [
      {
        h: 'Shipping',
        p: 'Complimentary, insured, signature on delivery, worldwide. Made-to-order pieces ship in four to six weeks; ready pieces within two days.',
      },
      {
        h: 'Returns',
        p: 'Thirty days, unworn, in the original box. Engraved and bespoke pieces are made for you alone and are final.',
      },
      {
        h: 'Privacy',
        p: 'We keep your details to make and deliver your pieces, and nothing more. We do not sell data. The house list is opt-in, and quiet.',
      },
    ],
  },
};
