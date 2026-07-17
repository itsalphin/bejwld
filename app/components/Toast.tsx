import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {Link} from 'react-router';

interface ToastState {
  message: string;
  /** When true, the toast offers a link to the bag. */
  withBag?: boolean;
}

interface ToastContextValue {
  notify: (message: string, opts?: {withBag?: boolean}) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({children}: {children: ReactNode}) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string, opts?: {withBag?: boolean}) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({message, withBag: opts?.withBag});
    timer.current = setTimeout(() => setToast(null), 3600);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={{notify}}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
      >
        {toast ? (
          <div
            className="pointer-events-auto flex items-center gap-5 border border-stone bg-alabaster px-5 py-4 shadow-[0_18px_50px_-24px_rgba(38,34,30,0.5)]"
            style={{animation: 'bjFadeUp .4s ease both'}}
          >
            <span className="text-[13px] text-sable">{toast.message}</span>
            {toast.withBag ? (
              <Link
                to="/cart"
                className="whitespace-nowrap text-[11px] uppercase tracking-[0.22em] text-gold-ink hover:text-sable"
              >
                View bag
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext) ?? {notify: () => {}};
}
