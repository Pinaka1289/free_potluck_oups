import { createClient } from '@/lib/supabase/server'

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('potluckpartys_profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()
  
  if (error || !data) return false
  return (data as { is_admin?: boolean }).is_admin === true
}

export async function requireAdmin(userId: string | null): Promise<{ isAdmin: boolean; error?: string }> {
  if (!userId) {
    return { isAdmin: false, error: 'Not authenticated' }
  }
  
  const admin = await isAdmin(userId)
  if (!admin) {
    return { isAdmin: false, error: 'Admin access required' }
  }
  
  return { isAdmin: true }
}
