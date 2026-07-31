import type {MetalColour, ProductView} from './types';

/**
 * Product image helpers.
 *
 * Real renders live at `/public/products/<imageDir>/<colour>/<view>-<size>.webp`
 * in two responsive sizes (see the pipeline that produced them). `600` is for
 * cards/thumbnails, `1600` for the PDP main image + zoom. Everything derives
 * from the product's `imageDir`, so the catalog only stores that string.
 */

export type ImageSize = 600 | 1600;

export const COLOUR_LABEL: Record<MetalColour, string> = {
  yellow: 'Yellow gold',
  white: 'White gold',
};

/** Path to one derivative. */
export function productImage(
  dir: string,
  colour: MetalColour,
  view: ProductView,
  size: ImageSize,
): string {
  return `/products/${dir}/${colour}/${view}-${size}.webp`;
}

/** A `srcset` string across both sizes for one image. */
export function productSrcSet(
  dir: string,
  colour: MetalColour,
  view: ProductView,
): string {
  return `${productImage(dir, colour, view, 600)} 600w, ${productImage(
    dir,
    colour,
    view,
    1600,
  )} 1600w`;
}
