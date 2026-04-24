import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function verifySupabaseConnection() {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message:
        'Supabase environment variables are missing. Configure your .env first.',
    }
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    })

    if (response.ok) {
      return { ok: true, message: 'Supabase connection is healthy.' }
    }

    return {
      ok: false,
      message: `Supabase health check failed with status ${response.status}.`,
    }
  } catch (error) {
    return {
      ok: false,
      message: `Supabase health check failed: ${error.message}`,
    }
  }
}
