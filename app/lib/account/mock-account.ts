/**
 * Session-backed mock account.
 *
 * A stand-in for Shopify customer accounts while there is no store. Sign-in is
 * email-only (no password — deliberately, so nothing sensitive is stored) and
 * the "session" is just an email held in the signed cookie. It exists so the
 * account, wishlist ownership, and loyalty/VIP surfaces are demonstrable.
 *
 * GOING LIVE: replace these calls with Hydrogen's `context.customerAccount`
 * (already wired in `app/lib/context.ts`) — `isLoggedIn()`, `login()`,
 * `logout()`, and the customer detail queries in
 * `app/graphql/customer-account/`. The routes read from this module in exactly
 * the shape those APIs return.
 */

import type {AppSessionLike as HydrogenSession} from '~/lib/session';

const USER_KEY = 'bejwld_user';

export interface MockUser {
  email: string;
  /** A friendly display name derived from the email local-part. */
  name: string;
  /** Loyalty tier — scaffold for the VIP / first-look programme (§5.9). */
  tier: 'Member' | 'First Look';
}

function toUser(email: string): MockUser {
  const name = email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
  return {email, name, tier: 'First Look'};
}

export function getUser(session: HydrogenSession): MockUser | null {
  const email = session.get(USER_KEY) as string | undefined;
  return email ? toUser(email) : null;
}

export function signIn(session: HydrogenSession, email: string): MockUser {
  session.set(USER_KEY, email);
  return toUser(email);
}

export function signOut(session: HydrogenSession): void {
  session.unset(USER_KEY);
}
