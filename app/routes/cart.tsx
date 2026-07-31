import {useEffect, useRef} from 'react';
import {data, useFetcher, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/cart';
import {
  getCart,
  addLine,
  setQuantity,
  removeLine,
  clearCart,
} from '~/lib/cart/mock-cart';
import {getProduct, getCompleteTheSet, formatUSD, defaultConfig} from '~/lib/catalog';
import type {PieceConfig} from '~/lib/catalog';
import {PieceCard} from '~/components/PieceCard';
import {Reveal} from '~/components/Reveal';
import {useToast} from '~/components/Toast';

export const meta: Route.MetaFunction = () => [{title: 'The bag — bejwld'}];

export async function loader({context}: Route.LoaderArgs) {
  const cart = getCart(context.session);
  const related = await getCompleteTheSet(cart.lines.map((l) => l.handle), 3);
  // Don't ship internal attributes (e.g. `_config`, read only by the pricing
  // Function) to the client.
  const clientCart = {
    ...cart,
    lines: cart.lines.map((l) => ({
      ...l,
      attributes: l.attributes.filter((a) => !a.key.startsWith('_')),
    })),
  };
  return {cart: clientCart, related};
}

export async function action({request, context}: Route.ActionArgs) {
  const {session} = context;
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  switch (intent) {
    case 'add': {
      const handle = String(form.get('handle') ?? '');
      const product = await getProduct(handle);
      if (!product) return data({ok: false, message: 'That piece is unavailable.'}, {status: 404});

      let config: PieceConfig | undefined;
      const rawConfig = form.get('config');
      if (rawConfig) {
        try {
          config = {
            ...defaultConfig(),
            ...(JSON.parse(String(rawConfig)) as Partial<PieceConfig>),
          };
        } catch {
          config = undefined;
        }
      }
      const engraving = form.get('engraving') ? String(form.get('engraving')) : undefined;
      addLine(session, product, {config, engraving});
      return data({ok: true, message: `${product.name} is in your bag.`});
    }
    case 'setqty': {
      const id = String(form.get('id') ?? '');
      const quantity = Number(form.get('quantity') ?? 1);
      setQuantity(session, id, quantity);
      return data({ok: true, message: 'Bag updated.'});
    }
    case 'remove': {
      removeLine(session, String(form.get('id') ?? ''));
      return data({ok: true, message: 'Removed from your bag.'});
    }
    case 'clear': {
      clearCart(session);
      return data({ok: true, message: 'Your bag is empty.'});
    }
    case 'checkout': {
      // In production: read `cart.checkoutUrl` from the Storefront cart and
      // `throw redirect(checkoutUrl)` to Shopify's hosted checkout. No store
      // here, so we signal the hand-off and the UI explains it.
      const cart = getCart(session);
      return data({ok: true, handoff: true, itemCount: cart.totalQuantity});
    }
    default:
      return data({ok: false, message: 'Unknown action.'}, {status: 400});
  }
}

function QtyStepper({id, quantity}: {id: string; quantity: number}) {
  const fetcher = useFetcher();
  const optimistic = fetcher.formData
    ? Number(fetcher.formData.get('quantity'))
    : quantity;
  return (
    <div className="inline-flex items-center border border-stone">
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="setqty" />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="quantity" value={Math.max(0, optimistic - 1)} />
        <button
          type="submit"
          aria-label="Decrease quantity"
          className="px-3 py-1.5 text-sable transition-colors hover:text-gold-ink"
        >
          −
        </button>
      </fetcher.Form>
      <span className="min-w-[2ch] text-center text-[13px] tabular-nums">{optimistic}</span>
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="setqty" />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="quantity" value={optimistic + 1} />
        <button
          type="submit"
          aria-label="Increase quantity"
          className="px-3 py-1.5 text-sable transition-colors hover:text-gold-ink"
        >
          +
        </button>
      </fetcher.Form>
    </div>
  );
}

export default function CartRoute() {
  const {cart, related} = useLoaderData<typeof loader>();
  const checkout = useFetcher();
  const {notify} = useToast();
  const notified = useRef(false);

  // The checkout hand-off. With no store there is no real checkoutUrl, so we
  // explain the production behaviour rather than fake a payment page.
  useEffect(() => {
    if (checkout.state === 'idle' && checkout.data && !notified.current) {
      notified.current = true;
      notify(
        'In production this hands off to Shopify hosted checkout via cart.checkoutUrl.',
      );
    }
    if (checkout.state !== 'idle') notified.current = false;
  }, [checkout.state, checkout.data, notify]);

  return (
    <div className="mx-auto max-w-[1200px] px-[clamp(20px,4vw,56px)] py-[clamp(48px,6vw,88px)]">
      <header className="border-b border-stone pb-6">
        <p className="label">Your selection</p>
        <h1 className="mt-3 font-display text-[clamp(36px,5vw,60px)] font-medium">The bag</h1>
      </header>

      {cart.lines.length === 0 ? (
        <div className="py-24 text-center">
          <h2 className="font-display text-[28px] font-medium">Nothing here yet</h2>
          <p className="mx-auto mt-3 max-w-[40ch] text-[14px] text-sable/70">
            The pieces you add will wait for you here. Begin with the capsule, or compose something
            of your own.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/collections"
              className="border border-sable px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] transition-colors hover:bg-sable hover:text-alabaster"
            >
              Explore the capsule
            </Link>
            <Link
              to="/customize"
              className="border border-stone px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] transition-colors hover:border-sable"
            >
              Customize a piece
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_360px]">
          {/* Lines */}
          <div className="flex flex-col divide-y divide-stone">
            {cart.lines.map((line) => (
              <div key={line.id} className="flex gap-5 py-7 first:pt-0">
                <Link
                  to={`/products/${line.handle}`}
                  className="flex h-[104px] w-[84px] shrink-0 items-center justify-center overflow-hidden border border-stone bg-alabaster"
                  aria-hidden
                >
                  {line.image ? (
                    <img
                      src={line.image}
                      alt=""
                      width={84}
                      height={104}
                      className="h-full w-full object-contain p-[10%]"
                      draggable={false}
                    />
                  ) : (
                    <span className="font-display text-[34px] text-champagne">{line.initial}</span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="label">{line.type}</p>
                      <Link
                        to={`/products/${line.handle}`}
                        className="font-display text-[19px] text-sable hover:text-gold-ink"
                      >
                        {line.name}
                      </Link>
                    </div>
                    <span className="whitespace-nowrap text-[14px]">
                      {formatUSD(line.unitPrice * line.quantity)}
                    </span>
                  </div>

                  {(() => {
                    // Hide internal attributes (e.g. the `_config` the pricing
                    // Function reads) from the shopper.
                    const shown = line.attributes.filter((a) => !a.key.startsWith('_'));
                    return shown.length ? (
                      <ul className="mt-2 flex flex-col gap-0.5 text-[12px] text-sable/65">
                        {shown.map((a) => (
                          <li key={a.key}>
                            {a.key} · {a.value}
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}

                  <div className="mt-4 flex items-center gap-5">
                    <QtyStepper id={line.id} quantity={line.quantity} />
                    <RemoveButton id={line.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="h-fit border border-stone p-7 lg:sticky lg:top-[92px]">
            <div className="flex items-baseline justify-between">
              <span className="label">Subtotal</span>
              <span className="font-display text-[22px]">{formatUSD(cart.subtotal)}</span>
            </div>
            <p className="mt-3 text-[12px] text-sable/65">
              Duties and shipping are complimentary. Configured pieces are priced by the atelier —
              the Cart Transform Function is the source of truth.
            </p>
            <checkout.Form method="post" action="/cart">
              <input type="hidden" name="intent" value="checkout" />
              <button
                type="submit"
                className="mt-6 w-full bg-laurel px-8 py-4 text-[11px] uppercase tracking-[0.24em] text-alabaster transition-opacity hover:opacity-90"
              >
                Proceed to checkout
              </button>
            </checkout.Form>
            <Link
              to="/collections"
              className="mt-4 block text-center text-[11px] uppercase tracking-[0.2em] text-gold-ink hover:text-sable"
            >
              Continue browsing
            </Link>
          </aside>
        </div>
      )}

      {/* Complete the set */}
      {related.length ? (
        <section className="mt-[clamp(56px,8vw,110px)]">
          <div className="mb-8 flex items-baseline justify-between border-t border-stone pt-6">
            <h2 className="font-display text-[clamp(24px,3vw,34px)] font-medium">
              Complete the set
            </h2>
            <span className="label">From the house</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-x-6 gap-y-11">
            {related.map((piece, i) => (
              <Reveal key={piece.handle} delay={i * 80}>
                <PieceCard piece={piece} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function RemoveButton({id}: {id: string}) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="remove" />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-[11px] uppercase tracking-[0.18em] text-gold-ink underline-offset-4 hover:underline"
      >
        Remove
      </button>
    </fetcher.Form>
  );
}
