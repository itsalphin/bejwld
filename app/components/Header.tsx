import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {Link, useLocation} from 'react-router';
import {RollText} from './RollText';

/** Big primary options. */
const PRIMARY = [
  {to: '/collections', label: 'Shop'},
  {to: '/customize', label: 'Customize'},
  {to: '/concierge', label: 'Concierge'},
];

/** Account-related options inside the menu (Search + Bag live in the top bar). */
const UTILITY = [
  {to: '/account', label: 'Account'},
  {to: '/wishlist', label: 'Saved'},
];

const EDITORIAL = [
  {to: '/about', label: 'About'},
  {to: '/care', label: 'Care & warranty'},
  {to: '/certificate', label: 'The certificate'},
  {to: '/contact', label: 'Contact'},
  {to: '/policies', label: 'Policies'},
];

export function Header({cartCount}: {cartCount: number}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on navigation.
  useEffect(() => setOpen(false), [location.pathname]);

  // Lock body scroll + Esc-to-close while the menu is open; restore focus after.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlayRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      toggleRef.current?.focus();
    };
  }, [open]);

  const bagLabel = cartCount ? `Bag (${cartCount})` : 'Bag (0)';

  // The wordmark is hidden on the home page (the hero carries it) — it appears
  // on every other page, and whenever the menu is open.
  const isHome = location.pathname === '/';
  const showWordmark = open || !isHome;

  // Stagger delays across the whole option list, in reading order.
  let step = 0;
  const delay = () => ({animationDelay: `${200 + step++ * 42}ms`});

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-colors duration-500 ${
          open ? 'bg-transparent text-alabaster' : 'bg-alabaster text-sable'
        }`}
        style={{animation: 'bjHeaderIn 0.9s 0.05s both'}}
      >
        <div className="relative mx-auto flex h-[84px] max-w-[1440px] items-center justify-between px-[clamp(20px,4vw,56px)]">
          {/* Brand mark, centred in the bar on the home page (in line with the
              controls). Other pages carry the BEJWLD wordmark on the left instead. */}
          {isHome && !open ? (
            <Link
              to="/"
              aria-label="bejwld home"
              onClick={() => setOpen(false)}
              className="logo-mark absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block"
            >
              <svg
                width={30}
                height={46}
                viewBox="30 6 176 268"
                fill="none"
                strokeWidth={32}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeMiterlimit={6}
                aria-hidden="true"
              >
                {/* Base mark, always in champagne. */}
                <g stroke="var(--champagne)">
                  <path d="M90,252 H52 V28 H128 L182,80 V200 L128,252 H90 Z" />
                  <path d="M58,184 L176,98" />
                </g>
                {/* Line that draws itself over the mark on hover. */}
                <g className="logo-draw" stroke="var(--sable)">
                  <path
                    style={{'--len': 700} as CSSProperties}
                    d="M90,252 H52 V28 H128 L182,80 V200 L128,252 H90 Z"
                  />
                  <path style={{'--len': 160} as CSSProperties} d="M58,184 L176,98" />
                </g>
              </svg>
            </Link>
          ) : null}
          {showWordmark ? (
            <Link
              to="/"
              aria-label="bejwld home"
              onClick={() => setOpen(false)}
              className={`font-display text-[19px] tracking-[0.22em] transition-colors duration-500 sm:text-[28px] sm:tracking-[0.34em] ${
                open ? 'text-alabaster' : 'text-sable'
              }`}
              style={{paddingLeft: '0.22em'}}
            >
              BEJWLD
            </Link>
          ) : isHome ? (
            // Mobile home: the centred mark is hidden below sm, so carry the
            // wordmark on the left here — it never collides with the controls.
            <Link
              to="/"
              aria-label="bejwld home"
              onClick={() => setOpen(false)}
              className="font-display text-[19px] tracking-[0.22em] text-sable sm:hidden"
              style={{paddingLeft: '0.22em'}}
            >
              BEJWLD
            </Link>
          ) : (
            <span aria-hidden />
          )}

          {/* Right controls — Search + Bag stay out (like store links), plus the toggle */}
          <div className="flex items-center gap-5 md:gap-6">
            <Link
              to="/search"
              className={`text-[11px] uppercase tracking-[0.22em] transition-colors ${
                open ? 'text-alabaster hover:text-alabaster/70' : 'text-sable hover:text-gold-ink'
              }`}
            >
              Search
            </Link>
            <Link
              to="/cart"
              className={`text-[11px] uppercase tracking-[0.22em] transition-colors ${
                open ? 'text-alabaster hover:text-alabaster/70' : 'text-gold-ink hover:text-sable'
              }`}
            >
              {bagLabel}
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="l1" />
              <span className="l2" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu */}
      <div
        id="site-menu"
        ref={overlayRef}
        tabIndex={-1}
        aria-hidden={!open}
        className={`menu-overlay outline-none ${open ? 'is-open' : ''}`}
      >
        <div className="menu-panel">
          {/* Upper — numbered primary options + editorial note */}
          <div className="menu-main">
            <nav aria-label="Primary" className="menu-primary">
              {PRIMARY.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="menu-link"
                  style={delay()}
                >
                  <RollText text={l.label} />
                </Link>
              ))}
            </nav>
            <aside className="menu-aside">
              <p className="menu-link quote" style={delay()}>
                Sport, made precious.
              </p>
              <p className="menu-link desc" style={delay()}>
                The fine jewelry house of the sporting life. Made to order in New York.
              </p>
              <p className="menu-link menu-eyebrow" style={delay()}>
                Est. MMXXVI · New York
              </p>
            </aside>
          </div>

          {/* Lower — quiet columns */}
          <div className="menu-foot">
            <nav aria-label="Account & bag" className="menu-group menu-sub menu-sub--utility">
              <p className="menu-link menu-eyebrow" style={delay()}>
                Your account
              </p>
              {UTILITY.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="menu-link"
                  style={delay()}
                >
                  <RollText text={l.label} />
                </Link>
              ))}
            </nav>
            <nav aria-label="The house" className="menu-group menu-sub menu-sub--house">
              <p className="menu-link menu-eyebrow" style={delay()}>
                The house
              </p>
              {EDITORIAL.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="menu-link"
                  style={delay()}
                >
                  <RollText text={l.label} />
                </Link>
              ))}
            </nav>
            <div className="menu-group menu-contact">
              <p className="menu-link menu-eyebrow" style={delay()}>
                The concierge
              </p>
              <a className="menu-link" href="mailto:concierge@bejwld.com" style={delay()}>
                <RollText text="concierge@bejwld.com" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
