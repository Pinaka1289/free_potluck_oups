import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AI_QUOTA_LIMIT } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  try {
    const { data, error } = await supabase.rpc('get_ai_quota_info', {
      p_user_id: user.id,
      p_default_quota: AI_QUOTA_LIMIT,
    } as never)

    if (error) {
      console.error('Quota info error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Quota info API error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to get quota info'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
