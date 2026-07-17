import {useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import bejwldStyles from '~/styles/bejwld.css?url';
import {getSports} from '~/lib/catalog';
import {getCart} from '~/lib/cart/mock-cart';
import {getUser} from '~/lib/account/mock-account';
import {organizationJsonLd, websiteJsonLd} from '~/lib/seo';
import {PageLayout} from '~/components/PageLayout';
import {ErrorScreen} from '~/components/ErrorScreen';

export type RootLoader = typeof loader;

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  // Revalidate after any mutation (add to bag, sign in, theme…) so the header
  // count and layout stay in sync.
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return defaultShouldRevalidate;
};

export function links() {
  return [
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
    // Preload the display weights used above the fold (wordmark + tagline).
    {
      rel: 'preload',
      href: '/fonts/playfair-500-normal.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: '/fonts/playfair-500-italic.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
    {rel: 'stylesheet', href: bejwldStyles},
  ];
}

export async function loader({context}: Route.LoaderArgs) {
  const {session} = context;
  // Nav, home rail, and /collections are all generated from this list — the
  // set of sports the house currently sells, derived at runtime. Never hard-coded.
  const sports = await getSports();
  const cart = getCart(session);
  const user = getUser(session);

  return {
    sports,
    cartCount: cart.totalQuantity,
    isLoggedIn: Boolean(user),
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#FBF9F4" />
        {/* The browser clears the nonce content attribute after applying CSP,
            so React sees a server/client mismatch on these inline scripts —
            benign, so suppress the hydration warning. */}
        {/* Site-wide structured data (Organization + WebSite). */}
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{__html: JSON.stringify(organizationJsonLd())}}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{__html: JSON.stringify(websiteJsonLd())}}
        />
        <Meta />
        <Links />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <PageLayout {...data}>
      <Outlet />
    </PageLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = 'Something at the atelier went quiet.';
  let status = 500;

  if (isRouteErrorResponse(error)) {
    message =
      error.status === 404
        ? 'We could not find that piece.'
        : (error.data?.message ?? error.data ?? message);
    status = error.status;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return <ErrorScreen status={status} message={message} />;
}
