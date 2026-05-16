import { useAuth } from '@clerk/clerk-react'
import { getAuthenticatedSupabase } from '../lib/supabaseClient'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Hook that provides an authenticated Supabase client via Clerk JWT.
 * Use in all admin components that need write access to Supabase.
 *
 * Usage:
 *   const { getClient, isSignedIn, isLoaded } = useAuthenticatedSupabase()
 *
 *   const handleSave = async () => {
 *     if (!isSignedIn) { toast.error('Sign in required'); return }
 *     const authSupabase = await getClient()
 *     const { data, error } = await authSupabase.from('events').insert([...])
 *   }
 */
export const useAuthenticatedSupabase = () => {
  const { getToken, isSignedIn, isLoaded } = useAuth()

  const getClient = async (): Promise<SupabaseClient> => {
    if (!isLoaded) {
      throw new Error('Clerk is not loaded yet. Please wait.')
    }

    if (!isSignedIn) {
      console.error('[AUTH HOOK] User is not signed in')
      throw new Error('You must be signed in to perform this action')
    }

    return await getAuthenticatedSupabase(getToken)
  }

  return { getClient, isSignedIn, isLoaded }
}
