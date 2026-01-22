import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventPageClient } from './EventPageClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: event } = await supabase
    .from('potluckpartys_events')
    .select('title, description')
    .eq('slug', slug)
    .single()

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  return {
    title: `${event.title} | PotluckPartys`,
    description: event.description || 'Join this potluck event and claim what you\'re bringing!',
  }
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: event, error } = await supabase
    .from('potluckpartys_events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !event) {
    notFound()
  }

  const { data: items } = await supabase
    .from('potluckpartys_items')
    .select('*')
    .eq('event_id', event.id)
    .order('category', { ascending: true })
    .order('created_at', { ascending: true })

  return <EventPageClient event={event} initialItems={items || []} />
}
