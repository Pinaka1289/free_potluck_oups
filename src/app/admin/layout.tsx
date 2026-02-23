import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel | PotluckPartys',
  description: 'Admin panel for managing AI quota and users',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      redirect('/auth?redirect=/admin')
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      redirect('/')
    }

    return <>{children}</>
  } catch (error) {
    console.error('Admin layout error:', error)
    redirect('/')
  }
}
