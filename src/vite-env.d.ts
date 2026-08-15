/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_NOMINATIM_BASE_URL?: string
  readonly VITE_APP_USER_AGENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
