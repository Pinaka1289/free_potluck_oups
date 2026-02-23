import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventPageClient } from './EventPageClient'
import type { Event, Item } from '@/types/database'

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

  const typedEvent = event as { title: string; description: string | null } | null

  if (!typedEvent) {
    return {
      title: 'Event Not Found',
    }
  }

  return {
    title: `${typedEvent.title} | PotluckPartys`,
    description: typedEvent.description || 'Join this potluck event and claim what you\'re bringing!',
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

  const typedEvent = event as unknown as Event | null

  if (error || !typedEvent) {
    notFound()
  }

  const { data: items } = await supabase
    .from('potluckpartys_items')
    .select('*')
    .eq('event_id', typedEvent.id)
    .order('category', { ascending: true })
    .order('created_at', { ascending: true })

  const typedItems = (items || []) as unknown as Item[]

  return <EventPageClient event={typedEvent} initialItems={typedItems} />
}
