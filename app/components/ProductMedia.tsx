import {useEffect, useRef, useState} from 'react';
import type {Product, MetalColour, ProductView} from '~/lib/catalog';
import {productImage, productSrcSet, COLOUR_LABEL} from '~/lib/catalog';
import {PlaceholderArt} from './PlaceholderArt';

/**
 * Brilliant-Earth-style product viewer:
 *  - metal toggle (yellow / white gold) swaps the whole image set
 *  - angle gallery with a thumbnail rail (cutout · 3d · front · right · top)
 *  - hover-to-zoom on the main image (desktop), tap-to-zoom on touch
 *  - a "360°" control that cross-fades through the angles — a 4-frame montage,
 *    not a true spin (that needs a turntable render)
 *
 * Falls back to the placeholder art for pieces without real imagery.
 */
export function ProductMedia({product}: {product: Product}) {
  const dir = product.imageDir;
  const colours = product.colours ?? [];
  const views = product.views ?? [];

  const [colour, setColour] = useState<MetalColour>(colours[0] ?? 'yellow');
  const [idx, setIdx] = useState(0);
  const [spin, setSpin] = useState(false);
  const [zoom, setZoom] = useState(false);
  const activeRef = useRef<HTMLImageElement>(null);

  // Angle views only (for the pseudo-360 cross-fade).
  const angleIdx = views
    .map((v, i) => ({v, i}))
    .filter((x) => x.v !== 'cutout' && x.v !== 'single')
    .map((x) => x.i);

  useEffect(() => {
    if (!spin || angleIdx.length < 2) return;
    let k = Math.max(0, angleIdx.indexOf(idx));
    const t = setInterval(() => {
      k = (k + 1) % angleIdx.length;
      setIdx(angleIdx[k]);
    }, 240);
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
        {views.map((v, i) => (
          <img
            key={v}
            ref={i === idx ? activeRef : null}
            className={`pm-layer ${i === idx ? 'is-active' : ''}`}
            src={productImage(dir, colour, v as ProductView, 1600)}
            srcSet={productSrcSet(dir, colour, v as ProductView)}
            sizes="(max-width: 900px) 92vw, 620px"
            alt={`${product.name} — ${colour} gold, ${v} view`}
            width={1600}
            height={1600}
            loading={i === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
        ))}

        {angleIdx.length >= 2 ? (
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

      {/* Thumbnail rail */}
      <div className="pm-rail" role="tablist" aria-label="Views">
        {views.map((v, i) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-label={`${v} view`}
            className={`pm-thumb ${i === idx ? 'is-active' : ''}`}
            onClick={() => {
              setSpin(false);
              setIdx(i);
            }}
          >
            <img
              src={productImage(dir, colour, v as ProductView, 600)}
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
              onClick={() => setColour(c)}
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
