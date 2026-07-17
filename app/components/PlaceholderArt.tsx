/**
 * Placeholder piece "photography" — a warm metal ground with the piece's Didone
 * initial inside a champagne ring. Stands in until real photography arrives, and
 * themes with the tokens (no hard-coded off-palette colours). The gradient is
 * derived from --bone so it reads correctly in both light and dark.
 */

interface PlaceholderArtProps {
  initial: string;
  /** Diameter of the inner ring in px. */
  ring?: number;
  /** Note shown at the bottom, e.g. "Photography to follow". */
  note?: string;
  className?: string;
}

export function PlaceholderArt({
  initial,
  ring = 104,
  note,
  className = '',
}: PlaceholderArtProps) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background:
          'radial-gradient(120% 90% at 30% 18%, color-mix(in srgb, var(--bone) 62%, white) 0%, var(--bone) 55%, color-mix(in srgb, var(--bone) 78%, black) 100%)',
      }}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-3 border border-stone" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex items-center justify-center rounded-full border border-champagne"
          style={{width: ring, height: ring}}
        >
          <span
            className="font-display leading-none text-champagne"
            style={{fontSize: ring * 0.42}}
          >
            {initial}
          </span>
        </div>
      </div>
      {note ? (
        <span className="label absolute inset-x-0 bottom-6 text-center">{note}</span>
      ) : null}
    </div>
  );
}
