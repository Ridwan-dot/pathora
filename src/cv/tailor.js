import { skillVocabulary } from '../analyser/vocabulary.js'
import { hasTerm } from '../analyser/analyse.js'

// Tailoring only REORDERS and HIGHLIGHTS what is already in a CV.
// It never adds a skill, an experience, a sentence or a number.

function indexFor(content, profileExp, used) {
  const bySource = content.experiences.findIndex((x, i) => !used.has(i) && x.source_id && x.source_id === profileExp.id)
  if (bySource >= 0) return bySource
  return content.experiences.findIndex((x, i) => !used.has(i) && x.title === profileExp.title)
}

export function tailorSuggestions(content, analysis, profileExperiences) {
  const suggestions = []
  const backed = analysis.requirements.filter((r) => r.status === 'backed')

  // 1. Experiences that back this job's requirements come first.
  const score = new Map()
  for (const r of backed) if (r.source) score.set(r.source, (score.get(r.source) || 0) + (r.level === 'essential' ? 2 : 1))
  const used = new Set()
  const ranked = []
  for (const exp of profileExperiences.filter((e) => score.has(e.id))) {
    const i = indexFor(content, exp, used)
    if (i >= 0 && content.experiences[i].include) { used.add(i); ranked.push({ i, exp, points: score.get(exp.id) }) }
  }
  ranked.sort((a, b) => b.points - a.points || a.i - b.i)
  const front = ranked.map((r) => r.i)
  const rest = content.experiences.map((_, i) => i).filter((i) => !front.includes(i))
  const newOrder = [...front, ...rest]
  if (newOrder.some((v, k) => v !== k)) {
    suggestions.push({
      id: 'experience-order',
      title: 'Put the most relevant experience first',
      detail: ranked.map((r) => `“${r.exp.title}” backs ${r.points >= 2 ? 'an essential requirement' : 'a preferred requirement'} of this job`).join('; ') + '.',
      apply: (c) => ({ ...c, experiences: newOrder.map((i) => c.experiences[i]) }),
    })
  }

  // 2. Skills the job asks for, which your evidence already backs, are shown first.
  const wanted = new Set()
  for (const r of backed) for (const name of r.skills) wanted.add(name)
  const toFeature = []
  content.skills.forEach((s, i) => {
    if (!s.include || s.featured) return
    const hit = skillVocabulary.some((v) => wanted.has(v.name) && (v.name.toLowerCase() === s.name.toLowerCase() || v.terms.some((t) => hasTerm(s.name, t))))
    if (hit) toFeature.push(i)
  })
  if (toFeature.length) {
    suggestions.push({
      id: 'skills-first',
      title: 'Show the skills this job asks for first',
      detail: `${toFeature.map((i) => content.skills[i].name).join(', ')}: asked for in this job, and backed by your evidence.`,
      apply: (c) => ({ ...c, skills: c.skills.map((s, i) => (toFeature.includes(i) ? { ...s, featured: true } : s)) }),
    })
  }

  const gaps = analysis.requirements.filter((r) => r.status !== 'backed')
  return { suggestions, gaps }
}
