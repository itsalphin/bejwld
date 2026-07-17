import {useLoaderData, useSearchParams, Link} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {
  getProductsBySport,
  getSports,
  FACETS,
  type CollectionFilters,
  type SortKey,
} from '~/lib/catalog';
import {PieceCard} from '~/components/PieceCard';
import {Reveal} from '~/components/Reveal';

export const meta: Route.MetaFunction = ({data}) => {
  const label = data?.label ?? 'Collection';
  return [
    {title: `${label} — bejwld`},
    {name: 'description', content: data?.description ?? ''},
    {tagName: 'link', rel: 'canonical', href: `/collections/${data?.sport ?? ''}`},
  ];
};

export async function loader({params, request}: Route.LoaderArgs) {
  const sport = params.handle!;
  const sports = await getSports();
  const summary = sports.find((s) => s.sport === sport);
  if (!summary) {
    throw new Response('Collection not found', {status: 404});
  }

  const url = new URL(request.url);
  const filters: CollectionFilters = {
    metal: (url.searchParams.get('metal') as CollectionFilters['metal']) || null,
    stone: (url.searchParams.get('stone') as CollectionFilters['stone']) || null,
    tier: (url.searchParams.get('tier') as CollectionFilters['tier']) || null,
  };
  const sort = (url.searchParams.get('sort') as SortKey) || 'featured';

  const pieces = await getProductsBySport(sport, {filters, sort});

  return {
    sport: summary.sport,
    label: summary.label,
    description: summary.description,
    tagline: summary.tagline,
    pieces,
  };
}

const FACET_KEYS = ['metal', 'stone', 'tier'] as const;

export default function Collection() {
  const {sport, label, description, tagline, pieces} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  function toggle(key: string, id: string) {
    const next = new URLSearchParams(searchParams);
    if (next.get(key) === id) next.delete(key);
    else next.set(key, id);
    setSearchParams(next, {preventScrollReset: true});
  }

  function setSort(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value === 'featured') next.delete('sort');
    else next.set('sort', value);
    setSearchParams(next, {preventScrollReset: true});
  }

  function clearAll() {
    const next = new URLSearchParams(searchParams);
    FACET_KEYS.forEach((k) => next.delete(k));
    setSearchParams(next, {preventScrollReset: true});
  }

  const anyFilter = FACET_KEYS.some((k) => searchParams.get(k));
  const sort = searchParams.get('sort') ?? 'featured';

  return (
    <div className="mx-auto max-w-[1440px] px-[clamp(20px,4vw,56px)] py-[clamp(48px,6vw,88px)]">
      {/* Split editorial header */}
      <header className="grid grid-cols-1 items-end gap-8 border-b border-stone pb-[clamp(28px,4vw,48px)] md:grid-cols-[1fr_auto]">
        <div>
          <p className="label">{tagline}</p>
          <h1 className="mt-4 font-display text-[clamp(44px,7vw,84px)] font-medium capitalize leading-[0.98]">
            {label}
          </h1>
        </div>
        <p className="max-w-[42ch] text-[14px] text-sable/75 md:text-right">{description}</p>
      </header>

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4">
          {FACET_KEYS.map((key) => {
            const facet = FACETS[key];
            const active = searchParams.get(key);
            return (
              <div key={key} className="flex flex-wrap items-center gap-2.5">
                <span className="label mr-1 w-[54px]">{facet.label}</span>
                {facet.options.map((opt) => {
                  const selected = active === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggle(key, opt.id)}
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
            );
          })}
          {anyFilter ? (
            <button
              type="button"
              onClick={clearAll}
              className="self-start text-[11px] uppercase tracking-[0.18em] text-gold-ink underline-offset-4 hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="label">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-stone bg-alabaster px-3 py-2 text-[13px] text-sable focus:border-champagne focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="asc">Price · low to high</option>
            <option value="desc">Price · high to low</option>
          </select>
        </div>
      </div>

      {/* Grid / empty state */}
      <p className="label mt-8">
        {pieces.length} {pieces.length === 1 ? 'piece' : 'pieces'}
      </p>

      {pieces.length ? (
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-x-6 gap-y-11">
          {pieces.map((piece, i) => (
            <Reveal key={piece.handle} delay={(i % 4) * 80}>
              <PieceCard piece={piece} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-stone px-8 py-20 text-center">
          <h2 className="font-display text-[26px] font-medium">Nothing under that combination — yet</h2>
          <p className="mx-auto mt-3 max-w-[40ch] text-[14px] text-sable/70">
            The capsule is small and deliberate. Ease a filter, or let the concierge find the piece
            you have in mind.
          </p>
          <div className="mt-7 flex justify-center gap-4">
            <button
              type="button"
              onClick={clearAll}
              className="border border-sable px-7 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors hover:bg-sable hover:text-alabaster"
            >
              Clear filters
            </button>
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
