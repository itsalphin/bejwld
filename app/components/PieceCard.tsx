import {Link} from 'react-router';
import type {ProductCard} from '~/lib/catalog';
import {productImage, productSrcSet} from '~/lib/catalog';
import {PlaceholderArt} from './PlaceholderArt';
import {useWishlist} from './WishlistProvider';

/**
 * The shared product card (ported from the prototype's PieceCard). Whole card
 * links to the PDP; the heart toggles the wishlist without navigating.
 */
export function PieceCard({piece}: {piece: ProductCard}) {
  const wishlist = useWishlist();
  const wished = wishlist.has(piece.handle);

  const dir = piece.imageDir;
  const baseColour = piece.colours?.[0] ?? 'yellow';
  // Hover previews the other metal (both cutouts are transparent, so it always
  // blends with the page — no baked backgrounds).
  const hoverColour = piece.colours?.[1];
  // A few SKUs share their clean vendor render with a sibling; they set
  // `cardView` to a unique editorial angle. Those are full-bleed (own backdrop),
  // so we render them cover-filled with no metal hover-swap.
  const cardView = piece.cardView ?? 'cutout';
  const editorialCard = cardView !== 'cutout';

  return (
    <div className="group relative flex flex-col gap-[14px]">
      <Link
        to={`/products/${piece.handle}`}
        className="pc-media relative block aspect-[4/5] overflow-hidden bg-alabaster"
        aria-label={`${piece.name} — ${piece.type}, ${piece.priceLabel}`}
      >
        {dir && editorialCard ? (
          <img
            className="pc-img pc-img--cover"
            src={productImage(dir, baseColour, cardView, 600)}
            srcSet={productSrcSet(dir, baseColour, cardView)}
            sizes="(max-width: 640px) 45vw, 300px"
            alt={piece.name}
            width={600}
            height={600}
            loading="lazy"
            draggable={false}
          />
        ) : dir ? (
          <>
            <img
              className={`pc-img ${hoverColour ? 'pc-img--base' : ''}`}
              src={productImage(dir, baseColour, 'cutout', 600)}
              srcSet={productSrcSet(dir, baseColour, 'cutout')}
              sizes="(max-width: 640px) 45vw, 300px"
              alt={piece.name}
              width={600}
              height={600}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            {hoverColour ? (
              <img
                className="pc-img pc-img--hover"
                src={productImage(dir, hoverColour, 'cutout', 600)}
                srcSet={productSrcSet(dir, hoverColour, 'cutout')}
                sizes="(max-width: 640px) 45vw, 300px"
                alt=""
                aria-hidden
                width={600}
                height={600}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            ) : null}
          </>
        ) : (
          <div className="h-full w-full transition-transform duration-[600ms] ease-[cubic-bezier(.2,.6,.2,1)] group-hover:scale-[1.012]">
            <PlaceholderArt initial={piece.initial} ring={104} />
          </div>
        )}
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
