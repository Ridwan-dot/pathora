import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/settings', label: 'Account and sign-in', end: true },
  { to: '/settings/privacy', label: 'Privacy and data' },
]

export default function SettingsNav() {
  return (
    <nav aria-label="Settings" className="mt-3 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `min-h-10 rounded-full border px-4 py-2 ${isActive ? 'border-forest bg-sage font-semibold' : 'border-[#b9cdbf] bg-white'}`}>{t.label}</NavLink>
      ))}
    </nav>
  )
}
