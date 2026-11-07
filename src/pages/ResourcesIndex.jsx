import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { guides } from '../content/guides'
import { abs } from '../lib/head'
import { breadcrumbs, graph } from '../lib/jsonld'

export default function ResourcesIndex() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Seo
        title="Career guides for students and graduates | Pathora"
        description="Free, plain-English career guides: how to read a job description, how to show evidence on your CV with no work experience, and more."
        path="/resources"
        jsonLd={graph(
          { '@type': 'CollectionPage', name: 'Pathora career guides', url: abs('/resources') },
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Career guides', path: '/resources' }]),
        )}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link to="/">Home</Link> / Career guides</nav>
      <h1 className="mt-3 text-4xl font-bold">Career guides</h1>
      <p className="mt-2 text-muted">Practical, honest advice for students, graduates and entry-level job seekers.</p>
      <ul className="mt-6 space-y-4">
        {guides.map((g) => (
          <li key={g.slug} className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-xl font-bold"><Link to={`/resources/${g.slug}`}>{g.title}</Link></h2>
            <p className="mt-1 text-muted">{g.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
