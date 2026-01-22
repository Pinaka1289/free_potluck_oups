import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

export const metadata = {
  title: 'Dashboard | PotluckPartys',
  description: 'Manage your potluck events'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Fetch user's events
  const { data: events } = await supabase
    .from('potluckpartys_events')
    .select(`
      *,
      items:potluckpartys_items(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch user profile
  const { data: profile } = await supabase
    .from('potluckpartys_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <DashboardClient 
      user={user} 
      profile={profile} 
      initialEvents={events || []} 
    />
  )
}
