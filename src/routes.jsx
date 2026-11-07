import Home from './pages/Home'
import ToolPage from './pages/ToolPage'
import ResourcesIndex from './pages/ResourcesIndex'
import GuidePage from './pages/GuidePage'
import { features } from './content/features'
import { guides } from './content/guides'
import { appNav } from './navigation'

// Public pages that search engines may index.
export const publicRoutes = [
  { path: '/', element: <Home /> },
  ...features.map((f) => ({ path: `/tools/${f.slug}`, element: <ToolPage feature={f} />, live: f.live })),
  { path: '/resources', element: <ResourcesIndex /> },
  ...guides.map((g) => ({ path: `/resources/${g.slug}`, element: <GuidePage guide={g} /> })),
]

export const authPaths = ['/signup', '/login']

// Every page we pre-build as HTML.
export const allPaths = [
  ...publicRoutes.map((r) => r.path),
  ...authPaths,
  ...appNav.map((i) => i.to),
]

// Pages listed in the sitemap (tools appear only when live).
export const sitemapPaths = publicRoutes.filter((r) => r.live !== false).map((r) => r.path)
