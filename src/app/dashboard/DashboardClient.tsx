'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  LayoutDashboard,
  PartyPopper,
  Clock,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime, getEventUrl, copyToClipboard } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import type { Event, Profile } from '@/types/database'

interface EventWithCount extends Event {
  items: { count: number }[]
}

interface Props {
  user: User
  profile: Profile | null
  initialEvents: EventWithCount[]
}

export function DashboardClient({ user, profile, initialEvents }: Props) {
  const { showToast } = useToast()
  const supabase = createClient()
  
  const [events, setEvents] = useState<EventWithCount[]>(initialEvents)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const handleCopyLink = async (event: Event) => {
    const url = getEventUrl(event.slug)
    const success = await copyToClipboard(url)
    if (success) {
      setCopiedId(event.id)
      showToast('Link copied to clipboard!', 'success')
      setTimeout(() => setCopiedId(null), 2000)
    } else {
      showToast('Failed to copy link', 'error')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all items.')) {
      return
    }

    setLoading(eventId)
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      setEvents(prev => prev.filter(e => e.id !== eventId))
      showToast('Event deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting event:', error)
      showToast('Failed to delete event', 'error')
    } finally {
      setLoading(null)
    }
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const upcomingEvents = filteredEvents.filter(event => {
    if (!event.event_date) return true
    return new Date(event.event_date) >= new Date()
  })

  const pastEvents = filteredEvents.filter(event => {
    if (!event.event_date) return false
    return new Date(event.event_date) < new Date()
  })

  return (
    <div className="min-h-screen py-8 md:py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-pattern opacity-30" />
      <div className="absolute -left-64 top-0 h-[500px] w-[500px] rounded-full bg-[rgb(var(--primary))]/5 blur-3xl" />
      <div className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full bg-[rgb(var(--accent))]/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))]">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] md:text-3xl">
                    Welcome, {profile?.full_name || user.email?.split('@')[0]}!
                  </h1>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    Manage all your potluck events
                  </p>
                </div>
              </div>
            </div>
            <Link href="/create">
              <Button icon={<Plus className="h-4 w-4" />}>
                Create New Event
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 sm:grid-cols-3"
        >
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--primary))]/20">
                <PartyPopper className="h-6 w-6 text-[rgb(var(--primary))]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[rgb(var(--foreground))]">
                  {events.length}
                </div>
                <div className="text-sm text-[rgb(var(--muted-foreground))]">Total Events</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                <Calendar className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[rgb(var(--foreground))]">
                  {upcomingEvents.length}
                </div>
                <div className="text-sm text-[rgb(var(--muted-foreground))]">Upcoming</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[rgb(var(--foreground))]">
                  {events.reduce((acc, event) => acc + (event.items[0]?.count || 0), 0)}
                </div>
                <div className="text-sm text-[rgb(var(--muted-foreground))]">Total Items</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-5 w-5" />}
            className="max-w-md"
          />
        </motion.div>

        {/* Events List */}
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--secondary))]">
                  <PartyPopper className="h-10 w-10 text-[rgb(var(--muted-foreground))]" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--foreground))]">
                  No events yet
                </h3>
                <p className="mt-2 text-[rgb(var(--muted-foreground))]">
                  Create your first potluck event and start inviting guests!
                </p>
                <Link href="/create">
                  <Button className="mt-6" icon={<Plus className="h-4 w-4" />}>
                    Create Your First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-[rgb(var(--primary))]" />
                    Upcoming Events ({upcomingEvents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-[rgb(var(--border))]">
                    <AnimatePresence mode="popLayout">
                      {upcomingEvents.map((event) => (
                        <EventRow
                          key={event.id}
                          event={event}
                          copiedId={copiedId}
                          loading={loading}
                          onCopy={handleCopyLink}
                          onDelete={handleDeleteEvent}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <Card className="opacity-75">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-[rgb(var(--muted-foreground))]" />
                    Past Events ({pastEvents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-[rgb(var(--border))]">
                    <AnimatePresence mode="popLayout">
                      {pastEvents.map((event) => (
                        <EventRow
                          key={event.id}
                          event={event}
                          copiedId={copiedId}
                          loading={loading}
                          onCopy={handleCopyLink}
                          onDelete={handleDeleteEvent}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredEvents.length === 0 && searchQuery && (
              <div className="py-12 text-center">
                <p className="text-[rgb(var(--muted-foreground))]">
                  No events found matching &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function EventRow({
  event,
  copiedId,
  loading,
  onCopy,
  onDelete
}: {
  event: EventWithCount
  copiedId: string | null
  loading: string | null
  onCopy: (event: Event) => void
  onDelete: (eventId: string) => void
}) {
  const itemCount = event.items[0]?.count || 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex-1 min-w-0">
        <Link 
          href={`/event/${event.slug}`}
          className="group flex items-center gap-2"
        >
          <h3 className="font-semibold text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors truncate">
            {event.title}
          </h3>
          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[rgb(var(--primary))]" />
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[rgb(var(--muted-foreground))]">
          {event.event_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(event.event_date)}
            </span>
          )}
          {event.event_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(event.event_time)}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {event.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {itemCount} items
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopy(event)}
          icon={copiedId === event.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        >
          {copiedId === event.id ? 'Copied' : 'Copy Link'}
        </Button>
        <Link href={`/event/${event.slug}`}>
          <Button variant="secondary" size="sm">
            View
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          loading={loading === event.id}
          onClick={() => onDelete(event.id)}
          className="text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
