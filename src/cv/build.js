// A CV is a copy of your Career Profile that you can edit freely.
// Changes you make in a CV never change your profile.

export function cvFromProfile({ profile, email, education, skills, experiences }) {
  return {
    contact: {
      name: profile?.full_name || '',
      email: email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      link: profile?.link || '',
    },
    summary: profile?.summary || '',
    education: education.map((e) => ({
      include: true, institution: e.institution, qualification: e.qualification || '', course: e.course || '',
      start_date: e.start_date || '', end_date: e.end_date || '', still_studying: Boolean(e.still_studying), notes: e.notes || '',
    })),
    experiences: experiences.map((x) => ({
      include: true, source_id: x.id, type: x.type, title: x.title, organisation: x.organisation || '', role: x.role || '',
      start_date: x.start_date || '', end_date: x.end_date || '', is_current: Boolean(x.is_current),
      statement: x.evidence_statement || '',
    })),
    skills: skills.map((s) => ({ include: true, source_id: s.id, name: s.name, category: s.category, featured: Boolean(s.featured) })),
  }
}

// Things that must be fixed before a CV can be exported.
export function cvGaps(c) {
  const gaps = []
  if (!c.contact.name.trim()) gaps.push('Add your name')
  if (!c.contact.email.trim()) gaps.push('Add your email')
  for (const x of c.experiences) if (x.include && !x.statement.trim()) gaps.push(`Add what you did in “${x.title}”, or untick it`)
  return gaps
}

export const typeInBrackets = {
  project: 'project',
  employment: '',
  siwes_internship: 'SIWES / internship',
  volunteering: 'volunteering',
  leadership: 'leadership',
}

export const dateRange = (start, end, current) =>
  [start, current ? 'now' : end].filter(Boolean).join(' to ')
