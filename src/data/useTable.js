import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/useAuth'

// Loads one of the signed-in person's tables and gives simple add / update / remove actions.
// The database rules (RLS) make sure it can only ever return and change their own rows.
export function useTable(table, orderBy = 'created_at') {
  const { user } = useAuth()
  const userId = user?.id
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0) // bump this to load the table again

  useEffect(() => {
    if (!supabase || !userId) return undefined
    let cancelled = false
    supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError('We couldn’t load this. Please refresh the page.')
        } else {
          setRows(data)
          setError('')
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [table, orderBy, userId, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const add = async (values) => {
    const res = await supabase.from(table).insert({ ...values, user_id: userId }).select().single()
    if (!res.error) reload()
    return res
  }
  const update = async (id, values) => {
    const res = await supabase.from(table).update(values).eq('id', id).select().single()
    if (!res.error) reload()
    return res
  }
  const remove = async (id) => {
    const res = await supabase.from(table).delete().eq('id', id)
    if (!res.error) reload()
    return res
  }
  return { rows, loading, error, add, update, remove, reload }
}
