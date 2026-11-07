import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Seo from '../components/Seo'
import { abs, SITE_NAME } from '../lib/head'
import { breadcrumbs, graph } from '../lib/jsonld'

export default function GuidePage({ guide: g }) {
  const path = `/resources/${g.slug}`
  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <Seo
        title={`${g.title} | Pathora`}
        description={g.description}
        path={path}
        type="article"
        jsonLd={graph(
          {
            '@type': 'Article',
            headline: g.title,
            description: g.description,
            datePublished: g.date,
            dateModified: g.date,
            author: { '@type': 'Organization', name: SITE_NAME },
            publisher: { '@type': 'Organization', name: SITE_NAME },
            mainEntityOfPage: abs(path),
          },
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Career guides', path: '/resources' }, { name: g.title, path }]),
        )}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/">Home</Link> / <Link to="/resources">Career guides</Link>
      </nav>
      <h1 className="mt-3 text-4xl font-bold">{g.title}</h1>
      <p className="mt-1 text-sm text-muted">Published {g.date}</p>
      <p className="mt-5 text-lg">{g.intro}</p>
      {g.sections.map((s) => (
        <section key={s.h}>
          <h2 className="mt-8 text-2xl font-bold">{s.h}</h2>
          {s.p.map((x) => <p key={x} className="mt-3">{x}</p>)}
          {s.list && <ul className="mt-3 list-disc space-y-1 pl-5">{s.list.map((x) => <li key={x}>{x}</li>)}</ul>}
        </section>
      ))}
      <div className="mt-10 rounded-2xl bg-sage p-6">
        <h2 className="text-xl font-bold">Put it into practice</h2>
        <p className="mt-1 text-muted">Pathora helps you apply this to a real job and your real experience.</p>
        <Button to="/signup" className="mt-3">Get started</Button>
      </div>
    </article>
  )
}
