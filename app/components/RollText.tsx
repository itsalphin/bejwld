/**
 * A label that rolls letter-by-letter on hover — each character slides up and
 * an identical copy (in champagne) rolls into its place, with a small
 * incremental delay per letter so the word cascades on a diagonal (Lando-style).
 *
 * Trigger is handled in CSS (`.menu-link:hover .roll-char`). The whole word is
 * exposed to assistive tech via `aria-label`; the split characters are hidden.
 */
const NBSP = '\u00A0';

// The cascade delays each letter by `step` ms. Capping the cumulative delay keeps
// the wave from dragging on long labels ("Care & warranty", "Shipping, returns\u2026")
// so every word resolves at the same pace as the short primary options \u2014 no letter
// waits longer than MAX_DELAY (~ the longest primary word's tail).
const MAX_DELAY = 170;

export function RollText({
  text,
  step = 22,
  maxDelay = MAX_DELAY,
}: {
  text: string;
  step?: number;
  maxDelay?: number;
}) {
  const chars = [...text];
  return (
    <span className="roll" aria-label={text}>
      <span aria-hidden="true" className="roll-chars">
        {chars.map((ch, i) => {
          const glyph = ch === ' ' ? NBSP : ch;
          return (
            <span className="roll-char" key={i}>
              <span
                data-char={glyph}
                style={{transitionDelay: `${Math.min(i * step, maxDelay)}ms`}}
              >
                {glyph}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
