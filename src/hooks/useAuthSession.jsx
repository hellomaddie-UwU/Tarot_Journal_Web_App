import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { AuthSessionContext } from './authSessionContext'

export function AuthSessionProvider({ children }) {
  const [session, setSession] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined
    }

    let isMounted = true

    const syncInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error) {
        setErrorMessage(error.message)
        setSession(null)
        setIsLoading(false)
        return
      }

      setSession(data.session)
      setIsLoading(false)
    }

    syncInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return
      }

      setErrorMessage('')
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthSessionContext.Provider
      value={{
        errorMessage,
        isConfigured: isSupabaseConfigured,
        isLoading,
        session,
        user: session?.user ?? null,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  )
}