import type {Route} from './+types/contact';
import {STATIC_PAGES} from '~/lib/content';
import {StaticPage} from '~/components/StaticPage';

const page = STATIC_PAGES.contact;

export const meta: Route.MetaFunction = () => [
  {title: 'Contact — bejwld'},
  {name: 'description', content: page.blocks[0].p},
  {tagName: 'link', rel: 'canonical', href: '/contact'},
];

export default function Contact() {
  return <StaticPage page={page} />;
}
