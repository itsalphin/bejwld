import {Form, Link, useLoaderData, data} from 'react-router';
import type {Route} from './+types/account._index';
import {getUser, signIn, signOut} from '~/lib/account/mock-account';

export const meta: Route.MetaFunction = () => [
  {title: 'Account — bejwld'},
  {name: 'robots', content: 'noindex'},
];

export async function loader({context}: Route.LoaderArgs) {
  return {user: getUser(context.session)};
}

export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  if (intent === 'signout') {
    signOut(context.session);
    return data({ok: true});
  }

  const email = String(form.get('email') ?? '').trim();
  if (!email) {
    return data({ok: false, error: 'Enter the email on your account.'}, {status: 400});
  }
  signIn(context.session, email);
  return data({ok: true});
}

const field =
  'w-full border border-stone bg-alabaster px-4 py-3 text-[14px] text-sable focus:border-champagne focus:outline-none';

export default function Account() {
  const {user} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-[900px] px-[clamp(20px,4vw,56px)] py-[clamp(48px,7vw,100px)]">
      {user ? (
        <>
          <header className="border-b border-stone pb-8">
            <p className="label">Your account</p>
            <h1 className="mt-3 font-display text-[clamp(36px,5vw,60px)] font-medium">
              Welcome, {user.name}.
            </h1>
            <p className="mt-3 text-[14px] text-sable/70">{user.email}</p>
          </header>

          {/* VIP / first-look scaffold (§5.9) */}
          <section className="mt-10 border border-champagne bg-bone p-[clamp(24px,4vw,40px)]">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="label">The house list · {user.tier}</p>
              <span className="text-[11px] uppercase tracking-[0.2em] text-gold-ink">
                First look, quietly
              </span>
            </div>
            <h2 className="mt-4 font-display text-[clamp(22px,3vw,30px)] font-medium">
              You see new capsules first
            </h2>
            <p className="mt-3 max-w-[52ch] text-[14px] leading-[1.7] text-sable/80">
              As a member, each capsule opens to you before it opens to the world — and the atelier
              holds a quiet window for early commissions. No points, no tiers to chase; simply the
              first look.
            </p>
          </section>

          {/* Account sections */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <Link
              to="/wishlist"
              className="border border-stone p-7 transition-colors hover:border-sable"
            >
              <p className="label">Saved</p>
              <h3 className="mt-3 font-display text-[22px] font-medium">Your saved pieces</h3>
              <p className="mt-2 text-[13px] text-sable/70">The pieces you’re keeping an eye on.</p>
            </Link>
            <div className="border border-stone p-7">
              <p className="label">Orders</p>
              <h3 className="mt-3 font-display text-[22px] font-medium">No orders yet</h3>
              <p className="mt-2 text-[13px] text-sable/70">
                When you commission a piece, its progress lives here.
              </p>
            </div>
          </div>

          <Form method="post" className="mt-10">
            <input type="hidden" name="intent" value="signout" />
            <button
              type="submit"
              className="text-[11px] uppercase tracking-[0.2em] text-gold-ink underline-offset-4 hover:underline"
            >
              Sign out
            </button>
          </Form>

          <p className="mt-10 border-t border-stone pt-6 text-[12px] text-sable/55">
            This is a demonstration sign-in. In production it becomes Shopify customer accounts
            (passwordless / OAuth) — the account, wishlist ownership, and first-look list bind to the
            real customer.
          </p>
        </>
      ) : (
        <div className="mx-auto max-w-[440px]">
          <header>
            <p className="label">Client access</p>
            <h1 className="mt-3 font-display text-[clamp(34px,5vw,52px)] font-medium">
              The house list
            </h1>
            <p className="mt-4 text-[15px] leading-[1.7] text-sable/80">
              Sign in to see new capsules first and to keep your pieces across visits.
            </p>
          </header>

          <Form method="post" className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="label mb-2 block">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={field}
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="self-start bg-laurel px-9 py-4 text-[11px] uppercase tracking-[0.24em] text-alabaster transition-opacity hover:opacity-90"
            >
              Continue
            </button>
          </Form>

          <p className="mt-8 text-[12px] text-sable/55">
            No password required — this demo signs you in by email. Production uses Shopify customer
            accounts.
          </p>
        </div>
      )}
    </div>
  );
}
