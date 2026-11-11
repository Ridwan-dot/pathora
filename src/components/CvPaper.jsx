import { dateRange, typeInBrackets } from '../cv/build'

const Gap = ({ children }) => (
  <span className="cv-gap rounded bg-need px-1 text-need-text">{children}</span>
)

function Heading({ children }) {
  return <h4 className="mt-4 mb-1 border-b border-line pb-0.5 font-body text-xs font-semibold uppercase tracking-wider">{children}</h4>
}

// The CV as it will look on paper. Yellow markers show what is missing; they never print.
export default function CvPaper({ content: c }) {
  const edu = c.education.filter((e) => e.include)
  const exp = c.experiences.filter((x) => x.include)
  const skills = c.skills.filter((s) => s.include).sort((a, b) => Number(b.featured) - Number(a.featured))
  const contactLine = [c.contact.email, c.contact.phone, c.contact.location, c.contact.link].filter(Boolean).join(' · ')

  return (
    <div className="cv-paper mx-auto max-w-2xl rounded-md border border-line bg-white p-5 text-[13px] leading-relaxed shadow-sm sm:p-7">
      <h3 className="text-xl font-bold">{c.contact.name || <Gap>[Add your name]</Gap>}</h3>
      <p className="text-muted">{contactLine || <Gap>[Add your email]</Gap>}</p>

      {c.summary.trim() && (<><Heading>Summary</Heading><p>{c.summary}</p></>)}

      {edu.length > 0 && (
        <>
          <Heading>Education</Heading>
          {edu.map((e, i) => (
            <p key={i} className="mt-1">
              <b>{[e.qualification, e.course].filter(Boolean).join(', ') || e.institution}</b>
              {[e.qualification || e.course ? e.institution : '', dateRange(e.start_date, e.end_date, e.still_studying)].filter(Boolean).map((t) => `, ${t}`).join('')}
              {e.notes.trim() && <><br />{e.notes}</>}
            </p>
          ))}
        </>
      )}

      {exp.length > 0 && (
        <>
          <Heading>Projects and experience</Heading>
          {exp.map((x, i) => (
            <p key={i} className="mt-2">
              <b>{x.title}</b>
              {typeInBrackets[x.type] ? ` (${typeInBrackets[x.type]})` : ''}
              {[x.organisation, dateRange(x.start_date, x.end_date, x.is_current)].filter(Boolean).map((t) => `, ${t}`).join('')}
              <br />
              {x.statement.trim() || <Gap>[Add what you did]</Gap>}
            </p>
          ))}
        </>
      )}

      {skills.length > 0 && (<><Heading>Skills</Heading><p>{skills.map((s) => s.name).join(', ')}</p></>)}
    </div>
  )
}
