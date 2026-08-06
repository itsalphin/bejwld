import {useState} from 'react';
import {Link} from 'react-router';
import type {SportSummary} from '~/lib/catalog';
import {RollText} from './RollText';

const colLabel = 'label mb-4 block';
// The roll handles the hover treatment (letters roll up to champagne), so no
// colour-transition here. Title-casing is done in JS — a `capitalize` class would
// uppercase every letter once RollText splits the label into per-letter spans.
const colLink = 'roll-link text-[13px] text-sable';

/** Title-case a label for display ("care & warranty" → "Care & Warranty"). */
const titleCase = (t: string) => t.replace(/\b\w/g, (c) => c.toUpperCase());

function Newsletter() {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState('');

  // In production this posts to a route action → Shopify customer / marketing
  // consent. Kept client-only here; the copy never manufactures urgency.
  return (
    <div className="mt-[26px]">
      <p className="label mb-[10px]">First look, quietly</p>
      {done ? (
        <p className="font-display text-[16px] italic text-gold-ink">
          Welcome to the house list.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) setDone(true);
          }}
          className="flex max-w-[340px]"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            aria-label="Email for the house list"
            className="min-w-0 flex-1 border border-r-0 border-stone bg-alabaster px-[14px] py-3 text-[13px] text-sable focus:border-champagne focus:outline-none"
          />
          <button
            type="submit"
            className="cursor-pointer border border-sable bg-sable px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-alabaster"
          >
            Join
          </button>
        </form>
      )}
    </div>
  );
}

export function Footer({sports}: {sports: SportSummary[]}) {
  return (
    <footer className="mt-[clamp(40px,6vw,80px)] border-t border-stone">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-11 px-[clamp(20px,4vw,56px)] py-[clamp(56px,7vw,90px)]">
        <div>
          <p className="font-display text-[19px] tracking-[0.3em]">BE<span className="wm-j">J</span>WLD</p>
          <p className="mt-4 max-w-[34ch] text-[13px] text-sable/70">
            The fine jewelry house of the sporting life. Made to order in New York.
          </p>
          <Newsletter />
        </div>

        <nav aria-label="Shop">
          <p className={colLabel}>Shop</p>
          <div className="flex flex-col items-start gap-[10px]">
            {sports.map((s) => (
              <Link key={s.sport} to={`/collections/${s.sport}`} className={colLink}>
                <RollText text={titleCase(s.label)} />
              </Link>
            ))}
            <Link to="/customize" className={colLink}>
              <RollText text="Customize" />
            </Link>
            <Link to="/search" className={colLink}>
              <RollText text="Search" />
            </Link>
          </div>
        </nav>

        <nav aria-label="The house">
          <p className={colLabel}>The house</p>
          <div className="flex flex-col items-start gap-[10px]">
            <Link to="/about" className={colLink}>
              <RollText text="About Bejwld" />
            </Link>
            <Link to="/care" className={colLink}>
              <RollText text="Care & Warranty" />
            </Link>
            <Link to="/certificate" className={colLink}>
              <RollText text="The Certificate" />
            </Link>
            <Link to="/concierge" className={colLink}>
              <RollText text="Concierge" />
            </Link>
          </div>
        </nav>

        <nav aria-label="Client care">
          <p className={colLabel}>Client care</p>
          <div className="flex flex-col items-start gap-[10px]">
            <Link to="/account" className={colLink}>
              <RollText text="Account" />
            </Link>
            <Link to="/wishlist" className={colLink}>
              <RollText text="Saved Pieces" />
            </Link>
            <Link to="/policies" className={colLink}>
              <RollText text="Shipping, Returns & Policies" />
            </Link>
            <Link to="/contact" className={colLink}>
              <RollText text="Contact" />
            </Link>
          </div>
        </nav>
      </div>

      <div className="border-t border-stone">
        <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-4 px-[clamp(20px,4vw,56px)] py-5 text-[11px] uppercase tracking-[0.14em] text-gold-ink">
          <span>© MMXXVI bejwld, New York</span>
          <span>Every piece numbered &amp; certified</span>
        </div>
      </div>
    </footer>
  );
}
