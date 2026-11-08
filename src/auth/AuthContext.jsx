import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './context'

const PROFILE_FIELDS = 'full_name, stage, target_role, onboarding_done, phone, location, link, summary'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profileState, setProfileState] = useState({ id: null, data: null })
  // If Supabase is not configured there is nothing to wait for.
  const [loading, setLoading] = useState(Boolean(supabase))

  // Find out who is signed in, and keep listening for changes (login, logout, verified email).
  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id

  // Load this person's profile row (the database only ever returns their own).
  useEffect(() => {
    if (!supabase || !userId) return
    supabase
      .from('profiles')
      .select(PROFILE_FIELDS)
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => setProfileState({ id: userId, data }))
  }, [userId])

  const profile = profileState.id === userId ? profileState.data : null

  const updateProfile = useCallback(
    async (patch) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select(PROFILE_FIELDS)
        .single()
      if (!error) setProfileState({ id: userId, data })
      return { data, error }
    },
    [userId],
  )

  const signOut = useCallback(() => supabase?.auth.signOut(), [])

  const value = useMemo(
    () => ({ configured: Boolean(supabase), session, user: session?.user ?? null, profile, loading, updateProfile, signOut }),
    [session, profile, loading, updateProfile, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
