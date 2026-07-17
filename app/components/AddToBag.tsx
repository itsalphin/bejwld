import {useEffect, useRef, type ReactNode} from 'react';
import {useFetcher} from 'react-router';
import {Button} from './Button';
import {useToast} from './Toast';
import type {PieceConfig, Product} from '~/lib/catalog';

/**
 * Add-to-bag, used by the PDP, the configurator, cross-sell, and the wishlist.
 * Posts to the `/cart` action via a fetcher (no navigation), raising a toast on
 * success. For a configured piece, `config` (+ optional `engraving`) is sent so
 * the server computes the price and writes the line-item properties.
 */
export function AddToBag({
  product,
  config,
  engraving,
  children,
  variant = 'ink',
  className,
}: {
  product: Pick<Product, 'handle' | 'name'>;
  config?: PieceConfig;
  engraving?: string;
  children: ReactNode;
  variant?: 'solid' | 'ink' | 'quiet';
  className?: string;
}) {
  const fetcher = useFetcher<{ok: boolean; message: string}>();
  const {notify} = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (fetcher.state !== 'idle') {
      handled.current = false;
      return;
    }
    if (fetcher.data?.ok && !handled.current) {
      handled.current = true;
      notify(fetcher.data.message, {withBag: true});
    }
  }, [fetcher.state, fetcher.data, notify]);

  const busy = fetcher.state !== 'idle';

  return (
    <fetcher.Form method="post" action="/cart" className={className}>
      <input type="hidden" name="intent" value="add" />
      <input type="hidden" name="handle" value={product.handle} />
      {config ? <input type="hidden" name="config" value={JSON.stringify(config)} /> : null}
      {engraving ? <input type="hidden" name="engraving" value={engraving} /> : null}
      <Button type="submit" variant={variant} disabled={busy} className="w-full">
        {busy ? 'Adding…' : children}
      </Button>
    </fetcher.Form>
  );
}
