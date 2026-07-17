import {Link} from 'react-router';
import type {ComponentProps, ReactNode} from 'react';

type Variant = 'solid' | 'ink' | 'quiet';

const base =
  'inline-flex items-center justify-center px-[34px] py-4 text-[11px] uppercase tracking-[0.24em] cursor-pointer transition-[background,color,border-color,opacity] duration-300 select-none disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  // The single laurel CTA per view — the signature accent.
  solid:
    'bg-laurel text-alabaster border border-laurel hover:opacity-88',
  // Ink outline that fills on hover.
  ink: 'bg-transparent text-sable border border-sable hover:bg-sable hover:text-alabaster',
  // Quiet hairline outline.
  quiet:
    'bg-transparent text-sable border border-stone hover:border-sable',
};

interface CommonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<'button'>, 'className'> & {to?: undefined};
type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, 'className' | 'to'> & {to: string};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {variant = 'ink', children, className = '', ...rest} = props;
  const cls = `${base} ${variants[variant]} ${className}`;

  if ('to' in props && props.to) {
    const {to, ...linkRest} = rest as ButtonAsLink;
    return (
      <Link to={to} className={cls} {...linkRest}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}
