import Button from '../components/Button'

// Placeholder homepage. The full designed homepage (with SEO) is built in Stage 2.
export default function Home() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h1 className="text-4xl font-bold md:text-5xl">Your next chapter starts here.</h1>
      <p className="mt-4 max-w-xl text-muted">
        Understand job opportunities, discover the value of your experience and prepare with
        confidence for your next career move.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button to="/signup">Start your journey</Button>
        <Button to="/analyse" variant="outline">Try the Job Analyser</Button>
      </div>
    </section>
  )
}
