/**
 * bejwld configurator pricing — the SINGLE SOURCE OF TRUTH.
 *
 * These tables and the `computeConfiguredPrice` function are used in two places:
 *
 *   1. The client configurator (`/customize/:handle`) — for the live *estimate*
 *      shown to the shopper as they compose a piece.
 *   2. The Cart Transform Function (`extensions/cart-transform/`) — the
 *      *billed truth*, which recomputes the price server-side from the
 *      line-item properties so the client can never dictate what is charged.
 *
 * The extension keeps its own copy of these tables (the Wasm/Function runtime
 * can't import from the app bundle). When you plug in Shah's real wholesale
 * numbers (§7 of the brief), update BOTH this file and
 * `extensions/cart-transform/src/pricing-tables.js` — they are intentionally
 * identical so the estimate and the charge always agree.
 *
 * All amounts are whole USD.
 */

import type {
  CaratId,
  ChainId,
  DiamondId,
  Metal,
  PieceConfig,
  PriceResult,
  Product,
  Stone,
} from './types';

export interface MetalOption {
  id: Metal;
  label: string;
  sub: string;
  add: number;
}
export interface TreatmentOption {
  id: Stone;
  label: string;
  sub: string;
  add: number;
}
export interface CaratOption {
  id: CaratId;
  label: string;
  /** Surcharge for a lab-grown stone at this weight. */
  lab: number;
  /** Surcharge for a natural stone at this weight. */
  nat: number;
}
export interface DiamondOption {
  id: DiamondId;
  label: string;
  sub: string;
}
export interface ChainOption {
  id: ChainId;
  label: string;
  sub: string;
  add: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICING TABLES — placeholder seed values (§7). Replace with real wholesale.
// ─────────────────────────────────────────────────────────────────────────────

export const METAL_OPTIONS: MetalOption[] = [
  {id: 'vermeil', label: 'Gold vermeil', sub: '925 silver, gilded', add: 0},
  {id: '14k', label: '14k gold', sub: 'Solid yellow gold', add: 450},
  {id: '18k', label: '18k gold', sub: 'The house standard', add: 900},
];

export const TREATMENT_OPTIONS: TreatmentOption[] = [
  {id: 'none', label: 'Polished gold', sub: 'No stones', add: 0},
  {id: 'accent', label: 'Diamond accent', sub: 'A single set stone', add: 350},
  {id: 'pave', label: 'Pavé', sub: 'A hand-set field', add: 850},
];

export const CARAT_OPTIONS: CaratOption[] = [
  {id: '0.25', label: '0.25 carat', lab: 0, nat: 150},
  {id: '0.5', label: '0.5 carat', lab: 400, nat: 750},
  {id: '1.0', label: '1.0 carat', lab: 1100, nat: 2000},
  {id: '1.5', label: '1.5 carat', lab: 2100, nat: 3700},
  {id: '2.0', label: '2.0 carat', lab: 3400, nat: 5900},
];

export const DIAMOND_OPTIONS: DiamondOption[] = [
  {id: 'lab', label: 'Lab-grown', sub: 'Identical, considered'},
  {id: 'natural', label: 'Natural', sub: 'Earth-formed'},
];

export const CHAIN_OPTIONS: ChainOption[] = [
  {id: '16', label: '16 inch', sub: 'At the collarbone', add: 0},
  {id: '18', label: '18 inch', sub: 'Just below', add: 60},
  {id: '20', label: '20 inch', sub: 'Over knitwear', add: 120},
];

/** Engraving is complimentary up to this many characters. */
export const ENGRAVING_MAX = 15;

// ─────────────────────────────────────────────────────────────────────────────
// PURE PRICING LOGIC
// ─────────────────────────────────────────────────────────────────────────────

/** Format a whole-dollar amount, e.g. 1850 → "$1,850". */
export function formatUSD(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

/** The default composition a configurable piece opens with. */
export function defaultConfig(): PieceConfig {
  return {metal: 'vermeil', treatment: 'accent', carat: '0.25', diamond: 'lab', chain: '16'};
}

/**
 * A configuration seeded from the piece itself — e.g. a pavé piece opens on the
 * pavé treatment rather than the generic default.
 */
export function configForProduct(product: Product): PieceConfig {
  const cfg = defaultConfig();
  if (product.stone === 'pave') cfg.treatment = 'pave';
  return cfg;
}

/** Does this product type carry a chain (and therefore a chain-length option)? */
export function hasChain(type: string): boolean {
  return /pendant|necklace|bracelet/i.test(type);
}

/** The starting ("From") price of any product — configured default or fixed. */
export function fromPrice(product: Product): number {
  if (product.configurable) {
    return computeConfiguredPrice(product, configForProduct(product)).total;
  }
  return product.price ?? product.base ?? 0;
}

/**
 * Compute the price of a configured piece and an itemised breakdown.
 *
 * This is the authoritative formula. The Cart Transform Function runs the same
 * arithmetic on the server from the cart line's properties; the client only
 * uses it to *display* an estimate.
 */
export function computeConfiguredPrice(
  product: Product,
  config: PieceConfig,
  engraving = '',
): PriceResult {
  const basePrice = product.base ?? product.price ?? 0;
  let total = basePrice;
  const rows = [{label: `${product.name}, base`, amount: formatUSD(basePrice)}];

  const metal = METAL_OPTIONS.find((m) => m.id === config.metal) ?? METAL_OPTIONS[0];
  total += metal.add;
  rows.push({
    label: `Metal · ${metal.label}`,
    amount: metal.add ? '+' + formatUSD(metal.add) : 'Included',
  });

  const treatment =
    TREATMENT_OPTIONS.find((t) => t.id === config.treatment) ?? TREATMENT_OPTIONS[0];
  total += treatment.add;
  rows.push({
    label: `Stones · ${treatment.label}`,
    amount: treatment.add ? '+' + formatUSD(treatment.add) : 'Included',
  });

  if (config.treatment !== 'none') {
    const carat = CARAT_OPTIONS.find((c) => c.id === config.carat) ?? CARAT_OPTIONS[0];
    const add = config.diamond === 'natural' ? carat.nat : carat.lab;
    total += add;
    rows.push({
      label: `${carat.label} · ${config.diamond === 'natural' ? 'natural' : 'lab-grown'}`,
      amount: add ? '+' + formatUSD(add) : 'Included',
    });
  }

  if (hasChain(product.type)) {
    const chain = CHAIN_OPTIONS.find((c) => c.id === config.chain) ?? CHAIN_OPTIONS[0];
    total += chain.add;
    rows.push({
      label: `Chain · ${chain.label}`,
      amount: chain.add ? '+' + formatUSD(chain.add) : 'Included',
    });
  }

  const trimmed = engraving.trim();
  if (trimmed) {
    rows.push({label: `Engraving · “${trimmed}”`, amount: 'Included'});
  }

  return {total, rows};
}

/**
 * A compact, machine-readable snapshot of the configuration, written to the
 * cart line as a hidden attribute (`_config`). The Cart Transform Function reads
 * THIS (not the human-readable labels) to recompute the price server-side. Only
 * the fields that actually apply to the piece are included, so the Function can
 * sum surcharges without needing to know the product type.
 */
export function configToStructuredAttribute(
  product: Product,
  config: PieceConfig,
  engraving = '',
): {key: string; value: string} {
  const payload: Record<string, string> = {
    metal: config.metal,
    treatment: config.treatment,
  };
  if (config.treatment !== 'none') {
    payload.carat = config.carat;
    payload.diamond = config.diamond;
  }
  if (hasChain(product.type)) {
    payload.chain = config.chain;
  }
  const trimmed = engraving.trim();
  if (trimmed) payload.engraving = trimmed;
  return {key: '_config', value: JSON.stringify(payload)};
}

/**
 * Build the ordered list of line-item properties for a configured piece.
 * These are what get written to the cart line and read back by the Cart
 * Transform Function (and shown to the atelier on the order).
 */
export function configToLineItemProperties(
  product: Product,
  config: PieceConfig,
  engraving = '',
): Array<{key: string; value: string}> {
  const metal = METAL_OPTIONS.find((m) => m.id === config.metal)?.label ?? config.metal;
  const treatment =
    TREATMENT_OPTIONS.find((t) => t.id === config.treatment)?.label ?? config.treatment;
  const props: Array<{key: string; value: string}> = [
    {key: 'Metal', value: metal},
    {key: 'Stones', value: treatment},
  ];
  if (config.treatment !== 'none') {
    props.push({key: 'Diamond', value: `${config.carat} ct ${config.diamond}`});
  }
  if (hasChain(product.type)) {
    props.push({key: 'Chain', value: `${config.chain}″`});
  }
  const trimmed = engraving.trim();
  if (trimmed) props.push({key: 'Engraving', value: `“${trimmed}”`});
  return props;
}
