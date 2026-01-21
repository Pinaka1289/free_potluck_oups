import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    // Return a mock client for development when Supabase is not configured
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
        signInWithPassword: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Supabase not configured') }),
            order: () => ({
              order: async () => ({ data: [], error: null })
            })
          }),
          order: () => ({
            order: async () => ({ data: [], error: null })
          })
        }),
        insert: async () => ({ error: new Error('Supabase not configured') }),
        update: () => ({
          eq: async () => ({ error: new Error('Supabase not configured') })
        }),
        delete: () => ({
          eq: async () => ({ error: new Error('Supabase not configured') })
        })
      }),
      channel: () => ({
        on: () => ({
          subscribe: () => ({})
        })
      }),
      removeChannel: () => {}
    } as unknown as ReturnType<typeof createBrowserClient<Database>>
  }
  
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
