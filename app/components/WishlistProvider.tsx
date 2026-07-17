/**
 * Client wishlist state, persisted to localStorage.
 *
 * Wishlist is intentionally client-side for the demo: it works for everyone
 * with no store, and persists across visits. For a signed-in shopper in
 * production this becomes a customer metafield (shareable, cross-device) —
 * `getUser()` already exposes the account seam. The API here
 * (`has` / `toggle` / `count`) is stable, so that swap doesn't touch consumers.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'bejwld-wishlist';

interface WishlistContextValue {
  handles: string[];
  count: number;
  ready: boolean;
  has: (handle: string) => boolean;
  toggle: (handle: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({children}: {children: ReactNode}) {
  const [handles, setHandles] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHandles(JSON.parse(raw) as string[]);
    } catch {
      // ignore malformed storage
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setHandles(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, []);

  const toggle = useCallback(
    (handle: string) => {
      setHandles((prev) => {
        const next = prev.includes(handle)
          ? prev.filter((h) => h !== handle)
          : [...prev, handle];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      handles,
      count: handles.length,
      ready,
      has: (h) => handles.includes(h),
      toggle,
    }),
    [handles, ready, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    // Safe fallback for any component rendered outside the provider.
    return {
      handles: [],
      count: 0,
      ready: false,
      has: () => false,
      toggle: () => {},
    };
  }
  return ctx;
}
