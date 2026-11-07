const tones = {
  success: 'bg-sage border-[#b9cdbf]',
  error: 'bg-[#fbe3dc] border-[#e7b3a5] text-[#6b2415]',
}

export default function Alert({ tone = 'success', children }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-xl border px-4 py-3 ${tones[tone]}`}>
      {children}
    </div>
  )
}
