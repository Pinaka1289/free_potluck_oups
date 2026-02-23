import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=no_code', requestUrl.origin))
  }

  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )

  // Exchange code for session
  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
  
  if (sessionError || !sessionData?.user) {
    console.error('OAuth callback error:', sessionError)
    return NextResponse.redirect(new URL('/auth?error=auth_callback_error', requestUrl.origin))
  }

  const user = sessionData.user

  // Ensure profile exists (upsert - create if doesn't exist, update if exists)
  try {
    const { error: profileError } = await supabase
      .from('potluckpartys_profiles')
      .upsert(
        {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        },
        {
          onConflict: 'id',
        }
      )

    if (profileError) {
      console.error('Profile upsert error:', profileError)
      // Continue anyway - profile might already exist
    }
  } catch (profileErr) {
    console.error('Profile creation error:', profileErr)
    // Continue anyway - profile might already exist from trigger
  }

  // Verify session is established by getting user
  const { data: { user: verifiedUser }, error: verifyError } = await supabase.auth.getUser()
  
  if (verifyError || !verifiedUser) {
    console.error('Session verification error:', verifyError)
    return NextResponse.redirect(new URL('/auth?error=session_not_established', requestUrl.origin))
  }

  // Success - redirect to intended destination
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
