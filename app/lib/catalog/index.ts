/**
 * The catalog PROVIDER — the seam between the app and its data source.
 *
 * Every route imports from here and nowhere else touches `data.ts`. Today these
 * functions read the in-memory mock catalog; each one is annotated with the
 * Storefront API query it corresponds to. To go live against a real Shopify
 * store you rewrite the bodies of these functions to run those GraphQL queries
 * (via `context.storefront.query`) and map the responses onto the `Product`
 * type — the routes, components, pricing, and configurator do not change.
 *
 * Note the functions are async and return plain, serialisable data so they can
 * be called from React Router loaders and dropped straight into `data()`.
 */

import {PRODUCTS, SPORT_META} from './data';
import {fromPrice} from './pricing';
import type {Metal, Product, Sport, Stone, Tier} from './types';

export * from './types';
export * from './pricing';

/** A product decorated with its computed "From" price for display. */
export interface ProductCard extends Product {
  priceFrom: number;
  priceLabel: string;
}

function toCard(p: Product): ProductCard {
  const priceFrom = fromPrice(p);
  return {
    ...p,
    priceFrom,
    priceLabel: (p.configurable ? 'From ' : '') + '$' + priceFrom.toLocaleString('en-US'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SPORTS — always derived at runtime, never enumerated.
// ─────────────────────────────────────────────────────────────────────────────

export interface SportSummary {
  /** Collection handle, e.g. "pickleball". */
  sport: Sport;
  /** Title-cased label for display. */
  label: string;
  tagline: string;
  description: string;
  count: number;
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The list of sports the house currently sells, derived from the products that
 * exist. Order follows first appearance in the catalog.
 *
 * Storefront equivalent: query `collections` and keep those tagged as sport
 * capsules (e.g. in a "Sports" metaobject list, or by a `capsule:sport` tag).
 */
export async function getSports(): Promise<SportSummary[]> {
  const seen = new Map<Sport, number>();
  for (const p of PRODUCTS) seen.set(p.sport, (seen.get(p.sport) ?? 0) + 1);
  return [...seen.entries()].map(([sport, count]) => ({
    sport,
    label: titleCase(sport),
    tagline: SPORT_META[sport]?.tagline ?? 'A new capsule from the house',
    description:
      SPORT_META[sport]?.description ?? 'A new capsule from the house.',
    count,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

/** Storefront equivalent: `products(first: N)` with metafields. */
export async function getAllProducts(): Promise<ProductCard[]> {
  return PRODUCTS.map(toCard);
}

/** Storefront equivalent: `product(handle: $handle)`. */
export async function getProduct(handle: string): Promise<Product | null> {
  return PRODUCTS.find((p) => p.handle === handle) ?? null;
}

export interface CollectionFilters {
  metal?: Metal | null;
  stone?: Stone | null;
  tier?: Tier | null;
}

export type SortKey = 'featured' | 'asc' | 'desc';

/**
 * Products in a sport collection, faceted and sorted.
 *
 * Storefront equivalent: `collection(handle: $sport).products` with
 * `filters` (product metafield filters) and `sortKey` / `reverse`.
 */
export async function getProductsBySport(
  sport: Sport,
  opts: {filters?: CollectionFilters; sort?: SortKey} = {},
): Promise<ProductCard[]> {
  const {filters = {}, sort = 'featured'} = opts;
  let list = PRODUCTS.filter((p) => p.sport === sport);
  if (filters.metal) list = list.filter((p) => p.metal === filters.metal);
  if (filters.stone) list = list.filter((p) => p.stone === filters.stone);
  if (filters.tier) list = list.filter((p) => p.tier === filters.tier);
  const cards = list.map(toCard);
  if (sort === 'asc') cards.sort((a, b) => a.priceFrom - b.priceFrom);
  if (sort === 'desc') cards.sort((a, b) => b.priceFrom - a.priceFrom);
  return cards;
}

/** All configurable pieces (the /customize index). */
export async function getConfigurableProducts(): Promise<ProductCard[]> {
  return PRODUCTS.filter((p) => p.configurable).map(toCard);
}

/**
 * Full-text-ish search across the catalog, faceted by sport + tier.
 *
 * Storefront equivalent: the `search` query (predictive + full), with product
 * filters. Kept deliberately simple here.
 */
export async function searchProducts(opts: {
  query?: string;
  sport?: Sport | null;
  tier?: Tier | null;
}): Promise<ProductCard[]> {
  const q = (opts.query ?? '').trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    const hay = `${p.name} ${p.type} ${p.description} ${p.materials} ${p.occasion}`.toLowerCase();
    return (
      (!q || hay.includes(q)) &&
      (!opts.sport || p.sport === opts.sport) &&
      (!opts.tier || p.tier === opts.tier)
    );
  }).map(toCard);
}

/** Cross-sell: other pieces from the same sport. */
export async function getRelatedProducts(
  product: Product,
  limit = 2,
): Promise<ProductCard[]> {
  return PRODUCTS.filter((p) => p.sport === product.sport && p.handle !== product.handle)
    .slice(0, limit)
    .map(toCard);
}

/** "Complete the set" for the cart — anything not already in the bag. */
export async function getCompleteTheSet(
  excludeHandles: string[],
  limit = 3,
): Promise<ProductCard[]> {
  const exclude = new Set(excludeHandles);
  return PRODUCTS.filter((p) => !exclude.has(p.handle))
    .slice(0, limit)
    .map(toCard);
}

/** Resolve a set of wishlist handles to product cards, preserving catalog order. */
export async function getProductsByHandles(handles: string[]): Promise<ProductCard[]> {
  const wanted = new Set(handles);
  return PRODUCTS.filter((p) => wanted.has(p.handle)).map(toCard);
}

// ─────────────────────────────────────────────────────────────────────────────
// FACET DEFINITIONS — the filter UI is generated from these.
// ─────────────────────────────────────────────────────────────────────────────

export const FACETS = {
  metal: {
    label: 'Metal',
    options: [
      {id: 'vermeil', label: 'Vermeil'},
      {id: '14k', label: '14k'},
      {id: '18k', label: '18k'},
    ] as Array<{id: Metal; label: string}>,
  },
  stone: {
    label: 'Stones',
    options: [
      {id: 'none', label: 'No stones'},
      {id: 'accent', label: 'Accent'},
      {id: 'pave', label: 'Pavé'},
      {id: 'solitaire', label: 'Solitaire'},
    ] as Array<{id: Stone; label: string}>,
  },
  tier: {
    label: 'Price',
    options: [
      {id: 'gateway', label: 'Under $600'},
      {id: 'signature', label: '$900–3,500'},
      {id: 'statement', label: '$4,000+'},
      {id: 'bespoke', label: 'Bespoke'},
    ] as Array<{id: Tier; label: string}>,
  },
} as const;
