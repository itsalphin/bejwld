/**
 * Domain types for the bejwld catalog.
 *
 * These mirror the *shape* of the data that will eventually come from the
 * Shopify Storefront API. Today they are populated from `data.ts` (mock
 * catalog); in production each field maps to a product field, tag, or
 * metafield — see `app/lib/catalog/index.ts` for the query seam.
 *
 * SPORT-AGNOSTIC: `sport` is a free string (a collection handle). Nothing in
 * the codebase enumerates the set of sports — it is always derived at runtime
 * from the products that exist. Launch ships `pickleball`; adding `tennis` is
 * pure data.
 */

/** A sport is identified by its collection handle, e.g. `"pickleball"`. */
export type Sport = string;

/** Price tiers from the brief (§7). Used for the price facet + merchandising. */
export type Tier = 'gateway' | 'signature' | 'statement' | 'bespoke';

/** Metal choices — the base metal a piece ships in, and a configurator facet. */
export type Metal = 'vermeil' | '14k' | '18k';

/** Stone treatment — drives the "Stones" facet and the configurator default. */
export type Stone = 'none' | 'accent' | 'pave' | 'solitaire';

/** Occasion metafield — a merchandising facet. */
export type Occasion = 'everyday' | 'gift' | 'victory' | 'bespoke';

/** Metal COLOUR a piece is rendered in (distinct from the karat `Metal`). */
export type MetalColour = 'yellow' | 'white';

/**
 * A view available for a piece. `cutout` is the transparent hero; `3d/front/
 * right/top/single` are the render angles; `threequarter/profile/detail` are the
 * AI-generated editorial angles (with their own backdrops).
 */
export type ProductView =
  | 'cutout'
  | '3d'
  | 'front'
  | 'right'
  | 'top'
  | 'single'
  | 'threequarter'
  | 'profile'
  | 'detail'
  | 'champagne'
  | 'marble';

export interface Product {
  /** URL handle, unique. Maps to Storefront `product.handle`. */
  handle: string;
  /** Display name, e.g. "Match Point Pendant". Maps to `product.title`. */
  name: string;
  /** Product type, e.g. "Pendant". Maps to `product.productType`. */
  type: string;
  /** Single Didone capital used in the placeholder art. Metafield `initial`. */
  initial: string;
  /** Sport collection handle. Metafield `custom.sport` + collection membership. */
  sport: Sport;
  /** Price tier. Metafield `custom.priceTier`. */
  tier: Tier;
  /** Base metal. Metafield `custom.metal`. */
  metal: Metal;
  /** Stone treatment. Metafield `custom.stoneTreatment`. */
  stone: Stone;
  /** Occasion. Metafield `custom.occasion`. */
  occasion: Occasion;
  /** Materials line, e.g. "14k gold · pavé-set sphere". Metafield `materials`. */
  materials: string;
  /** Editorial description. Maps to `product.description`. */
  description: string;
  /** Optional badge, e.g. "The signature". Metafield `custom.badge`. */
  badge?: string;
  /** True when the piece is configurable. Metafield `custom.configurable`. */
  configurable?: boolean;
  /**
   * Fixed retail price for non-configurable pieces (USD whole dollars).
   * Maps to `variant.price`.
   */
  price?: number;
  /**
   * Base price for configurable pieces (USD whole dollars). Surcharges from the
   * configurator are added on top. Maps to the base variant `price`; the final
   * price is enforced server-side by the Cart Transform Function.
   */
  base?: number;
  /**
   * Real product imagery. `imageDir` is the folder under `/public/products/`;
   * `colours` are the metal colours the piece renders in (display order);
   * `views` are the camera angles available (`cutout` first = hero). Absent for
   * pieces that still use the placeholder art (e.g. the tennis demo capsule).
   * Storefront equivalent: `product.images` grouped by a `colour` variant option.
   */
  imageDir?: string;
  colours?: MetalColour[];
  views?: ProductView[];
  /**
   * Overrides the card + PDP hero image (default `cutout`). Used for the few
   * near-identical SKUs whose clean vendor renders are shared with a sibling —
   * pointing the hero at a unique editorial angle keeps them visually distinct.
   */
  cardView?: ProductView;
}

/** The user's configurator selections, attached to a cart line as properties. */
export interface PieceConfig {
  metal: Metal;
  treatment: Stone;
  carat: CaratId;
  diamond: DiamondId;
  chain: ChainId;
}

export type CaratId = '0.25' | '0.5' | '1.0' | '1.5' | '2.0';
export type DiamondId = 'lab' | 'natural';
export type ChainId = '16' | '18' | '20';

/** One line in the configurator price breakdown. */
export interface PriceRow {
  label: string;
  amount: string;
}

export interface PriceResult {
  /** Final price in whole USD. */
  total: number;
  /** Human-readable breakdown for the configurator panel. */
  rows: PriceRow[];
}
