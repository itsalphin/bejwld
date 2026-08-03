import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getProduct,
  getRelatedProducts,
  getSports,
  fromPrice,
  formatUSD,
  productImage,
  productSrcSet,
} from '~/lib/catalog';
import {REVIEWS, RATING, TRUST_ITEMS} from '~/lib/content';
import {
  productJsonLd,
  breadcrumbJsonLd,
  ogImageForProduct,
  absolute,
} from '~/lib/seo';
import {ProductMedia} from '~/components/ProductMedia';
import {AddToBag} from '~/components/AddToBag';
import {SizingGuideLauncher} from '~/components/SizingGuide';
import {PieceCard} from '~/components/PieceCard';
import {Reveal} from '~/components/Reveal';
import {useWishlist} from '~/components/WishlistProvider';


export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.product) return [{title: 'Piece not found — bejwld'}];
  const {product} = data;
  const priceLabel = `${product.configurable ? 'From ' : ''}${formatUSD(data.priceFrom)}`;
  const description = `${product.description} ${product.materials}. ${priceLabel}.`;
  return [
    {title: `${product.name} — bejwld`},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: absolute(`/products/${product.handle}`)},
    // Preload the LCP hero (the cutout, always the first grid image) so it starts
    // downloading before the component mounts — responsive, matches the <img> exactly.
    ...(product.imageDir
      ? [
          {
            tagName: 'link',
            rel: 'preload',
            as: 'image',
            href: productImage(product.imageDir, product.colours?.[0] ?? 'yellow', 'cutout', 600),
            imageSrcSet: productSrcSet(product.imageDir, product.colours?.[0] ?? 'yellow', 'cutout'),
            imageSizes: '(max-width: 900px) 46vw, 300px',
            fetchPriority: 'high',
          },
        ]
      : []),
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: `${product.name} — bejwld`},
    {property: 'og:description', content: description},
    {property: 'og:image', content: ogImageForProduct(product.handle)},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: `${product.name} — bejwld`},
    {name: 'twitter:image', content: ogImageForProduct(product.handle)},
    {'script:ld+json': productJsonLd(product, {rating: RATING})},
    {
      'script:ld+json': breadcrumbJsonLd([
        {name: 'Home', path: '/'},
        {name: data.sportLabel, path: `/collections/${product.sport}`},
        {name: product.name, path: `/products/${product.handle}`},
      ]),
    },
  ];
};

export async function loader({params}: Route.LoaderArgs) {
  const product = await getProduct(params.handle!);
  if (!product) {
    throw new Response('Piece not found', {status: 404});
  }
  const [related, sports] = await Promise.all([
    getRelatedProducts(product, 2),
    getSports(),
  ]);
  const sportLabel = sports.find((s) => s.sport === product.sport)?.label ?? product.sport;

  return {product, related, sportLabel, priceFrom: fromPrice(product)};
}

export default function ProductPage() {
  const {product, related, sportLabel, priceFrom} = useLoaderData<typeof loader>();
  const wishlist = useWishlist();
  const wished = wishlist.has(product.handle);
  const priceLabel = `${product.configurable ? 'From ' : ''}${formatUSD(priceFrom)}`;

  return (
    <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)] py-[clamp(32px,4vw,56px)]">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-sable/60"
      >
        <Link to="/" className="hover:text-gold-ink">
          Home
        </Link>
        <span aria-hidden>·</span>
        <Link to={`/collections/${product.sport}`} className="capitalize hover:text-gold-ink">
          {sportLabel}
        </Link>
        <span aria-hidden>·</span>
        <span className="text-sable">{product.name}</span>
      </nav>

      <div className="grid gap-[clamp(32px,5vw,72px)] lg:grid-cols-2">
        <div>
          <ProductMedia product={product} />
        </div>

        {/* Details */}
        <div className="max-w-[46ch] lg:sticky lg:top-[92px] lg:self-start">
          <p className="label">{product.type}</p>
          <h1 className="mt-3 font-display text-[clamp(34px,4.4vw,56px)] font-medium leading-[1.08]">
            {product.name}
          </h1>
          <p className="mt-4 font-display text-[24px] text-gold-ink">{priceLabel}</p>
          <p className="mt-2 text-[13px] text-sable/70">{product.materials}</p>

          <p className="mt-7 text-[15px] leading-[1.7] text-sable/85">{product.description}</p>

          <div className="mt-9 flex flex-col gap-3">
            {product.configurable ? (
              <Link
                to={`/customize/${product.handle}`}
                className="w-full border border-laurel bg-laurel px-8 py-4 text-center text-[11px] uppercase tracking-[0.24em] text-alabaster transition-opacity hover:opacity-90"
              >
                Customize this piece
              </Link>
            ) : null}
            <AddToBag product={product} variant={product.configurable ? 'ink' : 'solid'}>
              Add to bag — {formatUSD(priceFrom)}
            </AddToBag>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => wishlist.toggle(product.handle)}
                aria-pressed={wished}
                className="text-[11px] uppercase tracking-[0.2em] text-gold-ink hover:text-sable"
              >
                {wished ? 'Saved ♥' : 'Save to wishlist ♡'}
              </button>
              <SizingGuideLauncher />
            </div>
          </div>

          {/* Trust row */}
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-stone pt-7">
            {TRUST_ITEMS.map((t) => (
              <div key={t.h}>
                <dt className="label mb-1">{t.h}</dt>
                <dd className="text-[13px] text-sable/75">{t.p}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Reviews */}
      <section aria-labelledby="reviews" className="mt-[clamp(64px,9vw,120px)]">
        <div className="flex items-baseline justify-between border-t border-stone pt-7">
          <h2 id="reviews" className="font-display text-[clamp(24px,3vw,34px)] font-medium">
            From the people who wear it
          </h2>
          <span className="label">
            ★ {RATING.value} · {RATING.count} reviews
          </span>
        </div>
        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
          {REVIEWS.map((r, i) => (
            <Reveal key={i} delay={i * 80} className="border border-stone p-7">
              <div className="flex items-center gap-3">
                <span className="text-champagne" aria-label={`${r.stars} out of 5`}>
                  {'★'.repeat(r.stars)}
                  <span className="text-stone">{'★'.repeat(5 - r.stars)}</span>
                </span>
                {/* Customer photo placeholder — the real feed drives AggregateRating */}
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-stone bg-bone text-[10px] text-champagne">
                  {r.who.charAt(0)}
                </span>
              </div>
              <p className="mt-4 text-[14px] leading-[1.65] text-sable/85">{r.text}</p>
              <p className="mt-4 label">{r.who}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Complete the set */}
      {related.length ? (
        <section className="mt-[clamp(56px,8vw,110px)]">
          <div className="mb-8 flex items-baseline justify-between border-t border-stone pt-7">
            <h2 className="font-display text-[clamp(24px,3vw,34px)] font-medium">
              Complete the set
            </h2>
            <Link to={`/collections/${product.sport}`} className="label hover:text-sable">
              All {sportLabel}
            </Link>
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
