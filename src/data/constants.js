export const experienceTypes = [
  { value: 'project', label: 'Project' },
  { value: 'employment', label: 'Employment' },
  { value: 'siwes_internship', label: 'SIWES / Internship' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'leadership', label: 'Leadership / activities' },
]
export const typeLabel = Object.fromEntries(experienceTypes.map((t) => [t.value, t.label]))

export const qualifications = [
  'SSCE / WAEC / NECO',
  'OND',
  'HND',
  'B.Sc. / B.A. / B.Eng.',
  'Postgraduate',
  'Certificate or course',
  'Other',
]

export const skillCategories = ['Technical', 'Professional', 'Tools and software']
export const roleIdeas = ['Customer support', 'Data analysis', 'Software development', 'Business analysis']
