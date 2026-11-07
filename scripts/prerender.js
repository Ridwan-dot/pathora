// Runs after the build. Turns each page into a real HTML file so search engines
// and AI crawlers can read it without running JavaScript.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const dist = path.resolve('dist')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const { render, allPaths, sitemapPaths } = await import(
  pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href
)
const env = loadEnv('production', process.cwd(), 'VITE_')
const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '')

function page(url) {
  const { html, head } = render(url)
  return template
    .replace(/<title>.*?<\/title>/s, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
}

for (const url of allPaths) {
  const file = url === '/' ? 'index.html' : path.join(url.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true })
  fs.writeFileSync(path.join(dist, file), page(url))
}
fs.writeFileSync(path.join(dist, '404.html'), page('/page-that-does-not-exist'))

if (siteUrl) {
  const urls = sitemapPaths
    .map((p) => `  <url><loc>${siteUrl}${p === '/' ? '' : p}</loc></url>`)
    .join('\n')
  fs.writeFileSync(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )
  const robots = path.join(dist, 'robots.txt')
  fs.appendFileSync(robots, `\nSitemap: ${siteUrl}/sitemap.xml\n`)
  console.log(`Sitemap written for ${siteUrl}`)
} else {
  console.warn('VITE_SITE_URL is not set: no sitemap or canonical links were written.')
}
console.log(`Pre-built ${allPaths.length + 1} pages.`)
