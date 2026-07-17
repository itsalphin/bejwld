import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {getSports, getProduct, fromPrice} from '~/lib/catalog';
import {CRAFT_ITEMS} from '~/lib/content';
import {Button} from '~/components/Button';
import {Reveal} from '~/components/Reveal';
import {PlaceholderArt} from '~/components/PlaceholderArt';

export const meta: Route.MetaFunction = () => [
  {title: 'bejwld — The fine jewelry house of the sporting life'},
  {
    name: 'description',
    content:
      'Heirloom gold and diamonds, in celebration of the games we love. Made to order in New York. Launching with pickleball.',
  },
  {property: 'og:title', content: 'bejwld — The fine jewelry house of the sporting life'},
  {property: 'og:type', content: 'website'},
  {tagName: 'link', rel: 'canonical', href: '/'},
];

export async function loader(_args: Route.LoaderArgs) {
  const sports = await getSports();
  const hero = await getProduct('match-point-pendant');
  return {
    sports,
    hero: hero ? {...hero, priceFrom: fromPrice(hero)} : null,
  };
}

export default function Home() {
  const {sports, hero} = useLoaderData<typeof loader>();
  const firstSport = sports[0];
  const heroCta =
    sports.length > 1
      ? 'Explore the capsules'
      : `Explore the ${firstSport?.sport ?? 'first'} capsule`;

  return (
    <>
      {/* Hero */}
      <section className="hero-screen flex flex-col items-center justify-center px-6 py-[clamp(40px,7vh,90px)] text-center">
        <p className="label" style={{animation: 'bjFadeUp .9s .1s both'}}>
          Est. MMXXVI · New York
        </p>
        <h1
          className="wordmark-shimmer mx-auto mt-[26px] font-display font-medium leading-none"
          style={{
            fontSize: 'clamp(42px,11vw,150px)',
            letterSpacing: '0.18em',
            paddingLeft: '0.18em',
            animation: 'bjFadeUp 1.1s .25s both, bjShimmer 9s 1.6s ease-in-out infinite',
          }}
        >
          BEJWLD
        </h1>
        <p
          className="mx-auto mt-[34px] max-w-[34ch] font-display text-[clamp(19px,2.4vw,26px)] italic leading-[1.45] text-balance"
          style={{animation: 'bjFadeUp .9s .5s both'}}
        >
          The fine jewelry house of the sporting life.
        </p>
        <p
          className="mx-auto mt-[18px] max-w-[52ch] text-[14px] text-sable/70"
          style={{animation: 'bjFadeUp .9s .65s both'}}
        >
          Heirloom gold and diamonds, in celebration of the games we love.
        </p>
        <div
          className="mt-11 flex flex-wrap justify-center gap-[18px]"
          style={{animation: 'bjFadeUp .9s .8s both'}}
        >
          {firstSport ? (
            <Button variant="solid" to={`/collections/${firstSport.sport}`}>
              {heroCta}
            </Button>
          ) : null}
          <Button variant="quiet" to="/customize">
            Customize a piece
          </Button>
        </div>
      </section>

      {/* Shop by sport — generated from the runtime sport list */}
      <section
        aria-labelledby="shop-by-sport"
        className="mx-auto max-w-[1440px] px-[clamp(20px,4vw,56px)] pb-[clamp(70px,9vw,120px)]"
      >
        <Reveal className="mb-9 flex items-baseline justify-between gap-4 border-t border-stone pt-[22px]">
          <h2 id="shop-by-sport" className="font-display text-[clamp(26px,3vw,36px)] font-medium">
            Shop by sport
          </h2>
          <span className="label">
            {sports.length === 1 ? 'One capsule, more to come' : `${sports.length} capsules`}
          </span>
        </Reveal>
        <div className="grid max-w-[980px] grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-[22px]">
          {sports.map((s, i) => (
            <Reveal key={s.sport} delay={i * 90}>
              <Link
                to={`/collections/${s.sport}`}
                className="group relative block bg-bone px-10 pb-11 pt-[52px] transition-colors duration-[400ms] hover:bg-[color-mix(in_srgb,var(--bone)_88%,var(--sable))]"
              >
                <div className="pointer-events-none absolute inset-3 border border-stone" />
                <p className="label">{s.tagline}</p>
                <h3 className="mb-1.5 mt-[14px] font-display text-[34px] font-medium capitalize">
                  {s.label}
                </h3>
                <p className="mb-[26px] max-w-[38ch] text-[13px] text-sable/70">{s.description}</p>
                <span className="label border-b border-champagne pb-1">{s.count} pieces</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Signature piece */}
      {hero ? (
        <section
          aria-label="Signature piece"
          className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-center gap-[clamp(28px,5vw,80px)] px-[clamp(20px,4vw,56px)] pb-[clamp(70px,9vw,120px)]"
        >
          <Reveal className="relative aspect-[4/5]">
            <PlaceholderArt initial={hero.initial} ring={150} note="Photography to follow" />
          </Reveal>
          <Reveal>
            <p className="label">The signature</p>
            <h2 className="mt-[18px] font-display text-[clamp(32px,4vw,52px)] font-medium leading-[1.12] text-balance">
              Match Point, the pendant
            </h2>
            <p className="mt-[22px] max-w-[46ch] text-[15px] text-sable/[0.78]">
              The ball, held in pavé. A diamond-set sphere on a fine gold chain — the piece the
              house was founded on.
            </p>
            <p className="mt-[14px] text-[13px] text-gold-ink">
              14k gold · pavé diamonds · From ${hero.priceFrom.toLocaleString('en-US')}
            </p>
            <div className="mt-8">
              <Button variant="ink" to={`/products/${hero.handle}`}>
                View the piece
              </Button>
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* House belief band */}
      <Reveal as="section" className="bg-bone px-6 py-[clamp(80px,11vw,140px)] text-center">
        <p className="label">The house belief</p>
        <h2 className="mx-auto mt-[22px] max-w-[18ch] font-display text-[clamp(34px,5vw,60px)] font-medium leading-[1.15] text-balance">
          Sport, made precious.
        </h2>
        <p className="mx-auto mt-6 max-w-[52ch] text-[15px] text-sable/75">
          The games we love shape our days, our friendships, our years. We believe they deserve
          better than merchandise. They deserve gold.
        </p>
      </Reveal>

      {/* Materials & craft */}
      <section
        aria-label="Materials and craft"
        className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-8 px-[clamp(20px,4vw,56px)] py-[clamp(64px,8vw,100px)]"
      >
        {CRAFT_ITEMS.map((c, i) => (
          <Reveal key={c.h} delay={i * 90} className="border-t border-champagne pt-5">
            <h3 className="font-display text-[20px] font-medium">
              {c.h}
            </h3>
            <p className="mt-2.5 max-w-[34ch] text-[13px] text-sable/70">{c.p}</p>
          </Reveal>
        ))}
      </section>

      {/* Atelier + concierge teasers */}
      <section className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-[22px] px-[clamp(20px,4vw,56px)] pb-[clamp(70px,9vw,120px)]">
        <Reveal className="flex flex-col items-start border border-stone p-[clamp(40px,5vw,64px)]">
          <p className="label">The atelier</p>
          <h2 className="mt-4 font-display text-[clamp(26px,3vw,38px)] font-medium leading-[1.15]">
            Made to your spec
          </h2>
          <p className="mt-4 max-w-[44ch] text-[14px] text-sable/75">
            Metal, stones, carat, chain, engraving. Composed by you, priced as configured, finished
            by hand.
          </p>
          <p className="mt-5 font-display text-[19px] italic text-gold-ink">
            “for the longest rally”
          </p>
          <div className="mt-7">
            <Button variant="ink" to="/customize">
              Open the configurator
            </Button>
          </div>
        </Reveal>
        <Reveal className="flex flex-col items-start border border-stone p-[clamp(40px,5vw,64px)]">
          <p className="label">The concierge</p>
          <h2 className="mt-4 font-display text-[clamp(26px,3vw,38px)] font-medium leading-[1.15]">
            Guided, unhurried
          </h2>
          <p className="mt-4 max-w-[44ch] text-[14px] text-sable/75">
            A commission, a gift, a question of sizing. Write to the concierge and we reply within
            the day.
          </p>
          <p className="mt-5 text-[13px] text-gold-ink">concierge@bejwld.com</p>
          <div className="mt-7">
            <Button variant="quiet" to="/concierge">
              Request an appointment
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
