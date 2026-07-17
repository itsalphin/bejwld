import type {StaticPage as StaticPageData} from '~/lib/content';
import {Reveal} from './Reveal';

/** Shared editorial layout for the house's static pages. */
export function StaticPage({page}: {page: StaticPageData}) {
  return (
    <article className="mx-auto max-w-[760px] px-[clamp(20px,4vw,56px)] py-[clamp(56px,8vw,120px)]">
      <header className="border-b border-stone pb-[clamp(28px,4vw,44px)]">
        <p className="label">{page.kicker}</p>
        <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] font-medium leading-[1.03]">
          {page.title}
        </h1>
        {page.intro ? (
          <p className="mt-6 max-w-[54ch] text-[16px] leading-[1.7] text-sable/80">{page.intro}</p>
        ) : null}
      </header>

      <div className="mt-[clamp(32px,5vw,56px)] flex flex-col gap-[clamp(28px,4vw,44px)]">
        {page.blocks.map((b, i) => (
          <Reveal key={b.h} delay={i * 70}>
            <h2 className="font-display text-[clamp(20px,2.4vw,26px)] font-medium">{b.h}</h2>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-[1.75] text-sable/80">{b.p}</p>
          </Reveal>
        ))}
      </div>
    </article>
  );
}
