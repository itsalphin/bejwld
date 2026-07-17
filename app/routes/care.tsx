import type {Route} from './+types/care';
import {STATIC_PAGES} from '~/lib/content';
import {StaticPage} from '~/components/StaticPage';

const page = STATIC_PAGES.care;

export const meta: Route.MetaFunction = () => [
  {title: 'Care & warranty — bejwld'},
  {name: 'description', content: page.blocks[0].p},
  {tagName: 'link', rel: 'canonical', href: '/care'},
];

export default function Care() {
  return <StaticPage page={page} />;
}
