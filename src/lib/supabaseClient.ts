import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════════
// REQUIRED MANUAL SETUP — DO THIS FIRST
// ═══════════════════════════════════════════════════════
//
// 1. Go to: https://dashboard.clerk.com
// 2. Select your application
// 3. Navigate to: Configure → JWT Templates
// 4. Click "New template"
// 5. Select "Supabase" from the list
// 6. The template will auto-populate with the correct claims
// 7. IMPORTANT: Name the template exactly: "supabase"
//    (case sensitive — must be lowercase)
// 8. Go to: https://supabase.com/dashboard
// 9. Select your project → Settings → API → JWT Settings
// 10. Copy the "JWT Secret" value
// 11. Back in Clerk: paste this as the "Signing key"
// 12. Save the template
//
// Without this setup, getToken({ template: 'supabase' })
// returns null and all admin operations fail with
// "alg header not allowed" or RLS policy violations.
// ═══════════════════════════════════════════════════════

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// ─────────────────────────────────────────────────────
// PUBLIC CLIENT (anon access)
// Use for: reading events, reading exhibition images,
//          inserting registrations (public visitors)
// Do NOT use for any admin write operations
// ─────────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─────────────────────────────────────────────────────
// AUTHENTICATED CLIENT FACTORY
// Use for: all admin operations (INSERT/UPDATE/DELETE)
// Requires Clerk getToken function from useAuth()
// Passes Clerk JWT to satisfy Supabase RLS policies
// ─────────────────────────────────────────────────────
export const getAuthenticatedSupabase = async (
  getToken: (options?: { template?: string }) => Promise<string | null>
): Promise<SupabaseClient> => {


  const token = await getToken({ template: 'supabase' })

  if (!token) {
    console.error('[AUTH] getToken({ template: "supabase" }) returned null')
    console.error('[AUTH] Ensure Clerk JWT template named "supabase" exists')
    throw new Error(
      'Authentication failed: No JWT token available. ' +
      'Ensure Clerk JWT template "supabase" is configured.'
    )
  }


  const authenticatedClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )

  return authenticatedClient
}

// Type helper for components
export type AuthenticatedSupabase = Awaited<
  ReturnType<typeof getAuthenticatedSupabase>
>
