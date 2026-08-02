import {useState} from 'react';
import type {Product, MetalColour, ProductView} from '~/lib/catalog';
import {productImage, productSrcSet, COLOUR_LABEL} from '~/lib/catalog';
import {PlaceholderArt} from './PlaceholderArt';

/**
 * Brilliant-Earth-style product gallery — every view laid out at once in a
 * 2-column grid (no click-to-swap, no zoom):
 *  - 3 clean product views (cutout · 3d · front) on the alabaster ground
 *  - 3 AI-generated editorial angles (threequarter · profile · detail), each on
 *    its own on-brand backdrop, shown full-bleed
 * plus a metal toggle (yellow / white gold) that swaps every image at once.
 * Falls back to placeholder art for pieces without imagery.
 */

// One clean render (the transparent hero on the pale ground); everything else in
// the grid is an editorial angle on a warm, in-palette backdrop that blends into
// the site — so each PDP reads as 1 clean + 5 blended shots.
const CLEAN: ProductView[] = ['cutout'];
// Five generated editorial angles (own backdrops → shown full-bleed): the v2
// blended set (linen/travertine/silk) plus the two batch-1 backdrops that blend
// (champagne sweep, warm marble). The dark batch-1 `detail` was dropped.
const EDITORIAL: ProductView[] = ['threequarter', 'profile', 'detail', 'champagne', 'marble'];
const isEditorial = (v: ProductView) => EDITORIAL.includes(v);

/**
 * A deterministic Fisher-Yates shuffle seeded from the product handle. Each
 * piece gets its own stable order, and — crucially — the server and the client
 * produce the same order, so there is no hydration mismatch (unlike Math.random).
 */
function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ProductMedia({product}: {product: Product}) {
  const dir = product.imageDir;
  const colours = product.colours ?? [];
  const views = product.views ?? [];

  const [colour, setColour] = useState<MetalColour>(colours[0] ?? 'yellow');

  if (!dir || colours.length === 0 || views.length === 0) {
    return (
      <div className="relative aspect-square">
        <PlaceholderArt initial={product.initial} ring={150} note="Photography to follow" />
      </div>
    );
  }

  // Gallery = 3 clean views that exist + the 3 editorial angles. The hero is
  // pinned first (cutout by default, or a `cardView` override for shared-render
  // SKUs); the rest are shuffled per-product so each opens on a fresh mix.
  const clean = CLEAN.filter((v) => views.includes(v));
  const all: ProductView[] = [...clean, ...EDITORIAL];
  const hero = product.cardView ?? all[0];
  const rest = all.filter((v) => v !== hero);
  const gallery: ProductView[] = [hero, ...seededShuffle(rest, product.handle)];

  return (
    <div className="pm">
      {/* Metal toggle — swaps every image in the grid at once */}
      {colours.length > 1 ? (
        <div className="pm-metals" role="group" aria-label="Metal">
          {colours.map((c) => (
            <button
              key={c}
              type="button"
              className={`pm-metal ${c === colour ? 'is-active' : ''}`}
              aria-pressed={c === colour}
              onClick={() => setColour(c)}
            >
              <span className={`pm-swatch pm-swatch--${c}`} aria-hidden />
              {COLOUR_LABEL[c]}
            </button>
          ))}
        </div>
      ) : null}

      {/* Static 2-column grid — all views visible at once */}
      <div className="pm-grid">
        {gallery.map((v, i) => (
          <figure key={v} className={`pm-cell ${isEditorial(v) ? 'pm-cell--fill' : ''}`}>
            <img
              src={productImage(dir, colour, v, 1600)}
              srcSet={productSrcSet(dir, colour, v)}
              sizes="(max-width: 900px) 46vw, 300px"
              alt={`${product.name} — ${colour} gold, view ${i + 1}`}
              width={1600}
              height={1600}
              loading={i < 2 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
