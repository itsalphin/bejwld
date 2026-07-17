# bejwld — storefront

**The fine jewelry house of the sporting life.** A production-grade, editorial
Shopify Hydrogen storefront. Heirloom gold and diamonds that celebrate the
sports people love — launching with **pickleball**, built to scale to any sport
as **pure data**.

Built on **Hydrogen 2026.x / React Router 7 / Oxygen**, TypeScript (strict),
Tailwind v4 driven by brand tokens. It currently runs against a **local mock
catalog** (no store required); every data access goes through one provider seam
so wiring a real Shopify Storefront API is a contained change.

---

## Run it

```bash
npm install
npm run dev        # → http://localhost:3000
```

Other scripts: `npm run build` (Oxygen build), `npm run preview` (serve the
build), `npm run typecheck` → `npx tsc --noEmit`.

Requires Node 22 or 24.

---

## What’s here

Every route, with real loading / empty / error states:

| Route | What it is |
| --- | --- |
| `/` | Editorial home — hero, **generated** sport rail, signature piece, craft, teasers |
| `/collections` | The capsules index (generated from the sport list) |
| `/collections/:sport` | Per-sport collection — faceted filters (metal/stones/price) + sort, URL-reflected |
| `/products/:handle` | PDP — gallery + **lazy 3D viewer**, structured data, reviews, complete-the-set, sizing guide |
| `/customize` · `/customize/:handle` | Configurator — live preview, live engraving, live price, writes line-item properties |
| `/cart` | Bag — line-item properties, qty, complete-the-set, checkout hand-off |
| `/search` | Faceted search (sport/price), URL-reflected |
| `/wishlist` | Saved pieces (persistent, shareable) |
| `/concierge` | Booking request (works without JS) |
| `/account` | Sign-in + dashboard + VIP/first-look scaffold |
| `/about` `/care` `/certificate` `/contact` `/policies` | Editorial + policy pages |
| `/og/:handle.svg` · `/sitemap.xml` · `/robots.txt` | Dynamic OG images + SEO |

Features: 3D product viewer (lazy R3F, image fallback), concierge booking,
advanced faceted search/filter, live engraving preview, printable ring/chain
sizing guide, persistent wishlist, complete-the-set cross-sell, reviews feeding
`AggregateRating`, loyalty/VIP scaffold, newsletter capture, care & warranty,
certificate-of-authenticity concept, related products, full policies.

---

## Where the design system lives

- **Tokens** — `app/styles/bejwld.css`. The exact brand colours as CSS variables
  (`--alabaster`, `--sable`, `--champagne`, `--laurel`, …), **both light and
  dark themes** as token overrides, self-hosted **Playfair Display**
  `@font-face` (`public/fonts/`, no CDN), base typography, and the signature
  motion keyframes. Tailwind utilities (`bg-alabaster`, `text-sable`,
  `font-display`, …) are mapped from these tokens via `@theme inline`, so they
  re-theme at runtime.
- **Theme switch** — a no-flash inline script in `app/root.tsx` applies the
  saved theme before paint; `app/components/ThemeToggle.tsx` toggles it.
- **Motion** — `app/components/Reveal.tsx` (IntersectionObserver reveals, CLS-safe)
  and `app/components/SmoothScroll.tsx` (Lenis, dynamically imported). All motion
  respects `prefers-reduced-motion`.

---

## Sport-agnostic model (the core requirement)

**Nothing enumerates the set of sports.** The nav, the home “Shop by sport”
rail, `/collections`, and search facets are all generated at runtime from the
products that exist (`getSports()` in `app/lib/catalog/index.ts`). Every product
carries a `sport` and belongs to a collection named for that sport.

### Adding a sport — the proof

The launch ships one sport (pickleball). A second capsule (**tennis**) already
exists as data. To watch the whole site absorb it with **zero code change**:

```bash
# .env
VITE_BEJWLD_ENABLE_TENNIS="true"
```

Restart `npm run dev`: Tennis now appears in the nav, the home rail, the
`/collections` index, `/collections/tennis`, and search — generated, not
hard-coded.

In **production** this is even simpler and requires no redeploy: publish a
`tennis` collection in Shopify admin with products tagged/metafielded
`sport: tennis`. The provider (below) picks them up.

---

