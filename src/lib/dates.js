// Dates are typed as month and year (for example "Jan 2025"), so we check them gently.
const parse = (t) => {
  const d = new Date(`1 ${String(t).trim()}`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function endBeforeStart(start, end) {
  const s = start && parse(start)
  const e = end && parse(end)
  return Boolean(s && e && e < s)
}

export const isWebAddress = (s) => /^https?:\/\/\S+\.\S+/.test(s.trim())
