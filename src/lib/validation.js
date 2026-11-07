export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())

export function passwordProblem(p) {
  if (p.length < 8 || !/[A-Za-z]/.test(p) || !/\d/.test(p)) {
    return 'Use at least 8 characters, with a letter and a number.'
  }
  return ''
}
