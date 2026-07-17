import {useEffect, useState} from 'react';
import {RING_SIZES} from '~/lib/content';

/**
 * Interactive, printable ring + chain sizing guide (§5.5). Opens in a dialog;
 * "Print" uses the browser dialog and the print stylesheet hides the chrome so
 * the guide prints clean at 1:1 for measuring.
 */
export function SizingGuideLauncher({className}: {className?: string}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          'text-[11px] uppercase tracking-[0.2em] text-gold-ink underline-offset-4 hover:underline'
        }
      >
        Sizing guide
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sizing guide"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close sizing guide"
            className="absolute inset-0 bg-sable/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 max-h-[86vh] w-full max-w-[560px] overflow-auto border border-stone bg-alabaster p-[clamp(28px,5vw,48px)]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="label">Fit</p>
                <h2 className="mt-2 font-display text-[clamp(26px,4vw,38px)] font-medium">
                  The sizing guide
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="no-print text-[11px] uppercase tracking-[0.2em] text-gold-ink hover:text-sable"
              >
                Close
              </button>
            </div>

            <section className="mt-7">
              <h3 className="font-display text-[19px] font-medium">Ring size</h3>
              <p className="mt-2 text-[13px] text-sable/70">
                Wrap a strip of paper around the base of your finger, mark where it meets, and
                measure the length in millimetres. Match it below.
              </p>
              <table className="mt-4 w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-stone text-left">
                    <th className="py-2 font-normal text-gold-ink">US size</th>
                    <th className="py-2 font-normal text-gold-ink">Inner circumference</th>
                  </tr>
                </thead>
                <tbody>
                  {RING_SIZES.map((r) => (
                    <tr key={r.us} className="border-b border-stone/60">
                      <td className="py-2 tabular-nums">{r.us}</td>
                      <td className="py-2 tabular-nums">{r.mm.toFixed(1)} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="mt-8">
              <h3 className="font-display text-[19px] font-medium">Chain length</h3>
              <ul className="mt-3 flex flex-col gap-1.5 text-[13px] text-sable/80">
                <li>16″ — at the collarbone</li>
                <li>18″ — just below, the house default</li>
                <li>20″ — worn over knitwear</li>
              </ul>
            </section>

            <div className="no-print mt-9 flex gap-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="border border-sable px-6 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors hover:bg-sable hover:text-alabaster"
              >
                Print this guide
              </button>
              <a
                href="/concierge"
                className="border border-stone px-6 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors hover:border-sable"
              >
                Ask the concierge
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
