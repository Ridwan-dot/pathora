const tones = {
  ok: 'bg-ok',
  add: 'bg-sage border border-[#b9cdbf]',
  need: 'bg-need text-need-text',
}

export default function Pill({ tone = 'add', children }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}
