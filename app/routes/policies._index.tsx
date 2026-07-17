import type {Route} from './+types/policies._index';
import {STATIC_PAGES} from '~/lib/content';
import {StaticPage} from '~/components/StaticPage';

const page = STATIC_PAGES.policies;

export const meta: Route.MetaFunction = () => [
  {title: 'Policies — bejwld'},
  {name: 'description', content: page.blocks[0].p},
  {tagName: 'link', rel: 'canonical', href: '/policies'},
];

export default function Policies() {
  return <StaticPage page={page} />;
}
