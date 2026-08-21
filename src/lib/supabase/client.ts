import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let _supabase: ReturnType<typeof createClient<Database>> | null = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.error(
      '[Remind] Failed to initialize Supabase client. ' +
        'Check that VITE_SUPABASE_URL is a valid URL and VITE_SUPABASE_ANON_KEY is correct.',
      err,
    )
  }
} else {
  console.warn(
    '[Remind] Supabase env vars not set. ' +
      'Copy .env.example → .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

/** True only when the Supabase client was successfully created. */
export const isSupabaseConfigured = _supabase !== null

/**
 * The Supabase client.
 * ONLY safe to call when `isSupabaseConfigured === true`.
 * Cast as non-nullable so the data layer doesn't need pervasive null checks —
 * every call site must guard with `isSupabaseConfigured` first.
 */
export const supabase = _supabase as ReturnType<typeof createClient<Database>>
