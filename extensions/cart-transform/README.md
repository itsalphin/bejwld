# bejwld — Cart Transform Function

Enforces the configurator price **server-side**. The storefront only ever shows
the shopper an *estimate*; this Function is what actually prices the line at
checkout, so a tampered client can never change what is charged.

## How it works

1. When a configured piece is added to the bag, the storefront writes a hidden
   `_config` line attribute — a compact JSON of the choices that apply
   (`metal`, `treatment`, `carat`, `diamond`, `chain`, `engraving`). See
   `configToStructuredAttribute` in `app/lib/catalog/pricing.ts`.
2. The Function's input query (`src/run.graphql`) reads each line's base unit
   cost and that `_config`.
3. `src/run.js` computes `base + surchargeFor(config)` using the tables in
   `src/pricing-tables.js`, then emits an `update` operation that fixes the unit
   price.

## The single source of truth

`src/pricing-tables.js` is a deliberate **mirror** of the storefront's
`app/lib/catalog/pricing.ts`. They are duplicated only because a Function
compiles to Wasm and can't import the app bundle. **When you replace the
placeholder seed numbers with Shah's real wholesale prices (§7 of the brief),
edit both files together** so the estimate and the charge always agree.

Wholesale → retail lives entirely in these tables (base variant prices in
Shopify + these additive surcharges). Nothing else needs to change.

## Deploy (needs a Shopify store + Shopify CLI)

From the storefront project root:

```bash
shopify app deploy
```

Then activate the Cart Transform in the Shopify admin (Settings → Apps, or via
the app that owns the extension). Once active, every configured line is priced
by this Function. The order in admin shows the human-readable properties
(Metal, Stones, Diamond, Chain, Engraving) so the atelier can make the piece to
spec.

> This project currently runs against mock data with no store, so the Function
> is authored but not deployed. The storefront's session cart applies the same
> arithmetic in `app/lib/cart/mock-cart.ts` so the demo prices correctly today.
