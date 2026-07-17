import type {Route} from './+types/og.$handle[.svg]';
import {getProduct, fromPrice, formatUSD} from '~/lib/catalog';

/**
 * Dynamic Open Graph image, per piece (§9). Rendered as SVG from the catalog so
 * every product gets an on-brand share card with no design work — the wordmark,
 * the piece name in the display face, its "From" price, and the initial in a
 * champagne ring, on alabaster.
 */
export async function loader({params}: Route.LoaderArgs) {
  const product = await getProduct(params.handle!);
  if (!product) throw new Response('Not found', {status: 404});

  const price = `${product.configurable ? 'From ' : ''}${formatUSD(fromPrice(product))}`;
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FBF9F4"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#CBBFA8"/>
  <text x="80" y="120" font-family="Didot, 'Bodoni MT', 'Playfair Display', serif" font-size="34" letter-spacing="10" fill="#26221E">BEJWLD</text>
  <text x="80" y="150" font-family="Helvetica, Arial, sans-serif" font-size="18" letter-spacing="3" fill="#8A6A2C">THE FINE JEWELRY HOUSE OF THE SPORTING LIFE</text>
  <circle cx="960" cy="330" r="120" fill="none" stroke="#B8975A"/>
  <text x="960" y="378" text-anchor="middle" font-family="Didot, 'Bodoni MT', 'Playfair Display', serif" font-size="120" fill="#B8975A">${esc(product.initial)}</text>
  <text x="80" y="360" font-family="Didot, 'Bodoni MT', 'Playfair Display', serif" font-size="72" fill="#26221E">${esc(product.name)}</text>
  <text x="80" y="410" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#26221E" opacity="0.7">${esc(product.type)} · ${esc(product.materials)}</text>
  <text x="80" y="500" font-family="Didot, 'Bodoni MT', 'Playfair Display', serif" font-size="40" fill="#8A6A2C">${esc(price)}</text>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}
