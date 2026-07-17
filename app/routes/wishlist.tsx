import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/wishlist';
import {getAllProducts} from '~/lib/catalog';
import {PieceCard} from '~/components/PieceCard';
import {Reveal} from '~/components/Reveal';
import {useWishlist} from '~/components/WishlistProvider';
import {useToast} from '~/components/Toast';

export const meta: Route.MetaFunction = () => [
  {title: 'Saved pieces — bejwld'},
  {name: 'robots', content: 'noindex'},
];

export async function loader(_args: Route.LoaderArgs) {
  // The wishlist itself lives client-side; the route provides the full catalog
  // and the component shows the saved subset (see WishlistProvider).
  return {all: await getAllProducts()};
}

export default function Wishlist() {
  const {all} = useLoaderData<typeof loader>();
  const wishlist = useWishlist();
  const {notify} = useToast();

  const saved = all.filter((p) => wishlist.has(p.handle));

  async function share() {
    const url = `${window.location.origin}/wishlist`;
    try {
      await navigator.clipboard.writeText(url);
      notify('A shareable link is on your clipboard.');
    } catch {
      notify('Copy this page’s address to share your saved pieces.');
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-[clamp(20px,4vw,56px)] py-[clamp(48px,6vw,88px)]">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-stone pb-6">
        <div>
          <p className="label">Kept for later</p>
          <h1 className="mt-3 font-display text-[clamp(36px,5vw,60px)] font-medium">Saved pieces</h1>
        </div>
        {wishlist.ready && saved.length ? (
          <button
            type="button"
            onClick={share}
            className="border border-stone px-6 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-sable"
          >
            Share list
          </button>
        ) : null}
      </header>

      {/* `ready` guards against a flash of the empty state before hydration. */}
      {!wishlist.ready ? (
        <div className="py-24" aria-hidden />
      ) : saved.length ? (
        <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-x-6 gap-y-11">
          {saved.map((piece, i) => (
            <Reveal key={piece.handle} delay={(i % 4) * 80}>
              <PieceCard piece={piece} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <h2 className="font-display text-[28px] font-medium">Nothing saved yet</h2>
          <p className="mx-auto mt-3 max-w-[42ch] text-[14px] text-sable/70">
            Tap the heart on any piece to keep it here. Your list is private, and yours to share when
            you choose.
          </p>
          <Link
            to="/collections"
            className="mt-8 inline-block border border-sable px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] transition-colors hover:bg-sable hover:text-alabaster"
          >
            Explore the capsule
          </Link>
        </div>
      )}
    </div>
  );
}
