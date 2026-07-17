/**
 * SEO helpers — canonical/OG metadata and JSON-LD builders.
 *
 * JSON-LD is embedded through React Router's `{'script:ld+json': {...}}` meta
 * descriptor. The base URL comes from `BEJWLD_SITE_URL` (fall back to the
 * placeholder domain) so canonicals and OG images are absolute in production.
 */

import type {Product} from './catalog';
import {fromPrice} from './catalog';

export const SITE_NAME = 'bejwld';

export function siteUrl(): string {
  // Vite-inlined so it resolves in the Oxygen worker and on the client (meta
  // runs on both). Falls back to the placeholder domain.
  const fromEnv = import.meta.env?.VITE_BEJWLD_SITE_URL as string | undefined;
  return (fromEnv || 'https://bejwld.com').replace(/\/$/, '');
}

export function absolute(path: string): string {
  if (path.startsWith('http')) return path;
  return `${siteUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Dynamic OG image for a piece (SVG resource route). */
export function ogImageForProduct(handle: string): string {
  return absolute(`/og/${handle}.svg`);
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    description: 'The fine jewelry house of the sporting life.',
    url: siteUrl(),
    logo: absolute('/favicon.svg'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New York',
      addressCountry: 'US',
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl(),
  };
}

export function breadcrumbJsonLd(trail: Array<{name: string; path: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absolute(c.path),
    })),
  };
}

export function productJsonLd(
  product: Product,
  opts: {rating?: {value: number; count: number}} = {},
) {
  const price = fromPrice(product);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: product.type,
    brand: {'@type': 'Brand', name: SITE_NAME},
    material: product.materials,
    image: ogImageForProduct(product.handle),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: String(price),
      availability: 'https://schema.org/InStock',
      url: absolute(`/products/${product.handle}`),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(opts.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(opts.rating.value),
            reviewCount: String(opts.rating.count),
          },
        }
      : {}),
  };
}
