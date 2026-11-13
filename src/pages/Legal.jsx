import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

function Page({ title, path, updated, children }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <Seo title={`${title} | Pathora`} description={`${title} for Pathora (draft).`} path={path} noindex />
      <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link to="/">Home</Link> / {title}</nav>
      <h1 className="mt-3 text-4xl font-bold">{title}</h1>
      <p className="mt-2 rounded-xl bg-need p-3 text-sm text-need-text"><b>Draft for review.</b> Written in plain language to describe what Pathora does today. It must be reviewed by a qualified person (including against Nigerian data protection law) before launch. Text in [square brackets] still needs to be filled in.</p>
      <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
      {children}
    </article>
  )
}
const H = ({ children }) => <h2 className="mt-8 text-2xl font-bold">{children}</h2>

export function Privacy() {
  return (
    <Page title="Privacy Policy" path="/privacy" updated="[date]">
      <H>Who we are</H>
      <p className="mt-2">Pathora is run by [name of person or company], based in [location]. You can contact us at [contact email].</p>
      <H>What we collect</H>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Your account details: name and email address, and your password (stored in a protected form, never in plain text).</li>
        <li>What you add to your Career Profile: education, skills, projects and experience, and your summary.</li>
        <li>Job descriptions you paste into the Job Analyser.</li>
        <li>Your CVs and their saved versions.</li>
        <li>Applications you track, with their dates, notes and the updates you record.</li>
      </ul>
      <H>Why we use it</H>
      <p className="mt-2">Only to provide Pathora’s features to you: understanding jobs, building evidence, creating CVs and tracking applications. We don’t sell your information.</p>
      <H>Where it is kept</H>
      <p className="mt-2">Your data is stored in a database hosted by Supabase, in the Frankfurt (EU) region. The website is delivered by Vercel. Access rules mean each person can read and change only their own data.</p>
      <H>AI services</H>
      <p className="mt-2">At the moment, Pathora does not send your information to any AI service. [If AI features are added, describe here exactly what is sent, to whom, and how you are asked first.]</p>
      <H>Your choices</H>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>You can edit or remove anything you have added.</li>
        <li>You can download a copy of your data in Settings, under Privacy and data.</li>
        <li>You can delete your account in Settings. This removes your account and everything in it.</li>
      </ul>
      <H>Cookies and similar storage</H>
      <p className="mt-2">Pathora stores a sign-in token in your browser so you stay logged in. Unfinished drafts (such as in the Evidence Builder) are kept on your device until you save or log out. [Add any analytics or advertising tools here if they are ever used.]</p>
      <H>Children</H>
      <p className="mt-2">[State the minimum age and how it is handled.]</p>
      <H>Changes and contact</H>
      <p className="mt-2">[Explain how changes will be announced.] Questions: [contact email].</p>
    </Page>
  )
}

export function Terms() {
  return (
    <Page title="Terms of Use" path="/terms" updated="[date]">
      <H>Using Pathora</H>
      <p className="mt-2">Pathora helps students and graduates understand jobs, present their genuine experience and organise applications. By creating an account you agree to these terms.</p>
      <H>Guidance, not guarantees</H>
      <p className="mt-2">Pathora offers guidance only. It does not guarantee interviews, jobs or any outcome. Its comparisons use only what you have told it, and it cannot verify your skills or know any employer’s private screening rules.</p>
      <H>Your content and honesty</H>
      <p className="mt-2">What you add is yours. You are responsible for making sure it is true. Don’t use Pathora to create false or misleading CVs or applications.</p>
      <H>Your account</H>
      <p className="mt-2">Keep your password private. You can delete your account at any time in Settings.</p>
      <H>Acceptable use</H>
      <p className="mt-2">Don’t misuse the service, try to access other people’s data, or attempt to disrupt it.</p>
      <H>Changes, availability and liability</H>
      <p className="mt-2">[Explain that the service may change, how availability is handled, and the limits of liability. This section needs professional advice.]</p>
      <H>Governing law and contact</H>
      <p className="mt-2">[State the governing law, likely Nigeria, and a contact email.]</p>
    </Page>
  )
}
