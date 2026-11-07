import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Seo from '../components/Seo'
import { features } from '../content/features'
import { abs } from '../lib/head'
import { breadcrumbs, faqPage, graph } from '../lib/jsonld'

export default function ToolPage({ feature: f }) {
  const path = `/tools/${f.slug}`
  const others = features.filter((x) => x.slug !== f.slug)
  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <Seo
        title={`${f.name} | Pathora`}
        description={f.description}
        path={path}
        noindex={!f.live}
        jsonLd={graph(
          { '@type': 'WebPage', name: f.name, description: f.description, url: abs(path) },
          breadcrumbs([{ name: 'Home', path: '/' }, { name: f.name, path }]),
          faqPage(f.faqs),
        )}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/">Home</Link> / {f.name}
      </nav>
      <h1 className="mt-3 text-4xl font-bold">{f.name}</h1>
      <p className="mt-1 text-lg text-muted">{f.tagline}</p>
      {!f.live && (
        <p className="mt-4 rounded-xl bg-need p-3 text-sm text-need-text">
          <b>Coming soon.</b> This tool is still being built.
        </p>
      )}
      <p className="mt-5">{f.summary}</p>

      <h2 className="mt-8 text-2xl font-bold">What it does</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5">{f.does.map((x) => <li key={x}>{x}</li>)}</ul>

      <h2 className="mt-8 text-2xl font-bold">How it works</h2>
      <ol className="mt-3 list-decimal space-y-1 pl-5">{f.steps.map((x) => <li key={x}>{x}</li>)}</ol>

      <h2 className="mt-8 text-2xl font-bold">What it will not do</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5">{f.limits.map((x) => <li key={x}>{x}</li>)}</ul>

      <h2 className="mt-8 text-2xl font-bold">Common questions</h2>
      {f.faqs.map((x) => (
        <div key={x.q} className="mt-4">
          <h3 className="text-lg font-bold">{x.q}</h3>
          <p className="mt-1 text-muted">{x.a}</p>
        </div>
      ))}

      <div className="mt-10 rounded-2xl bg-sage p-6">
        <h2 className="text-xl font-bold">Ready to start?</h2>
        <p className="mt-1 text-muted">Create a free account and build from what you already know.</p>
        <Button to="/signup" className="mt-3">Get started</Button>
      </div>

      <h2 className="mt-10 text-xl font-bold">More Pathora tools</h2>
      <ul className="mt-2 space-y-1">
        {others.map((o) => (
          <li key={o.slug}><Link className="font-semibold underline" to={`/tools/${o.slug}`}>{o.name}</Link>: {o.tagline}</li>
        ))}
      </ul>
    </article>
  )
}
