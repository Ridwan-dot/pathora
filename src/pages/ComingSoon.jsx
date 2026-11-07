import { useLocation } from 'react-router-dom'
import Button from '../components/Button'
import Seo from '../components/Seo'

export default function ComingSoon({ title }) {
  const { pathname } = useLocation()
  return (
    <div className="mx-auto max-w-xl px-5 py-14">
      <Seo title={`${title} | Pathora`} description="This part of Pathora is built in a later stage." path={pathname} noindex />
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-muted">This part of Pathora is built in a later stage.</p>
      <Button to="/" variant="outline" className="mt-5">Back to the homepage</Button>
    </div>
  )
}
