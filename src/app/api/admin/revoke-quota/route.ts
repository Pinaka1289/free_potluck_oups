import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

type Body = {
  userId: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const adminCheck = await requireAdmin(user?.id ?? null)
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: 403 }
    )
  }

  try {
    const body = (await req.json()) as Body
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.rpc('revoke_ai_quota_override', {
      p_user_id: userId,
    } as never)

    if (error) {
      console.error('Revoke quota error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Revoke quota API error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to revoke quota'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
