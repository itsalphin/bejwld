import type {Route} from './+types/about';
import {STATIC_PAGES} from '~/lib/content';
import {organizationJsonLd} from '~/lib/seo';
import {StaticPage} from '~/components/StaticPage';

const page = STATIC_PAGES.about;

export const meta: Route.MetaFunction = () => [
  {title: 'About — bejwld'},
  {name: 'description', content: page.blocks[0].p},
  {tagName: 'link', rel: 'canonical', href: '/about'},
  {'script:ld+json': organizationJsonLd()},
];

export default function About() {
  return <StaticPage page={page} />;
}
