import {useEffect} from 'react';
import {useLocation} from 'react-router';

/**
 * Site-wide smooth scroll (Lenis), tuned slow and unhurried — the house feel.
 * Fully disabled under prefers-reduced-motion, and imported dynamically so the
 * library never touches SSR and stays out of the critical path. Resets to top
 * on route change.
 */
export function SmoothScroll() {
  const {pathname} = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let lenis: {raf: (t: number) => void; destroy: () => void} | null = null;
    let frame = 0;
    let cancelled = false;

    import('lenis').then(({default: Lenis}) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => 1 - Math.pow(1 - t, 3), // slow, precious settle
      });
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  // Ensure each navigation starts at the top (Lenis intercepts native scroll).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