## Data: the mock catalog and the Storefront API seam

All catalog access goes through **`app/lib/catalog/index.ts`** — the provider.
Routes import from here and nowhere else touches the raw data.

- `app/lib/catalog/data.ts` — the mock “database” (the 10 pickleball seed pieces
  + the tennis proof capsule). **This is the only file that hard-codes
  products.** Each field is annotated with the Shopify product field / tag /
  metafield it maps to.
- `app/lib/catalog/index.ts` — `getSports`, `getProduct`, `getProductsBySport`,
  `searchProducts`, `getRelatedProducts`, `getConfigurableProducts`, … Each is
  annotated with the **Storefront API query it corresponds to**.

**To go live:** rewrite the bodies of the provider functions to run those
GraphQL queries via `context.storefront.query` and map responses onto the
`Product` type. Delete `data.ts`. Routes, components, pricing, and the
configurator do not change.

Cart and account are session-backed mocks (`app/lib/cart/mock-cart.ts`,
`app/lib/account/mock-account.ts`) because mock.shop is read-only. Both mirror
the shape of Hydrogen’s `context.cart` and `context.customerAccount` (already
wired in `app/lib/context.ts`) so the swap is mechanical — including
`cart.checkoutUrl` → Shopify hosted checkout.

---

## Configurator pricing — and where Shah’s real prices go

Configurable pieces are a **base product**; the shopper’s choices attach to the
cart line as **line-item properties**. The client shows a live **estimate**; the
**billed truth** is computed server-side.

- **`app/lib/catalog/pricing.ts`** — the single source of truth: the pricing
  tables (metal / treatment / carat / diamond / chain surcharges) and the pure
  `computeConfiguredPrice` used by the client estimate.
- **`extensions/cart-transform/`** — the **Cart Transform Function**. It reads
  the hidden `_config` line attribute and recomputes `base + surcharges`
  server-side, so a tampered client can never change the price. Its
  `src/pricing-tables.js` is a deliberate mirror of `pricing.ts`.

### Plugging in real prices

Replace the **placeholder seed numbers** (§7 of the brief) in **both**:

1. `app/lib/catalog/pricing.ts` (the estimate), and
2. `extensions/cart-transform/src/pricing-tables.js` (the charge).

They are intentionally identical; keep them in lockstep. Base prices live on the
Shopify variants; everything additive lives in these tables. Nothing else
changes. See `extensions/cart-transform/README.md` for deploy steps
(`shopify app deploy`).

---

## Quality

- **Performance** — self-hosted fonts (preloaded), routes code-split, **Three.js
  loads only when the PDP 3D toggle is used** (its own ~lazy chunk, absent from
  the main bundle), CLS-safe reveals (opacity/transform only), no CDN.
- **SEO** — per-route title/description/canonical, OG + Twitter tags, **dynamic
  OG images** (`/og/:handle.svg`), JSON-LD (Organization + WebSite site-wide;
  Product/Offer/AggregateRating + Breadcrumb on PDPs), sitemap, robots.
- **Accessibility (WCAG 2.1 AA)** — one `<h1>` per page, skip link, visible focus
  (`:focus-visible`), labelled controls, `aria-pressed`/`role` on facets and
  options, alt/aria on imagery, reduced-motion honoured, token contrast on
  alabaster/sable.
- **Responsive** — mobile-first, no horizontal scroll at 375 / 768 / 1280; the
  header collapses to a drawer.

---

## Project layout

```
app/
  lib/catalog/     domain types, mock data, pricing (source of truth), provider seam
  lib/cart/        session-backed mock cart (mirrors Storefront cart)
  lib/account/     session-backed mock account (mirrors customer accounts)
  lib/content.ts   editorial copy (craft, reviews, static pages, sizing)
  lib/seo.ts       canonical/OG/JSON-LD helpers
  components/      Header, Footer, PieceCard, configurator/PDP parts, motion, 3D
  routes/          every route above (React Router 7 flat routes)
  styles/bejwld.css  the token system + themes + fonts + motion
extensions/
  cart-transform/  the Shopify Function that enforces configurator pricing
public/fonts/      self-hosted Playfair Display (woff2)
```

The clickable design reference this was built from lives one level up in
`../bejwld/` (a self-contained prototype). This storefront is the production
port of it.
