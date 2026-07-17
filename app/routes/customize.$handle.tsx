import {useMemo, useState} from 'react';
import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/customize.$handle';
import {getProduct} from '~/lib/catalog';
import {
  METAL_OPTIONS,
  TREATMENT_OPTIONS,
  CARAT_OPTIONS,
  DIAMOND_OPTIONS,
  CHAIN_OPTIONS,
  ENGRAVING_MAX,
  computeConfiguredPrice,
  configForProduct,
  hasChain,
  formatUSD,
} from '~/lib/catalog';
import type {PieceConfig} from '~/lib/catalog';
import {PlaceholderArt} from '~/components/PlaceholderArt';
import {AddToBag} from '~/components/AddToBag';
import {SizingGuideLauncher} from '~/components/SizingGuide';

export const meta: Route.MetaFunction = ({data}) => [
  {title: data?.product ? `Compose the ${data.product.name} — bejwld` : 'The atelier — bejwld'},
  {name: 'description', content: 'Compose your piece and see it priced as configured.'},
  {tagName: 'link', rel: 'canonical', href: `/customize/${data?.product?.handle ?? ''}`},
];

export async function loader({params}: Route.LoaderArgs) {
  const product = await getProduct(params.handle!);
  if (!product) throw new Response('Piece not found', {status: 404});
  // Only configurable pieces compose; send others to their PDP.
  if (!product.configurable) throw redirect(`/products/${product.handle}`);
  return {product};
}

/** A selectable option card. */
function OptionCard({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      className="flex flex-col items-start gap-1 border px-4 py-3 text-left transition-colors"
      style={{
        borderColor: selected ? 'var(--champagne)' : 'var(--stone)',
        background: selected ? 'var(--bone)' : 'transparent',
      }}
    >
      <span className="text-[13px] text-sable">{label}</span>
      {sub ? <span className="text-[11px] text-sable/60">{sub}</span> : null}
    </button>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="label mb-3">{label}</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{children}</div>
    </div>
  );
}

export default function Configurator() {
  const {product} = useLoaderData<typeof loader>();
  const [config, setConfig] = useState<PieceConfig>(() => configForProduct(product));
  const [engraving, setEngraving] = useState('');

  const set = <K extends keyof PieceConfig>(key: K, value: PieceConfig[K]) =>
    setConfig((c) => ({...c, [key]: value}));

  const {total, rows} = useMemo(
    () => computeConfiguredPrice(product, config, engraving),
    [product, config, engraving],
  );

  const withStones = config.treatment !== 'none';
  const withChain = hasChain(product.type);

  const metalLabel = METAL_OPTIONS.find((m) => m.id === config.metal)?.label ?? '';
  const treatmentLabel =
    TREATMENT_OPTIONS.find((t) => t.id === config.treatment)?.label ?? '';

  return (
    <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)] py-[clamp(32px,4vw,56px)]">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-sable/60"
      >
        <Link to="/customize" className="hover:text-gold-ink">
          The atelier
        </Link>
        <span aria-hidden>·</span>
        <span className="text-sable">{product.name}</span>
      </nav>

      <div className="grid gap-[clamp(32px,5vw,72px)] lg:grid-cols-2">
        {/* Live preview */}
        <div className="lg:sticky lg:top-[92px] lg:self-start">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-stone">
            <PlaceholderArt initial={product.initial} ring={168} />
            {/* Live engraving preview */}
            <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
              <span
                className="font-display text-[22px] italic"
                style={{color: engraving ? 'var(--gold-ink)' : 'var(--stone)'}}
              >
                {engraving || 'your engraving'}
              </span>
            </div>
          </div>
          <p className="mt-4 text-[13px] text-sable/70">
            {product.name} · {metalLabel.toLowerCase()}, {treatmentLabel.toLowerCase()}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-9">
          <div>
            <p className="label">The atelier</p>
            <h1 className="mt-2 font-display text-[clamp(32px,4vw,52px)] font-medium leading-[1.08]">
              {product.name}
            </h1>
            <p className="mt-3 text-[14px] text-sable/75">{product.description}</p>
          </div>

          <Group label="Metal">
            {METAL_OPTIONS.map((o) => (
              <OptionCard
                key={o.id}
                label={o.label}
                sub={o.add ? `${o.sub} · +${formatUSD(o.add)}` : o.sub}
                selected={config.metal === o.id}
                onClick={() => set('metal', o.id)}
              />
            ))}
          </Group>

          <Group label="Stones">
            {TREATMENT_OPTIONS.map((o) => (
              <OptionCard
                key={o.id}
                label={o.label}
                sub={o.add ? `${o.sub} · +${formatUSD(o.add)}` : o.sub}
                selected={config.treatment === o.id}
                onClick={() => set('treatment', o.id)}
              />
            ))}
          </Group>

          {withStones ? (
            <>
              <Group label="Carat">
                {CARAT_OPTIONS.map((o) => {
                  const add = config.diamond === 'natural' ? o.nat : o.lab;
                  return (
                    <OptionCard
                      key={o.id}
                      label={o.label}
                      sub={add ? `+${formatUSD(add)}` : 'Included'}
                      selected={config.carat === o.id}
                      onClick={() => set('carat', o.id)}
                    />
                  );
                })}
              </Group>
              <Group label="Diamond">
                {DIAMOND_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.id}
                    label={o.label}
                    sub={o.sub}
                    selected={config.diamond === o.id}
                    onClick={() => set('diamond', o.id)}
                  />
                ))}
              </Group>
            </>
          ) : null}

          {withChain ? (
            <Group label="Chain">
              {CHAIN_OPTIONS.map((o) => (
                <OptionCard
                  key={o.id}
                  label={o.label}
                  sub={o.add ? `${o.sub} · +${formatUSD(o.add)}` : o.sub}
                  selected={config.chain === o.id}
                  onClick={() => set('chain', o.id)}
                />
              ))}
            </Group>
          ) : null}

          {/* Engraving */}
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="label">Engraving</p>
              <span className="text-[11px] text-sable/55">
                {ENGRAVING_MAX - engraving.length} left · complimentary
              </span>
            </div>
            <input
              type="text"
              value={engraving}
              maxLength={ENGRAVING_MAX}
              onChange={(e) => setEngraving(e.target.value.slice(0, ENGRAVING_MAX))}
              placeholder="for the longest rally"
              aria-label="Engraving text"
              className="w-full border border-stone bg-alabaster px-4 py-3 text-[14px] text-sable focus:border-champagne focus:outline-none"
            />
          </div>

          {/* Price breakdown */}
          <div className="border-t border-champagne pt-6">
            <dl className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <div key={i} className="flex items-baseline justify-between gap-4 text-[13px]">
                  <dt className="text-sable/75">{row.label}</dt>
                  <dd className="tabular-nums text-sable/75">{row.amount}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-stone pt-4">
              <span className="label">As configured</span>
              <span className="font-display text-[26px]">{formatUSD(total)}</span>
            </div>
            <p className="mt-2 text-[11px] text-sable/55">
              An estimate. The atelier confirms the final price — the Cart Transform Function is the
              billed source of truth.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <AddToBag product={product} config={config} engraving={engraving} variant="solid">
              Add to bag — {formatUSD(total)}
            </AddToBag>
            <div className="flex items-center justify-between">
              <Link
                to={`/products/${product.handle}`}
                className="text-[11px] uppercase tracking-[0.2em] text-gold-ink hover:text-sable"
              >
                View the base piece
              </Link>
              <SizingGuideLauncher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
