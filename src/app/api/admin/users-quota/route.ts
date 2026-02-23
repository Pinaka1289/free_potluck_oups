import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { AI_QUOTA_LIMIT } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const adminCheck = await requireAdmin(user?.id ?? null)
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: 403 }
    )
  }

  const searchParams = req.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const searchEmail = searchParams.get('search') || null

  try {
    const { data, error } = await supabase.rpc('get_all_users_quota_info', {
      p_default_quota: AI_QUOTA_LIMIT,
      p_limit: limit,
      p_offset: offset,
      p_search_email: searchEmail,
    } as never)

    if (error) {
      console.error('Admin quota fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users: data || [] })
  } catch (err) {
    console.error('Admin quota API error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to fetch users'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
