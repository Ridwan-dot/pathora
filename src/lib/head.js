export const SITE_NAME = 'Pathora'
export const siteUrl = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '')

export const abs = (path) => (siteUrl ? siteUrl + path : path)

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Builds the head tags for one page as HTML text (used when the site is built).
export function headTags(d) {
  const url = siteUrl ? siteUrl + d.path : null
  const tags = [
    `<title data-seo>${esc(d.title)}</title>`,
    `<meta data-seo name="description" content="${esc(d.description)}">`,
    `<meta data-seo property="og:title" content="${esc(d.title)}">`,
    `<meta data-seo property="og:description" content="${esc(d.description)}">`,
    `<meta data-seo property="og:type" content="${d.type || 'website'}">`,
    `<meta data-seo property="og:site_name" content="${SITE_NAME}">`,
    `<meta data-seo name="twitter:card" content="summary">`,
  ]
  if (d.noindex) tags.push('<meta data-seo name="robots" content="noindex, nofollow">')
  if (url) {
    tags.push(`<link data-seo rel="canonical" href="${esc(url)}">`)
    tags.push(`<meta data-seo property="og:url" content="${esc(url)}">`)
  }
  if (d.jsonLd) {
    const json = JSON.stringify(d.jsonLd).replace(/</g, '\\u003c')
    tags.push(`<script data-seo type="application/ld+json">${json}</script>`)
  }
  return tags.join('\n    ')
}

// Updates the head in the browser when the visitor moves between pages.
export function applyHead(d) {
  document.head
    .querySelectorAll('[data-seo], title, meta[name="description"]')
    .forEach((el) => el.remove())
  const holder = document.createElement('div')
  holder.innerHTML = headTags(d)
  holder.querySelectorAll('script').forEach((el) => {
    // Keep structured data as data (it is not run as code).
    document.head.appendChild(el)
  })
  holder.querySelectorAll(':not(script)').forEach((el) => document.head.appendChild(el))
  document.title = d.title
}
