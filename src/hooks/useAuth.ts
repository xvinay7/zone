// useAuth — anonymous Supabase authentication.
// Creates a real auth.users row on first visit (satisfies all RLS policies).
// Session is persisted in sessionStorage by the Supabase client so subsequent
// page loads reuse the same anonymous user without a network round-trip.

import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase/client'

export interface UseAuthResult {
  /** UUID of the signed-in user, or null while auth is initialising. */
  userId: string | null
  /** True only during the initial session check / sign-in call. */
  loading: boolean
}

export function useAuth(): UseAuthResult {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function init() {
      // Reuse an existing session (token refresh is handled automatically).
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        if (!cancelled) {
          setUserId(session.user.id)
          setLoading(false)
        }
        return
      }

      // No session → create an anonymous user.
      const { data, error } = await supabase.auth.signInAnonymously()
      if (!cancelled) {
        if (error) {
          console.error('[useAuth] Anonymous sign-in failed:', error.message)
        } else {
          setUserId(data.user?.id ?? null)
        }
        setLoading(false)
      }
    }

    void init()

    // Keep userId in sync if the session is refreshed or invalidated externally.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUserId(session?.user?.id ?? null)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { userId, loading }
}
