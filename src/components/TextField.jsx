import { useState } from 'react'

const base = 'w-full rounded-xl border px-3 py-3'
const look = (error) => (error ? 'border-[#b3402a] bg-[#fff6f3]' : 'border-[#b9cdbf] bg-cream')

function Wrap({ id, label, optional, hint, error, className = '', children }) {
  return (
    <div className={`mt-4 ${className}`}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
}

const describe = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined)

export function TextField({ label, id, error, hint, optional, className, ...props }) {
  return (
    <Wrap {...{ id, label, optional, hint, error, className }}>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={describe(id, error, hint)} className={`${base} ${look(error)}`} {...props} />
    </Wrap>
  )
}

export function TextArea({ label, id, error, hint, optional, className, rows = 3, ...props }) {
  return (
    <Wrap {...{ id, label, optional, hint, error, className }}>
      <textarea id={id} rows={rows} aria-invalid={Boolean(error)} aria-describedby={describe(id, error, hint)} className={`${base} ${look(error)}`} {...props} />
    </Wrap>
  )
}

export function SelectField({ label, id, error, hint, optional, className, options, ...props }) {
  return (
    <Wrap {...{ id, label, optional, hint, error, className }}>
      <select id={id} aria-invalid={Boolean(error)} className={`${base} ${look(error)}`} {...props}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Wrap>
  )
}

export function PasswordField({ label = 'Password', id, error, hint, ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div className="mt-4">
      <div className="mb-1 flex items-end justify-between">
        <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
        <button type="button" onClick={() => setShow(!show)} className="min-h-9 text-sm font-semibold underline">
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        aria-invalid={Boolean(error)}
        aria-describedby={describe(id, error, hint)}
        className={`${base} ${look(error)}`}
        {...props}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
}
