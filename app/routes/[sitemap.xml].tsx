import type {Route} from './+types/[sitemap.xml]';
import {getAllProducts, getSports} from '~/lib/catalog';
import {siteUrl} from '~/lib/seo';

/**
 * A self-contained sitemap generated from the catalog (§9). When the store is
 * live you can switch back to Hydrogen's `getSitemapIndex`/`getSitemap`, which
 * paginate directly from the Storefront API.
 */
export async function loader(_args: Route.LoaderArgs) {
  const base = siteUrl();
  const [products, sports] = await Promise.all([getAllProducts(), getSports()]);

  const staticPaths = [
    '/',
    '/collections',
    '/customize',
    '/concierge',
    '/about',
    '/care',
    '/certificate',
    '/contact',
    '/policies',
  ];

  const urls = [
    ...staticPaths,
    ...sports.map((s) => `/collections/${s.sport}`),
    ...products.map((p) => `/products/${p.handle}`),
    ...products.filter((p) => p.configurable).map((p) => `/customize/${p.handle}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => `  <url><loc>${base}${path}</loc><changefreq>weekly</changefreq></url>`)
  .join('\n')}
</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}
