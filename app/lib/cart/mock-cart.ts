/**
 * Session-backed mock cart.
 *
 * WHY THIS EXISTS: with no Shopify store connected (mock.shop is a read-only
 * *catalog* endpoint and does not accept cart mutations) Hydrogen's real cart
 * handler has nothing to write to. So the demo carries its own cart in the
 * signed session cookie. It deliberately mirrors the shape and semantics of the
 * Storefront Cart API — lines with `merchandise`, `quantity`, and
 * `attributes` (line-item properties) — so the swap to the real thing is
 * mechanical.
 *
 * GOING LIVE: delete this module and use Hydrogen's `context.cart`
 * (`createCartHandler`, already wired in `app/lib/context.ts`). `addLine`'s
 * `attributes` become the cart line `attributes`; `getCheckoutUrl` returns
 * `cart.checkoutUrl`; the Cart Transform Function (`extensions/cart-transform`)
 * enforces the real price from those attributes server-side.
 */

import type {HydrogenSession} from '@shopify/hydrogen';
import {
  configToLineItemProperties,
  configToStructuredAttribute,
  computeConfiguredPrice,
  fromPrice,
} from '~/lib/catalog';
import type {PieceConfig, Product} from '~/lib/catalog';

const CART_KEY = 'bejwld_cart';

export interface CartAttribute {
  key: string;
  value: string;
}

export interface MockCartLine {
  /** Stable id: product handle + a hash of the attributes so specs merge. */
  id: string;
  handle: string;
  name: string;
  type: string;
  initial: string;
  /** Unit price in whole USD. In production this is enforced by the Function. */
  unitPrice: number;
  quantity: number;
  configurable: boolean;
  /** Line-item properties — the made-to-spec instructions. */
  attributes: CartAttribute[];
}

export interface MockCart {
  lines: MockCartLine[];
  totalQuantity: number;
  subtotal: number;
}

type Session = HydrogenSession;

function lineId(handle: string, attributes: CartAttribute[]): string {
  const sig = attributes.map((a) => `${a.key}=${a.value}`).join('|');
  // Small, stable, human-debuggable id — not security-sensitive.
  let hash = 0;
  for (let i = 0; i < sig.length; i++) {
    hash = (hash * 31 + sig.charCodeAt(i)) | 0;
  }
  return `${handle}:${(hash >>> 0).toString(36)}`;
}

function summarise(lines: MockCartLine[]): MockCart {
  return {
    lines,
    totalQuantity: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
  };
}

/** Read the current cart from the session. */
export function getCart(session: Session): MockCart {
  const lines = (session.get(CART_KEY) as MockCartLine[] | undefined) ?? [];
  return summarise(lines);
}

function save(session: Session, lines: MockCartLine[]): MockCart {
  session.set(CART_KEY, lines);
  return summarise(lines);
}

/**
 * Add a piece to the bag.
 *
 * For a configurable piece, pass its `config` (and optional `engraving`); the
 * price is computed with the shared pricing logic and the line-item properties
 * are derived from the same source, exactly as the Cart Transform Function will
 * read them.
 */
export function addLine(
  session: Session,
  product: Product,
  opts: {config?: PieceConfig; engraving?: string} = {},
): MockCart {
  const lines = getCart(session).lines.slice();

  let unitPrice: number;
  let attributes: CartAttribute[];
  if (product.configurable && opts.config) {
    unitPrice = computeConfiguredPrice(product, opts.config, opts.engraving).total;
    // Human-readable properties (for the shopper + the atelier order) plus the
    // hidden `_config` the Cart Transform Function reads to enforce the price.
    attributes = [
      ...configToLineItemProperties(product, opts.config, opts.engraving),
      configToStructuredAttribute(product, opts.config, opts.engraving),
    ];
  } else {
    unitPrice = fromPrice(product);
    attributes = product.configurable ? [{key: 'As shown', value: product.materials}] : [];
  }

  const id = lineId(product.handle, attributes);
  const existing = lines.find((l) => l.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    lines.push({
      id,
      handle: product.handle,
      name: product.name,
      type: product.type,
      initial: product.initial,
      unitPrice,
      quantity: 1,
      configurable: !!product.configurable,
      attributes,
    });
  }
  return save(session, lines);
}

/** Set a line's quantity (removes it at zero). */
export function setQuantity(session: Session, id: string, quantity: number): MockCart {
  let lines = getCart(session).lines.slice();
  if (quantity <= 0) {
    lines = lines.filter((l) => l.id !== id);
  } else {
    lines = lines.map((l) => (l.id === id ? {...l, quantity} : l));
  }
  return save(session, lines);
}

/** Remove a line entirely. */
export function removeLine(session: Session, id: string): MockCart {
  const lines = getCart(session).lines.filter((l) => l.id !== id);
  return save(session, lines);
}

/** Empty the bag. */
export function clearCart(session: Session): MockCart {
  return save(session, []);
}

/**
 * The checkout hand-off.
 *
 * In production this returns `cart.checkoutUrl` from the Storefront cart and the
 * browser is redirected to Shopify's hosted checkout — the storefront never
 * touches payment. With no store there is no real URL, so this returns null and
 * the cart UI shows the hand-off state instead.
 */
export function getCheckoutUrl(_cart: MockCart): string | null {
  return null;
}
