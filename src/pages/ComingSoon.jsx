import Button from '../components/Button'

export default function ComingSoon({ title }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-14">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-muted">This part of Pathora is built in a later stage.</p>
      <Button to="/" variant="outline" className="mt-5">Back to the homepage</Button>
    </div>
  )
}
