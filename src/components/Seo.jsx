import { useContext, useEffect } from 'react'
import { HeadContext } from '../lib/HeadContext'
import { applyHead } from '../lib/head'

// Put <Seo ... /> in every page. It sets the title, description, canonical link and structured data.
export default function Seo({ title, description, path = '/', noindex = false, type = 'website', jsonLd }) {
  const ctx = useContext(HeadContext)
  const data = { title, description, path, noindex, type, jsonLd }
  if (ctx) ctx.set(data) // during the build

  useEffect(() => {
    applyHead({ title, description, path, noindex, type, jsonLd })
  }, [title, description, path, noindex, type, jsonLd])

  return null
}
