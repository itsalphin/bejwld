/**
 * bejwld mock catalog — the stand-in for Shopify while there is no store.
 *
 * This is the ONLY file that hard-codes product records. In production this
 * data lives in Shopify (products, collections, metafields) and this file is
 * deleted; `app/lib/catalog/index.ts` is rewritten to query the Storefront API
 * instead. Nothing else in the app reads `PRODUCTS` directly — everything goes
 * through the provider functions in `index.ts`, so the swap is contained.
 *
 * SPORT-AGNOSTIC PROOF: the launch ships one sport (`pickleball`). A second
 * capsule (`tennis`) is included and gated behind the `BEJWLD_ENABLE_TENNIS`
 * env flag purely to *demonstrate* that adding a sport is data-only: flip the
 * flag (or, in production, publish a `tennis` collection with tagged products)
 * and it appears in the nav, the home rail, /collections, and search with zero
 * code changes. No sport list is ever enumerated in code.
 */

import type {Product, Sport} from './types';

/** The launch capsule — ten pickleball pieces, on-voice and to spec (§8). */
const PICKLEBALL: Product[] = [
  {
    handle: 'first-serve',
    name: 'First Serve',
    type: 'Pendant',
    initial: 'F',
    sport: 'pickleball',
    tier: 'gateway',
    price: 325,
    metal: 'vermeil',
    stone: 'none',
    occasion: 'everyday',
    materials: 'Gold vermeil on sterling silver · 16–18″ chain',
    description:
      'A first piece. The court, drawn in a single hairline of gold, worn close.',
  },
  {
    handle: 'dink',
    name: 'Dink',
    type: 'Huggie hoops',
    initial: 'D',
    sport: 'pickleball',
    tier: 'gateway',
    price: 480,
    metal: '14k',
    stone: 'none',
    occasion: 'everyday',
    materials: '14k yellow gold · sold as a pair',
    description: 'Small, close, worn daily. The soft touch that wins the point.',
  },
  {
    handle: 'baseline',
    name: 'Baseline',
    type: 'Band',
    initial: 'B',
    sport: 'pickleball',
    tier: 'gateway',
    price: 590,
    metal: '14k',
    stone: 'none',
    occasion: 'everyday',
    materials: '14k yellow gold · 2mm court profile',
    description: 'A plain gold line. The place every point begins.',
  },
  {
    handle: 'ace',
    name: 'Ace',
    type: 'Solitaire stud',
    initial: 'A',
    sport: 'pickleball',
    tier: 'signature',
    base: 600,
    configurable: true,
    metal: '14k',
    stone: 'solitaire',
    occasion: 'gift',
    materials: '14k gold · single diamond, four-prong',
    description:
      'One point, won outright. A single diamond, set alone and worn without argument.',
    badge: 'Configurable',
  },
  {
    handle: 'the-rally',
    name: 'The Rally',
    type: 'Bracelet',
    initial: 'R',
    sport: 'pickleball',
    tier: 'signature',
    base: 800,
    configurable: true,
    metal: '14k',
    stone: 'accent',
    occasion: 'gift',
    materials: '14k gold links · diamond accent at the clasp',
    description:
      'Link after link. For the long exchanges, and the people you keep them with.',
    badge: 'Configurable',
  },
  {
    handle: 'match-point-studs',
    name: 'Match Point Studs',
    type: 'Pavé studs',
    initial: 'M',
    sport: 'pickleball',
    tier: 'signature',
    base: 1100,
    configurable: true,
    metal: '14k',
    stone: 'pave',
    occasion: 'victory',
    materials: '14k gold · hand-set pavé spheres',
    description: 'The closing point, in pavé. The ball, twice, catching the light.',
    badge: 'Configurable',
  },
  {
    handle: 'match-point-pendant',
    name: 'Match Point Pendant',
    type: 'Pendant',
    initial: 'M',
    sport: 'pickleball',
    tier: 'signature',
    base: 1500,
    configurable: true,
    metal: '14k',
    stone: 'pave',
    occasion: 'victory',
    materials: '14k gold · pavé-set sphere · fine cable chain',
    description: 'The ball, held in pavé. The piece the house was founded on.',
    badge: 'The signature',
  },
  {
    handle: 'the-kitchen',
    name: 'The Kitchen',
    type: 'Fine charm',
    initial: 'K',
    sport: 'pickleball',
    tier: 'statement',
    price: 4200,
    metal: '18k',
    stone: 'accent',
    occasion: 'victory',
    materials: '18k gold · seven baguette diamonds',
    description:
      'Seven feet, measured in 18-karat gold. For those who know exactly where to stand.',
  },
  {
    handle: 'championship',
    name: 'Championship',
    type: 'Necklace',
    initial: 'C',
    sport: 'pickleball',
    tier: 'statement',
    price: 6800,
    metal: '18k',
    stone: 'pave',
    occasion: 'victory',
    materials: '18k gold · graduated diamond court motif',
    description: 'For the ones who kept score. A necklace that settles the matter.',
  },
  {
    handle: 'bespoke',
    name: 'The Commission',
    type: 'Bespoke',
    initial: 'B',
    sport: 'pickleball',
    tier: 'bespoke',
    price: 10000,
    metal: '18k',
    stone: 'solitaire',
    occasion: 'bespoke',
    materials: 'One of one · numbered · built with the concierge',
    description: 'One of one. Drawn with you, numbered, and never repeated.',
    badge: 'Numbered',
  },
];

