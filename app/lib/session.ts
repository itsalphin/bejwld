import {
  createCookieSessionStorage,
  type SessionStorage,
  type Session,
} from 'react-router';

/**
 * Cookie-backed session for the Vercel demo.
 *
 * The Hydrogen twin has its session injected as `context.session` by the Oxygen
 * worker. Vercel's React Router preset owns the server, so there's no
 * `getLoadContext` hook — loaders/actions build the session from the `request`
 * instead (see `getSession`), and mutating actions commit the cookie themselves
 * (see `commitHeaders`). Everything below is plain React Router, no Shopify.
 */

/** The session surface the mock cart + account rely on. */
export interface AppSessionLike {
  isPending: boolean;
  get: Session['get'];
  set: Session['set'];
  unset: Session['unset'];
  has: Session['has'];
  flash: Session['flash'];
  commit(): Promise<string>;
  destroy(): Promise<string>;
}

export class AppSession implements AppSessionLike {
  public isPending = false;

  #sessionStorage: SessionStorage;
  #session: Session;

  constructor(sessionStorage: SessionStorage, session: Session) {
    this.#sessionStorage = sessionStorage;
    this.#session = session;
  }

  static async init(request: Request, secrets: string[]) {
    const storage = createCookieSessionStorage({
      cookie: {
        name: 'session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secrets,
      },
    });

    const session = await storage
      .getSession(request.headers.get('Cookie'))
      .catch(() => storage.getSession());

    return new this(storage, session);
  }

  get has() {
    return this.#session.has;
  }

  get get() {
    return this.#session.get;
  }

  get flash() {
    return this.#session.flash;
  }

  get unset() {
    this.isPending = true;
    return this.#session.unset;
  }

  get set() {
    this.isPending = true;
    return this.#session.set;
  }

  destroy() {
    return this.#sessionStorage.destroySession(this.#session);
  }

  commit() {
    this.isPending = false;
    return this.#sessionStorage.commitSession(this.#session);
  }
}

/** Build the session for a request. Demo-only secret fallback. */
export function getSession(request: Request) {
  const secret = process.env.SESSION_SECRET || 'bejwld-demo-session-secret';
  return AppSession.init(request, [secret]);
}

/**
 * Set-Cookie headers for a session written to during this request. Returns an
 * empty object when nothing changed, so it's always safe to pass through.
 */
export async function commitHeaders(session: AppSession): Promise<HeadersInit> {
  return session.isPending ? {'Set-Cookie': await session.commit()} : {};
}
