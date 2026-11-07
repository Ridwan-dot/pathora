import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
import { HeadContext } from './lib/HeadContext'
import { headTags } from './lib/head'
import { allPaths, sitemapPaths } from './routes'

// Used only when the site is built (see scripts/prerender.js).
export function render(url) {
  const ctx = { head: null, set(data) { this.head = data } }
  const html = renderToString(
    <StrictMode>
      <HeadContext.Provider value={ctx}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HeadContext.Provider>
    </StrictMode>,
  )
  return { html, head: ctx.head ? headTags(ctx.head) : '' }
}

export { allPaths, sitemapPaths }
