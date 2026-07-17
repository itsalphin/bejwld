import {Form, useActionData, data} from 'react-router';
import type {Route} from './+types/concierge';
import {CONCIERGE_TOPICS} from '~/lib/content';

export const meta: Route.MetaFunction = () => [
  {title: 'The concierge — bejwld'},
  {
    name: 'description',
    content:
      'A commission, a gift, a question of sizing. Request an appointment with the bejwld concierge.',
  },
  {tagName: 'link', rel: 'canonical', href: '/concierge'},
];

export async function action({request}: Route.ActionArgs) {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const topic = String(form.get('topic') ?? '').trim();
  const note = String(form.get('note') ?? '').trim();

  if (!name || !email) {
    return data(
      {ok: false as const, error: 'A name and email let us write back.', name: ''},
      {status: 400},
    );
  }

  // In production: persist to a `concierge_request` metaobject and/or email the
  // concierge. Calendar booking is out of scope for v1 (per the brief).
  // eslint-disable-next-line no-console
  console.log('[concierge] request', {name, email, topic, note});

  return data({ok: true as const, name, error: ''});
}

const field =
  'w-full border border-stone bg-alabaster px-4 py-3 text-[14px] text-sable focus:border-champagne focus:outline-none';
const fieldLabel = 'label mb-2 block';

export default function Concierge() {
  const result = useActionData<typeof action>();

  return (
    <div className="mx-auto grid max-w-[1200px] gap-[clamp(32px,6vw,80px)] px-[clamp(20px,4vw,56px)] py-[clamp(48px,7vw,100px)] lg:grid-cols-[0.9fr_1.1fr]">
      {/* Editorial hero */}
      <div className="lg:pr-8">
        <p className="label">Client care</p>
        <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] font-medium leading-[1.02]">
          The concierge
        </h1>
        <p className="mt-6 max-w-[44ch] text-[16px] leading-[1.7] text-sable/80">
          A commission drawn with you, a gift chosen well, a question of sizing settled. Write to us
          and we reply within the day — warm, and unhurried.
        </p>
        <p className="mt-8 font-display text-[19px] italic text-gold-ink">
          “Every piece begins as a conversation.”
        </p>
        <dl className="mt-10 flex flex-col gap-4 border-t border-stone pt-8 text-[14px]">
          <div>
            <dt className="label mb-1">By email</dt>
            <dd className="text-sable/80">concierge@bejwld.com</dd>
          </div>
          <div>
            <dt className="label mb-1">The atelier</dt>
            <dd className="text-sable/80">By appointment only, in New York.</dd>
          </div>
        </dl>
      </div>

      {/* Booking request */}
      <div className="border border-stone p-[clamp(28px,4vw,52px)]">
        {result?.ok ? (
          <div className="flex min-h-[300px] flex-col items-start justify-center">
            <p className="label">Received</p>
            <h2 className="mt-4 font-display text-[clamp(28px,4vw,40px)] font-medium leading-[1.1]">
              Thank you, {result.name}.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[15px] leading-[1.7] text-sable/80">
              Your request is with the concierge. We reply within the day, to the email you gave us.
            </p>
          </div>
        ) : (
          <Form method="post" className="flex flex-col gap-6">
            <div>
              <p className="label">Request an appointment</p>
              <h2 className="mt-3 font-display text-[clamp(24px,3vw,34px)] font-medium">
                Tell us what you have in mind
              </h2>
            </div>

            {result?.error ? (
              <p className="border border-champagne bg-bone px-4 py-3 text-[13px] text-gold-ink">
                {result.error}
              </p>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={fieldLabel}>
                  Your name
                </label>
                <input id="name" name="name" required className={field} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="email" className={fieldLabel}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={field}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="topic" className={fieldLabel}>
                What brings you
              </label>
              <select id="topic" name="topic" className={field} defaultValue={CONCIERGE_TOPICS[0].id}>
                {CONCIERGE_TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="note" className={fieldLabel}>
                A note (optional)
              </label>
              <textarea id="note" name="note" rows={4} className={field} />
            </div>

            <button
              type="submit"
              className="mt-1 self-start bg-laurel px-9 py-4 text-[11px] uppercase tracking-[0.24em] text-alabaster transition-opacity hover:opacity-90"
            >
              Send to the concierge
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
