import type {Route} from './+types/certificate';
import {STATIC_PAGES} from '~/lib/content';
import {StaticPage} from '~/components/StaticPage';

const page = STATIC_PAGES.certificate;

export const meta: Route.MetaFunction = () => [
  {title: 'The certificate — bejwld'},
  {name: 'description', content: page.intro ?? page.blocks[0].p},
  {tagName: 'link', rel: 'canonical', href: '/certificate'},
];

export default function Certificate() {
  return <StaticPage page={page} />;
}
