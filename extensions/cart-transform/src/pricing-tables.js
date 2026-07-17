// ─────────────────────────────────────────────────────────────────────────────
// bejwld pricing tables — Cart Transform copy.
//
// These MUST stay identical to `app/lib/catalog/pricing.ts` in the storefront.
// They are duplicated here because a Shopify Function is compiled to Wasm and
// cannot import from the app bundle. When you plug in Shah's real wholesale
// numbers (§7 of the brief), edit BOTH files together — the storefront estimate
// and this billed truth must always agree.
//
// All amounts are whole USD.
// ─────────────────────────────────────────────────────────────────────────────

export const METAL_ADD = {vermeil: 0, '14k': 450, '18k': 900};

export const TREATMENT_ADD = {none: 0, accent: 350, pave: 850};

// [labGrownSurcharge, naturalSurcharge] per carat tier.
export const CARAT_ADD = {
  '0.25': {lab: 0, nat: 150},
  '0.5': {lab: 400, nat: 750},
  '1.0': {lab: 1100, nat: 2000},
  '1.5': {lab: 2100, nat: 3700},
  '2.0': {lab: 3400, nat: 5900},
};

export const CHAIN_ADD = {'16': 0, '18': 60, '20': 120};

// Engraving is complimentary up to 15 characters (enforced in the storefront).
export const ENGRAVING_ADD = 0;

/**
 * The additive surcharge for a configuration (NOT including the base price).
 * `config` is the parsed `_config` attribute; only the keys present apply, so
 * this never needs to know the product type.
 *
 * @param {{metal?:string, treatment?:string, carat?:string, diamond?:string, chain?:string, engraving?:string}} config
 * @returns {number} surcharge in whole USD
 */
export function surchargeFor(config) {
  let add = 0;
  if (config.metal && METAL_ADD[config.metal] != null) add += METAL_ADD[config.metal];
  if (config.treatment && TREATMENT_ADD[config.treatment] != null) {
    add += TREATMENT_ADD[config.treatment];
  }
  if (config.treatment && config.treatment !== 'none' && config.carat && CARAT_ADD[config.carat]) {
    add += config.diamond === 'natural'
      ? CARAT_ADD[config.carat].nat
      : CARAT_ADD[config.carat].lab;
  }
  if (config.chain && CHAIN_ADD[config.chain] != null) add += CHAIN_ADD[config.chain];
  if (config.engraving) add += ENGRAVING_ADD;
  return add;
}
