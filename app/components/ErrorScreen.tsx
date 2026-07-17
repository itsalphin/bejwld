import {Link} from 'react-router';

/** On-brand error / not-found screen. Calm, unhurried, no alarm. */
export function ErrorScreen({
  status,
  message,
}: {
  status: number;
  message: string;
}) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-[560px] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="label">{status === 404 ? 'Not found' : 'The atelier'}</p>
      <h1 className="mt-5 font-display text-[clamp(38px,6vw,64px)] font-medium leading-[1.1]">
        {status === 404 ? 'A piece we can’t place' : 'A quiet moment'}
      </h1>
      <p className="mt-5 max-w-[44ch] text-[15px] text-sable/75">{message}</p>
      <Link
        to="/"
        className="mt-9 border border-sable px-[34px] py-4 text-[11px] uppercase tracking-[0.24em] text-sable transition-colors hover:bg-sable hover:text-alabaster"
      >
        Return to the house
      </Link>
    </section>
  );
}
