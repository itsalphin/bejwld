import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {useLocation, useNavigation} from 'react-router';

/**
 * Page-transition loader. On any client navigation the bejwld logo pops in over
 * a full-screen ground, then ZOOMS UP to fill the screen, and the loader fades
 * out to reveal the new page (Lando-style).
 *
 *   enter  — logo pops/draws in at its small size            (ENTER_MS)
 *   zoom   — logo scales up to fill the screen, loader fades  (ZOOM_MS)
 *   idle   — hidden, new page shown
 *
 * Driven by React Router's navigation state; never shows on the initial page
 * load — only on route changes. The phases run on fixed timers so the full
 * sequence always plays even when a (mock-data) load resolves instantly.
 */
const ENTER_MS = 800;
const ZOOM_MS = 750;

// Routes that switch in plainly, with no loading sequence — the utility pages,
// plus product pages (opening a piece should feel immediate).
const SKIP_PREFIXES = ['/search', '/cart', '/products'];

// Leaving a product page is also plain, so browsing a collection — piece, back,
// next piece — stays an uninterrupted loop rather than replaying the loader.
const SKIP_ORIGINS = ['/products'];

const matches = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(p + '/'));

type Phase = 'idle' | 'enter' | 'zoom';

export function PageLoader() {
  const navigation = useNavigation();
  const location = useLocation();
  const [phase, setPhase] = useState<Phase>('idle');
  const prevState = useRef(navigation.state);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const was = prevState.current;
    prevState.current = navigation.state;
    // A navigation just started (idle → loading/submitting): run the sequence,
    // unless either end of the trip is a route that should switch plainly.
    // `location` is still the page we're leaving while the navigation is in flight.
    const dest = navigation.location?.pathname ?? '';
    const skip = matches(dest, SKIP_PREFIXES) || matches(location.pathname, SKIP_ORIGINS);
    if (was === 'idle' && navigation.state !== 'idle' && !skip) {
      timers.current.forEach(clearTimeout);
      setPhase('enter');
      timers.current = [
        setTimeout(() => setPhase('zoom'), ENTER_MS),
        setTimeout(() => setPhase('idle'), ENTER_MS + ZOOM_MS),
      ];
    }
  }, [navigation.state]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const active = phase !== 'idle';
  return (
    <div
      className={`page-loader ${active ? 'is-loading' : ''} ${
        phase === 'zoom' ? 'is-zooming' : ''
      }`}
      role="status"
      aria-hidden={!active}
      aria-label="Loading"
    >
      <div className="page-loader__logo">
        <svg
          width={50}
          height={76}
          viewBox="30 6 176 268"
          fill="none"
          stroke="var(--champagne)"
          strokeWidth="32"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit={6}
          aria-hidden="true"
        >
          <path
            id="ld-p1"
            style={{'--len': 700} as CSSProperties}
            d="M90,252 H52 V28 H128 L182,80 V200 L128,252 H90 Z"
          />
          <path
            id="ld-p2"
            style={{'--len': 160} as CSSProperties}
            d="M58,184 L176,98"
          />
        </svg>
      </div>
      <span className="page-loader__cap">Loading</span>

      {/* ZOOM phase — "reveal through the logo": a full-screen champagne field
          with a B-shaped window (the logo's own silhouette) that grows from
          where the logo sat until it covers the viewport, so the new page is
          revealed THROUGH the logo. The window is a hole punched in the mask;
          the loader's ground goes transparent so it shows the page, not itself. */}
      <svg
        className="page-loader__reveal"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <mask id="bj-reveal-mask">
            <rect width="1000" height="1000" fill="#fff" />
            <g className="bj-reveal-grow">
              <path
                d="M90,252 H52 V28 H128 L182,80 V200 L128,252 H90 Z"
                fill="#000"
                transform="translate(383,360)"
              />
            </g>
          </mask>
        </defs>
        <rect
          width="1000"
          height="1000"
          fill="var(--champagne)"
          mask="url(#bj-reveal-mask)"
        />
      </svg>
    </div>
  );
}
