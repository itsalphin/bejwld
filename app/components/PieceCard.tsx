import {Link} from 'react-router';
import type {ProductCard} from '~/lib/catalog';
import {PlaceholderArt} from './PlaceholderArt';
import {useWishlist} from './WishlistProvider';

/**
 * The shared product card (ported from the prototype's PieceCard). Whole card
 * links to the PDP; the heart toggles the wishlist without navigating.
 */
export function PieceCard({piece}: {piece: ProductCard}) {
  const wishlist = useWishlist();
  const wished = wishlist.has(piece.handle);

  return (
    <div className="group relative flex flex-col gap-[14px]">
      <Link
        to={`/products/${piece.handle}`}
        className="relative block aspect-[4/5] overflow-hidden"
        aria-label={`${piece.name} — ${piece.type}, ${piece.priceLabel}`}
      >
        <div className="h-full w-full transition-transform duration-[600ms] ease-[cubic-bezier(.2,.6,.2,1)] group-hover:scale-[1.012]">
          <PlaceholderArt initial={piece.initial} ring={104} />
        </div>
        {piece.badge ? (
          <span className="label absolute left-[22px] top-[22px]">{piece.badge}</span>
        ) : null}
      </Link>

      <button
        type="button"
        onClick={() => wishlist.toggle(piece.handle)}
        aria-pressed={wished}
        aria-label={wished ? `Remove ${piece.name} from saved` : `Save ${piece.name}`}
        className="absolute right-[18px] top-[18px] z-10 p-1.5 text-[15px] leading-none transition-colors hover:text-gold-ink"
        style={{color: wished ? 'var(--gold-ink)' : 'var(--stone)'}}
      >
        {wished ? '♥' : '♡'}
      </button>

      <Link to={`/products/${piece.handle}`} className="flex flex-col gap-[5px]">
        <span className="label">{piece.type}</span>
        <span className="font-display text-[19px] text-sable transition-colors group-hover:text-gold-ink">
          {piece.name}
        </span>
        <span className="text-[13px] text-sable/75">{piece.priceLabel}</span>
      </Link>
    </div>
  );
}
