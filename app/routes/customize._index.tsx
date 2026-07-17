import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/customize._index';
import {getConfigurableProducts} from '~/lib/catalog';
import {PieceCard} from '~/components/PieceCard';
import {Reveal} from '~/components/Reveal';

export const meta: Route.MetaFunction = () => [
  {title: 'The atelier — customize a piece — bejwld'},
  {
    name: 'description',
    content:
      'Compose your piece: metal, stones, carat, chain, and engraving. Priced as configured, made to order in New York.',
  },
  {tagName: 'link', rel: 'canonical', href: '/customize'},
];

export async function loader(_args: Route.LoaderArgs) {
  return {pieces: await getConfigurableProducts()};
}

export default function CustomizeIndex() {
  const {pieces} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-[1200px] px-[clamp(20px,4vw,56px)] py-[clamp(48px,6vw,88px)]">
      <header className="max-w-[54ch]">
        <p className="label">The atelier</p>
        <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] font-medium leading-[1.05]">
          Composed by you
        </h1>
        <p className="mt-5 text-[15px] text-sable/75">
          A handful of pieces open to configuration. Choose the metal, the stones, the chain — and
          have it engraved in the house hand. Every configured piece is priced as built and made to
          order.
        </p>
      </header>

      <div className="mt-[clamp(40px,6vw,72px)] grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-x-6 gap-y-12">
        {pieces.map((piece, i) => (
          <Reveal key={piece.handle} delay={(i % 4) * 80}>
            <div className="flex flex-col gap-4">
              <PieceCard piece={piece} />
              <Link
                to={`/customize/${piece.handle}`}
                className="border border-stone px-5 py-3 text-center text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-sable"
              >
                Compose this piece
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
