import {flatRoutes} from '@react-router/fs-routes';
import {type RouteConfig} from '@react-router/dev/routes';

// Plain file-based routing — Hydrogen's `hydrogenRoutes()` wrapper (which layers
// in Shopify-specific routes) isn't used in the Vercel demo.
export default (await flatRoutes()) satisfies RouteConfig;
