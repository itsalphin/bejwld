import {useEffect, useRef, type ReactNode} from 'react';

/**
 * A scroll reveal — a staggered fade-and-rise as a section enters view, the
 * "jeweler turning the piece to the light" gesture. Implemented with
 * IntersectionObserver (not a heavy scroll library) so it never blocks the main
 * thread or the LCP, and it only ever animates `opacity`/`transform` so it can
 * never shift layout (protects CLS).
 *
 * Content is rendered visible by default (SSR + no-JS + reduced-motion all show
 * it immediately). We only hide-then-reveal elements that mount *below* the fold
 * and only when motion is allowed — so nothing already on screen ever flashes.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight * 0.92;
    if (alreadyInView) return; // leave visible; don't animate what's already seen

    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition =
      'opacity .9s ease, transform .9s cubic-bezier(.2,.6,.2,1)';
    if (delay) el.style.transitionDelay = `${delay}ms`;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            io.unobserve(el);
          }
        }
      },
      {threshold: 0.12},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}
