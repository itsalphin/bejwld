import {useEffect, useRef, useState} from 'react';
import type {Product, MetalColour, ProductView} from '~/lib/catalog';
import {productImage, productSrcSet, COLOUR_LABEL} from '~/lib/catalog';
import {PlaceholderArt} from './PlaceholderArt';

/**
 * Brilliant-Earth-style product viewer — a 6-image gallery per metal colour:
 *  - 3 clean product views (cutout · 3d · front) on the alabaster ground
 *  - 3 AI-generated editorial angles (threequarter · profile · detail), each on
 *    its own on-brand backdrop, shown full-bleed
 * plus a metal toggle (yellow / white gold), hover-zoom, and a 360° cross-fade
 * of the clean views. Falls back to placeholder art for pieces without imagery.
 */

// The three clean render views used in the gallery, in order.
const CLEAN: ProductView[] = ['cutout', '3d', 'front'];
// The three generated editorial angles (own backgrounds → shown full-bleed).
const EDITORIAL: ProductView[] = ['threequarter', 'profile', 'detail'];
const isEditorial = (v: ProductView) => EDITORIAL.includes(v);

export function ProductMedia({product}: {product: Product}) {
  const dir = product.imageDir;
  const colours = product.colours ?? [];
  const views = product.views ?? [];

  const [colour, setColour] = useState<MetalColour>(colours[0] ?? 'yellow');
  const [idx, setIdx] = useState(0);
  const [spin, setSpin] = useState(false);
  const [zoom, setZoom] = useState(false);
  const activeRef = useRef<HTMLImageElement>(null);

  // Gallery = up to 3 clean views that exist + the 3 editorial angles.
  const clean = CLEAN.filter((v) => views.includes(v));
  const gallery: ProductView[] = [...clean, ...EDITORIAL];

  // The 360° cross-fade only cycles the clean views (no editorial backdrops).
  const spinIdx = gallery
    .map((v, i) => ({v, i}))
    .filter((x) => !isEditorial(x.v))
    .map((x) => x.i);

  useEffect(() => {
    if (!spin || spinIdx.length < 2) return;
    let k = Math.max(0, spinIdx.indexOf(idx));
    const t = setInterval(() => {
      k = (k + 1) % spinIdx.length;
      setIdx(spinIdx[k]);
    }, 260);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin]);

  if (!dir || colours.length === 0 || views.length === 0) {
    return (
      <div className="relative aspect-square">
        <PlaceholderArt initial={product.initial} ring={150} note="Photography to follow" />
      </div>
    );
  }

  const onMove = (e: React.MouseEvent) => {
    if (!zoom || !activeRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    activeRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div className="pm">
      <div
        className={`pm-stage ${zoom ? 'is-zoom' : ''}`}
        onMouseMove={onMove}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onClick={() => setZoom((z) => !z)}
      >
        {gallery.map((v, i) => (
          <img
            key={v}
            ref={i === idx ? activeRef : null}
            className={`pm-layer ${i === idx ? 'is-active' : ''} ${
              isEditorial(v) ? 'pm-layer--fill' : ''
            }`}
            src={productImage(dir, colour, v, 1600)}
            srcSet={productSrcSet(dir, colour, v)}
            sizes="(max-width: 900px) 92vw, 620px"
            alt={`${product.name} — ${colour} gold, view ${i + 1}`}
            width={1600}
            height={1600}
            loading={i === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
        ))}

        {spinIdx.length >= 2 ? (
          <button
            type="button"
            className={`pm-spin ${spin ? 'is-on' : ''}`}
            aria-pressed={spin}
            aria-label={spin ? 'Stop rotating' : 'Rotate the piece'}
            onClick={(e) => {
              e.stopPropagation();
              setSpin((s) => !s);
            }}
          >
            360°
          </button>
        ) : null}
      </div>

      {/* Thumbnail grid — the 6 views */}
      <div className="pm-rail" role="tablist" aria-label="Views">
        {gallery.map((v, i) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-label={`View ${i + 1}`}
            className={`pm-thumb ${i === idx ? 'is-active' : ''} ${
              isEditorial(v) ? 'pm-thumb--fill' : ''
            }`}
            onClick={() => {
              setSpin(false);
              setIdx(i);
            }}
          >
            <img
              src={productImage(dir, colour, v, 600)}
              alt=""
              width={600}
              height={600}
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Metal toggle */}
      {colours.length > 1 ? (
        <div className="pm-metals" role="group" aria-label="Metal">
          {colours.map((c) => (
            <button
              key={c}
              type="button"
              className={`pm-metal ${c === colour ? 'is-active' : ''}`}
              aria-pressed={c === colour}
              onClick={() => {
                setColour(c);
              }}
            >
              <span className={`pm-swatch pm-swatch--${c}`} aria-hidden />
              {COLOUR_LABEL[c]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
