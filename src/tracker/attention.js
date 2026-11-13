// "Needs attention" is worked out from real dates. It is never a fixed number.
export const STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Not selected', 'Withdrawn']
export const OPEN = ['Saved', 'Applied', 'Interview']

const toDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
export const daysFrom = (from, to) => Math.round((toDay(to) - toDay(from)) / 86400000)
export const todayISO = () => new Date().toLocaleDateString('en-CA')
export const nowISO = () => new Date().toISOString()
export const niceDate = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '')

const plural = (n) => `${n} day${n === 1 ? '' : 's'}`

export function attentionFor(app, today) {
  const out = []
  if (!OPEN.includes(app.status)) return out
  if (app.next_action && app.next_action_due) {
    const d = daysFrom(today, app.next_action_due)
    if (d < 0) out.push({ level: 2, text: `next action overdue by ${plural(-d)}` })
    else if (d <= 3) out.push({ level: 1, text: d === 0 ? 'next action due today' : d === 1 ? 'next action due tomorrow' : `next action due in ${plural(d)}` })
  }
  if (app.status === 'Saved' && app.deadline) {
    const d = daysFrom(today, app.deadline)
    if (d < 0) out.push({ level: 2, text: `deadline passed ${plural(-d)} ago` })
    else if (d <= 7) out.push({ level: 1, text: d === 0 ? 'deadline is today' : `deadline in ${plural(d)}` })
  }
  return out
}

// Applications that need attention, most urgent first.
export function attentionList(apps, today) {
  return apps
    .map((app) => {
      const items = attentionFor(app, today)
      return { app, items, level: Math.max(0, ...items.map((i) => i.level)) }
    })
    .filter((x) => x.items.length)
    .sort((a, b) => b.level - a.level)
}

export const statusTone = { Saved: 'add', Applied: 'ok', Interview: 'ok', Offer: 'ok', 'Not selected': 'add', Withdrawn: 'add' }
