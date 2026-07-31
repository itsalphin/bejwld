import {useLoaderData, useSearchParams, Link} from 'react-router';
import type {Route} from './+types/search';
import {searchProducts, getSports, FACETS, type Tier} from '~/lib/catalog';
import {PieceCard} from '~/components/PieceCard';
import {Reveal} from '~/components/Reveal';

export const meta: Route.MetaFunction = () => [
  {title: 'Search — bejwld'},
  {name: 'robots', content: 'noindex'},
];

export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? '';
  const sport = url.searchParams.get('sport');
  const tier = (url.searchParams.get('tier') as Tier) || null;

  const [results, sports] = await Promise.all([
    searchProducts({query, sport, tier}),
    getSports(),
  ]);

  return {query, results, sports};
}

export default function Search() {
  const {query, results, sports} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, {preventScrollReset: true});
  }

  function toggle(key: string, value: string) {
    update(key, searchParams.get(key) === value ? null : value);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-[clamp(20px,4vw,56px)] py-[clamp(48px,6vw,88px)]">
      <header>
        <p className="label">The house</p>
        <h1 className="mt-3 font-display text-[clamp(36px,5vw,60px)] font-medium">Search</h1>
      </header>

      <form
        method="get"
        role="search"
        className="mt-8 flex max-w-[520px] border border-stone"
        onSubmit={(e) => {
          // Client-side: reflect the input into the URL without a full reload.
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem('q') as HTMLInputElement;
          update('q', input.value || null);
        }}
      >
        <label htmlFor="q" className="sr-only">
          Search the house
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="A piece, a material, an occasion…"
          className="min-w-0 flex-1 bg-alabaster px-4 py-3 text-[14px] text-sable focus:outline-none"
        />
        <button
          type="submit"
          className="border-l border-stone bg-sable px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-alabaster"
        >
          Search
        </button>
      </form>

      {/* Facets */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="label w-[54px]">Sport</span>
          {sports.map((s) => {
            const selected = searchParams.get('sport') === s.sport;
            return (
              <button
                key={s.sport}
                type="button"
                onClick={() => toggle('sport', s.sport)}
                aria-pressed={selected}
                className="border px-[14px] py-2 text-[11px] uppercase tracking-[0.16em] capitalize transition-colors"
                style={{
                  borderColor: selected ? 'var(--sable)' : 'var(--stone)',
                  background: selected ? 'var(--sable)' : 'transparent',
                  color: selected ? 'var(--alabaster)' : 'var(--sable)',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="label w-[54px]">Price</span>
          {FACETS.tier.options.map((opt) => {
            const selected = searchParams.get('tier') === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggle('tier', opt.id)}
                aria-pressed={selected}
                className="border px-[14px] py-2 text-[11px] uppercase tracking-[0.16em] transition-colors"
                style={{
                  borderColor: selected ? 'var(--sable)' : 'var(--stone)',
                  background: selected ? 'var(--sable)' : 'transparent',
                  color: selected ? 'var(--alabaster)' : 'var(--sable)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="label mt-8">
        {results.length} {results.length === 1 ? 'piece' : 'pieces'}
      </p>

      {results.length ? (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-11">
          {results.map((piece, i) => (
            <Reveal key={piece.handle} delay={(i % 4) * 80}>
              <PieceCard piece={piece} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-stone px-8 py-20 text-center">
          <h2 className="font-display text-[26px] font-medium">Nothing matched</h2>
          <p className="mx-auto mt-3 max-w-[40ch] text-[14px] text-sable/70">
            Try fewer words, or browse the capsule. The concierge can also find a piece by
            description.
          </p>
          <div className="mt-7 flex justify-center gap-4">
            <Link
              to="/collections"
              className="border border-sable px-7 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors hover:bg-sable hover:text-alabaster"
            >
              Browse the capsule
            </Link>
            <Link
              to="/concierge"
              className="border border-stone px-7 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors hover:border-sable"
            >
              Ask the concierge
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
