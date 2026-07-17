import type {ReactNode} from 'react';
import {useLocation} from 'react-router';
import type {SportSummary} from '~/lib/catalog';
import {Header} from './Header';
import {Footer} from './Footer';
import {WishlistProvider} from './WishlistProvider';
import {ToastProvider} from './Toast';
import {SmoothScroll} from './SmoothScroll';
import {PageLoader} from './PageLoader';

interface PageLayoutProps {
  sports: SportSummary[];
  cartCount: number;
  isLoggedIn: boolean;
  children: ReactNode;
}

/**
 * The app shell. Providers wrap the whole tree so any route can read wishlist
 * state or raise a toast; the header and footer are generated from the runtime
 * sport list.
 */
export function PageLayout({sports, cartCount, children}: PageLayoutProps) {
  // Keying the wrapper on the pathname re-runs the entrance animation on every
  // route change — a soft fade-and-rise, the same unhurried gesture as the
  // scroll reveals. Respects reduced-motion via the stylesheet.
  const {pathname} = useLocation();

  return (
    <WishlistProvider>
      <ToastProvider>
        <SmoothScroll />
        <PageLoader />
        <div className="flex min-h-screen flex-col bg-alabaster text-sable">
          <Header cartCount={cartCount} />
          <main id="main" className="flex-1">
            <div key={pathname} className="page-transition">
              {children}
            </div>
          </main>
          <Footer sports={sports} />
        </div>
      </ToastProvider>
    </WishlistProvider>
  );
}
