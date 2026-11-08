// Small helpers shared by the experience form and the Evidence Builder.
export const toSkills = (text) => [...new Set(text.split(',').map((s) => s.trim()).filter(Boolean))]

// A starting point for an evidence statement: the person's OWN sentences, joined.
// Nothing is added, reworded or invented.
export const assembleStatement = (v) =>
  [v.responsibilities, v.achievements].map((s) => (s || '').trim()).filter(Boolean).join(' ').slice(0, 600)

// Skills used in an experience are added to the Skills list (if they are not there yet).
export async function addMissingSkills(skillsTable, names) {
  const have = new Set(skillsTable.rows.map((s) => s.name.toLowerCase()))
  for (const name of names.filter((n) => !have.has(n.toLowerCase()))) {
    await skillsTable.add({ name, category: 'Technical' })
  }
}

export const draftKey = (userId) => `pathora-draft-evidence-${userId}`
