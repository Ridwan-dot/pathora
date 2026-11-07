import { abs, SITE_NAME } from './head'

export const breadcrumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: abs(it.path),
  })),
})

export const faqPage = (faqs) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
})

export const organization = () => ({
  '@type': 'Organization',
  name: SITE_NAME,
  url: abs('/'),
  description:
    'A career-readiness platform for students, graduates and entry-level job seekers.',
})

export const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes })
