import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anon)
if (!supabaseConfigured) {
  // The app still renders (with a setup banner) so the deployment is
  // diagnosable, but no data is faked.
  console.warn('Supabase env vars are missing — see README > Setup.')
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anon || 'placeholder-anon-key',
)
