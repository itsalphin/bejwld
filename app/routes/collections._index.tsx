import {Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {useLoaderData} from 'react-router';
import {getSports} from '~/lib/catalog';
import {Reveal} from '~/components/Reveal';

export const meta: Route.MetaFunction = () => [
  {title: 'The capsules — bejwld'},
  {
    name: 'description',
    content: 'Every capsule from the house, one per sport. Fine jewelry for the games we love.',
  },
  {tagName: 'link', rel: 'canonical', href: '/collections'},
];

export async function loader(_args: Route.LoaderArgs) {
  // The index is generated entirely from the runtime sport list.
  return {sports: await getSports()};
}

export default function CollectionsIndex() {
  const {sports} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-[1440px] px-[clamp(20px,4vw,56px)] py-[clamp(56px,8vw,110px)]">
      <header className="max-w-[52ch]">
        <p className="label">The house</p>
        <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] font-medium leading-[1.05]">
          The capsules
        </h1>
        <p className="mt-5 text-[15px] text-sable/75">
          One capsule per sport, each designed with the same restraint. We launch with pickleball;
          more follow as the house grows.
        </p>
      </header>

      <div className="mt-[clamp(40px,6vw,72px)] grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-[22px]">
        {sports.map((s, i) => (
          <Reveal key={s.sport} delay={i * 90}>
            <Link
              to={`/collections/${s.sport}`}
              className="group relative block bg-bone px-10 pb-11 pt-[52px] transition-colors duration-[400ms] hover:bg-[color-mix(in_srgb,var(--bone)_88%,var(--sable))]"
            >
              <div className="pointer-events-none absolute inset-3 border border-stone" />
              <p className="label">{s.tagline}</p>
              <h2 className="mb-1.5 mt-[14px] font-display text-[34px] font-medium capitalize">
                {s.label}
              </h2>
              <p className="mb-[26px] max-w-[38ch] text-[13px] text-sable/70">{s.description}</p>
              <span className="label border-b border-champagne pb-1">{s.count} pieces</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