/**
 * The second capsule — proof the model is sport-agnostic. Not part of the
 * launch; surfaced only when `BEJWLD_ENABLE_TENNIS=true`. In production this is
 * simply a `tennis` collection with tagged products, published from admin.
 */
const TENNIS: Product[] = [
  {
    handle: 'deuce',
    name: 'Deuce',
    type: 'Pendant',
    initial: 'D',
    sport: 'tennis',
    tier: 'gateway',
    price: 340,
    metal: 'vermeil',
    stone: 'none',
    occasion: 'everyday',
    materials: 'Gold vermeil · racket-string hairlines',
    description: 'Even, again. The score that keeps the evening going.',
  },
  {
    handle: 'advantage',
    name: 'Advantage',
    type: 'Pavé studs',
    initial: 'A',
    sport: 'tennis',
    tier: 'signature',
    base: 1050,
    configurable: true,
    metal: '14k',
    stone: 'pave',
    occasion: 'gift',
    materials: '14k gold · pavé-set spheres',
    description: 'One point ahead, and dressed for it.',
    badge: 'Configurable',
  },
  {
    handle: 'grand-slam',
    name: 'Grand Slam',
    type: 'Necklace',
    initial: 'G',
    sport: 'tennis',
    tier: 'statement',
    price: 5400,
    metal: '18k',
    stone: 'pave',
    occasion: 'victory',
    materials: '18k gold · four diamond markers',
    description: 'Four courts, one chain. For a season worth remembering.',
  },
];

/**
 * The full product set for this environment. Reads the tennis flag once, at
 * module load, from a Vite-inlined env var (`VITE_BEJWLD_ENABLE_TENNIS`) so it
 * resolves identically in Node and in the Oxygen worker. In production, remove
 * this and query the Storefront API.
 */
const ENABLE_TENNIS =
  (import.meta.env?.VITE_BEJWLD_ENABLE_TENNIS as string | undefined) === 'true';

export const PRODUCTS: Product[] = ENABLE_TENNIS
  ? [...PICKLEBALL, ...TENNIS]
  : [...PICKLEBALL];

/**
 * Editorial copy per sport. In production this is a metaobject / collection
 * description keyed by handle; unknown sports fall back gracefully.
 */
export const SPORT_META: Record<
  Sport,
  {tagline: string; description: string}
> = {
  pickleball: {
    tagline: 'The launch capsule',
    description:
      'Ten pieces for the fastest-growing game in America — the court in pavé, the ball as a diamond-set sphere, the paddle in silhouette.',
  },
  tennis: {
    tagline: 'The second capsule',
    description:
      'Lawn whites and yellow gold — the score kept in diamonds.',
  },
};
