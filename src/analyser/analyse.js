import { glossary, skillVocabulary } from './vocabulary.js'

// A rule-based job analyser. It reads the text of a job description and compares each
// requirement with the evidence a person has saved. It never invents anything, gives no
// score, and does not predict whether someone will be hired.

const HEADINGS = [
  ['about', /^(about (us|the company|the team|the organi[sz]ation)|who we are|company overview|company profile)\b/i],
  ['responsibilities', /^(key |main |core )?(responsibilities|duties|tasks)\b|^(what you('|’)ll do|what you will do|what you will be doing|the role|role overview|your role|day[- ]to[- ]day|job summary|job description|overview)\b/i],
  ['requirements', /^(requirements|qualifications|what you('|’)ll need|what you will need|what we('|’)re looking for|who you are|essential|you will have|you have|must have|minimum|candidate profile|person specification|skills|experience|education)\b/i],
  ['preferred', /^(preferred|nice to have|desirable|bonus|advantages?|good to have|would be an advantage|extra points|a plus)\b/i],
  ['benefits', /^(benefits|what we offer|we offer|compensation|salary|perks|why join)\b/i],
  ['apply', /^(how to apply|to apply|application|deadline|closing date)\b/i],
]
const PREFERRED_CUES = /\b(preferred|desirable|an? (advantage|plus|bonus|asset)|nice to have|good to have|ideally|would be (an? )?(advantage|plus|asset)|not essential)\b/i
const ESSENTIAL_CUES = /\b(required|must|essential|minimum|need to|needs to|we need|looking for|seeking|should have|mandatory)\b/i
const EDUCATION_CUE = /\b(degree|b\.?sc|hnd|ond|diploma|bachelor|master|msc|certificate|certification|nysc|graduate)\b/i
const GENERIC = new Set(['experience', 'ability', 'strong', 'excellent', 'good', 'skills', 'skill', 'working', 'knowledge', 'understanding', 'proven', 'demonstrated', 'relevant', 'candidate', 'ability', 'able', 'years', 'must', 'will', 'have', 'with', 'that', 'this', 'their', 'from', 'such', 'other', 'including', 'which', 'within', 'across', 'about', 'where', 'while', 'being', 'also', 'etc'])

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
export const hasTerm = (text, term) => new RegExp(`(^|[^a-z0-9])${escapeRe(term)}s?([^a-z0-9]|$)`, 'i').test(text)
const stripBullet = (l) => l.replace(/^[\s\u2022\u25CF\u25AA\u25BA•·▪►>*\-–—]+/, '').replace(/^\(?\d{1,2}[.)]\s+/, '').trim()

function headingOf(line) {
  const t = line.replace(/[:*#]+$/, '').replace(/^[#*\s]+/, '').trim()
  const words = t.split(/\s+/).length
  if (t.length < 3 || t.length > 60 || /[.;]$/.test(line.trim())) return null
  if (!line.trim().endsWith(':') && words > 5) return null
  const hit = HEADINGS.find(([, re]) => re.test(t))
  return hit ? hit[0] : null
}

function splitLong(line) {
  if (line.length <= 120) return [line]
  return line.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 3)
}

export function looksLikeLink(input) {
  const t = input.trim()
  return /^(https?:\/\/|www\.)\S+$/i.test(t)
}

function skillsIn(text) {
  return skillVocabulary.filter((s) => s.terms.some((t) => hasTerm(text, t)))
}

function significantWords(text) {
  return [...new Set((text.toLowerCase().match(/[a-z][a-z-]{4,}/g) || []).filter((w) => !GENERIC.has(w)))].slice(0, 6)
}

export function parseJob(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const first = lines[0] ? stripBullet(lines[0]) : ''
  const titleLine = first && first.length <= 100 && !headingOf(lines[0]) && !/[.!?]$/.test(first)
  const title = titleLine ? first.replace(/^(job title|position|role)\s*[:\-–]\s*/i, '') : 'Untitled role'
  const buckets = { intro: [], about: [], responsibilities: [], requirements: [], preferred: [], benefits: [], apply: [] }
  let section = 'intro'
  for (const line of lines.slice(titleLine ? 1 : 0)) {
    const h = headingOf(line)
    if (h) { section = h; continue }
    buckets[section].push(...splitLong(stripBullet(line)).filter((s) => s.length > 2))
  }

  const items = []
  const add = (text, level, inferred = false) => {
    if (!items.some((i) => i.text.toLowerCase() === text.toLowerCase())) items.push({ text, level, inferred })
  }
  for (const t of buckets.requirements) add(t, PREFERRED_CUES.test(t) ? 'preferred' : 'essential')
  for (const t of buckets.preferred) add(t, 'preferred')
  // Requirement-sounding lines that sit outside a requirements section.
  for (const t of [...buckets.intro, ...buckets.about, ...buckets.responsibilities]) {
    if (PREFERRED_CUES.test(t)) add(t, 'preferred')
    else if (ESSENTIAL_CUES.test(t) && (skillsIn(t).length || EDUCATION_CUE.test(t))) add(t, 'essential')
  }
  let inferred = false
  if (items.length < 2) {
    inferred = items.length === 0
    for (const t of [...buckets.responsibilities, ...buckets.intro]) if (skillsIn(t).length) add(t, 'essential', true)
    inferred = items.some((i) => i.inferred)
  }
  const responsibilities = (buckets.responsibilities.length ? buckets.responsibilities : buckets.intro).slice(0, 8)
  const terms = glossary.filter((g) => hasTerm(text, g.term))
  return { title, responsibilities, items, inferred, terms }
}

// Compare one requirement with the person's saved evidence.
function match(item, evidence) {
  const skills = skillsIn(item.text)
  const words = significantWords(item.text)
  const withStatement = evidence.experiences.filter((e) => (e.evidence_statement || '').trim())
  const blob = (e) =>
    [e.title, e.role, e.evidence_statement, e.responsibilities, e.achievements, e.situation, ...(e.skills_used || [])]
      .filter(Boolean).join(' ').toLowerCase()

  if (EDUCATION_CUE.test(item.text) && skills.length === 0) {
    return evidence.education.length
      ? { status: 'added', kind: 'education', reason: 'Your education section lists your qualifications. Check they meet this requirement.' }
      : { status: 'needs', kind: 'education', reason: 'You haven’t added any education yet. That doesn’t mean you don’t meet this.' }
  }
  for (const e of withStatement) {
    const b = blob(e)
    const hit = skills.length ? skills.some((s) => s.terms.some((t) => hasTerm(b, t))) : words.filter((w) => b.includes(w)).length >= 2
    if (hit) return { status: 'backed', source: e.id, reason: `Backed by your experience: ${e.title}` }
  }
  if (skills.length) {
    const mentioned = evidence.experiences.find((e) => skills.some((s) => s.terms.some((t) => hasTerm(blob(e), t))))
    if (mentioned) return { status: 'added', reason: `“${mentioned.title}” mentions this but has no evidence statement yet.` }
    const listed = evidence.skills.find((k) => skills.some((s) => s.terms.some((t) => hasTerm(k.name, t)) || hasTerm(k.name, s.name)))
    if (listed) return { status: 'added', reason: `You listed ${listed.name}, but no experience with an evidence statement shows it yet.` }
  }
  return { status: 'needs', reason: 'Nothing in your profile shows this yet. That doesn’t mean you can’t do it.' }
}

export function analyseJob(text, evidence) {
  const parsed = parseJob(text)
  const requirements = parsed.items.map((item, i) => ({ id: i, ...item, skills: skillsIn(item.text).map((s) => s.name), ...match(item, evidence) }))
  const count = (s) => requirements.filter((r) => r.status === s).length
  const essential = requirements.filter((r) => r.level === 'essential')
  const prepare = []
  for (const r of requirements.filter((x) => x.status === 'needs' && x.level === 'essential').slice(0, 3)) prepare.push(`Find a real example that shows: ${r.text.length > 90 ? r.text.slice(0, 87) + '…' : r.text}`)
  for (const r of requirements.filter((x) => x.status === 'added').slice(0, 2)) {
    prepare.push(r.kind === 'education' ? `Check your education entries meet: ${r.text.slice(0, 70)}` : `Add an example (a project, SIWES, volunteering or study) that shows: ${r.skills[0] || r.text.slice(0, 60)}`)
  }
  if (parsed.terms.length) prepare.push('Look over the terms explained below, so none of them catch you out.')
  return {
    ...parsed,
    requirements,
    prepare,
    counts: { total: requirements.length, backed: count('backed'), added: count('added'), needs: count('needs'), essentialTotal: essential.length, essentialBacked: essential.filter((r) => r.status === 'backed').length },
  }
}
