export default function Logo({ light = false }) {
  return (
    <span className={`inline-flex items-center gap-2 font-heading text-lg font-bold ${light ? 'text-white' : 'text-forest-dark'}`}>
      <svg width="24" height="24" viewBox="0 0 22 22" aria-hidden="true">
        <rect width="22" height="22" rx="6" fill={light ? '#fff' : '#234B3B'} />
        <path d="M7 15L15 7M8 7h7v7" stroke={light ? '#234B3B' : '#fff'} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
      Pathora
    </span>
  )
}
