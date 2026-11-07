import Button from '../components/Button'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-14">
      <Seo title="Page not found | Pathora" description="We can't find that page." path="/404" noindex />
      <h1 className="text-3xl font-bold">We can't find that page</h1>
      <p className="mt-3 text-muted">The link may be wrong, or the page may have moved.</p>
      <Button to="/" className="mt-5">Go to the homepage</Button>
    </div>
  )
}
