'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
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
  Search,
  QrCode,
  Download,
  Bookmark,
  BookmarkX,
  Link2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime, getEventUrl, copyToClipboard } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import type { Event, Profile } from '@/types/database'

interface EventWithCount extends Event {
  items: { count: number }[]
  isBookmarked?: boolean // Flag to identify bookmarked events
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
  const [bookmarkedEvents, setBookmarkedEvents] = useState<EventWithCount[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventWithCount | null>(null)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [eventLinkInput, setEventLinkInput] = useState('')
  const [addingEvent, setAddingEvent] = useState(false)

  // Load bookmarked events from localStorage
  useEffect(() => {
    const loadBookmarkedEvents = async () => {
      const savedSlugs = JSON.parse(localStorage.getItem(`savedEvents_${user.id}`) || '[]')
      
      if (savedSlugs.length === 0) return

      // Filter out events that the user already owns
      const ownedSlugs = initialEvents.map(e => e.slug)
      const bookmarkedSlugs = savedSlugs.filter((slug: string) => !ownedSlugs.includes(slug))

      if (bookmarkedSlugs.length === 0) return

      try {
        const { data, error } = await supabase
          .from('potluckpartys_events')
          .select(`
            *,
            items:potluckpartys_items(count)
          `)
          .in('slug', bookmarkedSlugs)
          .order('event_date', { ascending: true })

        if (error) throw error

        // Mark these events as bookmarked
        const bookmarkedWithFlag = (data || []).map((event: EventWithCount) => ({
          ...event,
          isBookmarked: true
        })) as EventWithCount[]

        setBookmarkedEvents(bookmarkedWithFlag)
      } catch (error) {
        console.error('Error loading bookmarked events:', error)
      }
    }

    loadBookmarkedEvents()
  }, [user.id, initialEvents, supabase])

  // Combine owned and bookmarked events for display
  const allEvents = [...events, ...bookmarkedEvents]

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

  const openQRModal = (event: EventWithCount) => {
    setSelectedEvent(event)
    setShowQRModal(true)
  }

  const handleDeleteEvent = async (eventId: string, isBookmarked?: boolean) => {
    // If it's a bookmarked event, just remove from bookmarks
    if (isBookmarked) {
      const eventToRemove = bookmarkedEvents.find(e => e.id === eventId)
      if (!eventToRemove) return

      if (!confirm('Remove this event from your dashboard? The event will still exist.')) {
        return
      }

      // Remove from localStorage
      const savedSlugs = JSON.parse(localStorage.getItem(`savedEvents_${user.id}`) || '[]')
      const updatedSlugs = savedSlugs.filter((slug: string) => slug !== eventToRemove.slug)
      localStorage.setItem(`savedEvents_${user.id}`, JSON.stringify(updatedSlugs))

      // Remove from state
      setBookmarkedEvents(prev => prev.filter(e => e.id !== eventId))
      showToast('Event removed from dashboard', 'success')
      return
    }

    // For owned events, delete from database
    if (!confirm('Are you sure you want to delete this event? This will also delete all items.')) {
      return
    }

    setLoading(eventId)
    try {
      const { error } = await supabase
        .from('potluckpartys_events')
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

  // Extract event slug from link or code
  const extractSlugFromLink = (input: string): string => {
    const trimmed = input.trim()
    
    // If it's a full URL, extract the slug
    if (trimmed.includes('/event/')) {
      const match = trimmed.match(/\/event\/([a-zA-Z0-9-_]+)/)
      return match ? match[1] : trimmed
    }
    
    // If it's just the slug/code
    return trimmed
  }

  // Add event by link/code
  const handleAddEventByLink = async () => {
    if (!eventLinkInput.trim()) {
      showToast('Please enter an event link or code', 'error')
      return
    }

    const slug = extractSlugFromLink(eventLinkInput)
    
    // Check if already in owned events
    if (events.some(e => e.slug === slug)) {
      showToast('This event is already in your dashboard (you own it)', 'info')
      setEventLinkInput('')
      setShowAddEventModal(false)
      return
    }

    // Check if already in bookmarked events
    if (bookmarkedEvents.some(e => e.slug === slug)) {
      showToast('This event is already saved to your dashboard', 'info')
      setEventLinkInput('')
      setShowAddEventModal(false)
      return
    }

    setAddingEvent(true)
    try {
      // Fetch the event to verify it exists
      const { data: eventData, error } = await supabase
        .from('potluckpartys_events')
        .select(`
          *,
          items:potluckpartys_items(count)
        `)
        .eq('slug', slug)
        .single()

      if (error || !eventData) {
        showToast('Event not found. Please check the link or code.', 'error')
        return
      }

      const typedEventData = eventData as unknown as EventWithCount

      // If user owns this event, it should already be in their list
      if (typedEventData.user_id === user.id) {
        showToast('This event is already in your dashboard', 'info')
        setEventLinkInput('')
        setShowAddEventModal(false)
        return
      }

      // Add to localStorage bookmarks
      const savedSlugs = JSON.parse(localStorage.getItem(`savedEvents_${user.id}`) || '[]')
      if (!savedSlugs.includes(slug)) {
        savedSlugs.push(slug)
        localStorage.setItem(`savedEvents_${user.id}`, JSON.stringify(savedSlugs))
      }

      // Add to bookmarked events state
      const newBookmarkedEvent: EventWithCount = {
        ...typedEventData,
        isBookmarked: true
      }
      setBookmarkedEvents(prev => [...prev, newBookmarkedEvent])

      showToast(`"${typedEventData.title}" added to your dashboard!`, 'success')
      setEventLinkInput('')
      setShowAddEventModal(false)
    } catch (error) {
      console.error('Error adding event:', error)
      showToast('Failed to add event. Please try again.', 'error')
    } finally {
      setAddingEvent(false)
    }
  }

  const filteredEvents = allEvents.filter(event =>
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
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowAddEventModal(true)}
                icon={<Bookmark className="h-4 w-4" />}
              >
                Add by Link
              </Button>
              <Link href="/create">
                <Button icon={<Plus className="h-4 w-4" />}>
                  Create New Event
                </Button>
              </Link>
            </div>
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
                  {allEvents.length}
                </div>
                <div className="text-sm text-[rgb(var(--muted-foreground))]">
                  Total Events {bookmarkedEvents.length > 0 && (
                    <span className="text-xs">({events.length} owned, {bookmarkedEvents.length} saved)</span>
                  )}
                </div>
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
                  {allEvents.reduce((acc, event) => acc + (event.items[0]?.count || 0), 0)}
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
        {allEvents.length === 0 ? (
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
                          onShowQR={openQRModal}
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
                          onShowQR={openQRModal}
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

        {/* QR Code Modal */}
        <Modal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false)
            setSelectedEvent(null)
          }}
          title="Event QR Code"
          description={selectedEvent ? `Share "${selectedEvent.title}" with guests` : ''}
        >
          {selectedEvent && (
            <div className="flex flex-col items-center space-y-6">
              <div className="rounded-2xl bg-white p-4 shadow-lg">
                <QRCodeSVG
                  value={getEventUrl(selectedEvent.slug)}
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                  {selectedEvent.title}
                </p>
                <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                  Scan to visit this event
                </p>
              </div>

              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const svg = document.querySelector('.modal-content svg') as SVGElement
                    if (svg) {
                      const svgData = new XMLSerializer().serializeToString(svg)
                      const canvas = document.createElement('canvas')
                      const ctx = canvas.getContext('2d')
                      const img = new Image()
                      img.onload = () => {
                        canvas.width = img.width
                        canvas.height = img.height
                        ctx?.drawImage(img, 0, 0)
                        const link = document.createElement('a')
                        link.download = `${selectedEvent.title.replace(/\s+/g, '-')}-qr-code.png`
                        link.href = canvas.toDataURL('image/png')
                        link.click()
                      }
                      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
                    }
                    showToast('QR code downloaded!', 'success')
                  }}
                  icon={<Download className="h-4 w-4" />}
                >
                  Download
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    copyToClipboard(getEventUrl(selectedEvent.slug))
                    showToast('Link copied!', 'success')
                  }}
                  icon={<Copy className="h-4 w-4" />}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Add Event by Link Modal */}
        <Modal
          isOpen={showAddEventModal}
          onClose={() => {
            setShowAddEventModal(false)
            setEventLinkInput('')
          }}
          title="Add Event to Dashboard"
          description="Enter an event link or code to add it to your dashboard"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Event Link or Code
              </label>
              <Input
                placeholder="e.g., https://...event/abc123 or just abc123"
                value={eventLinkInput}
                onChange={(e) => setEventLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddEventByLink()
                  }
                }}
                autoFocus
              />
              <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
                Paste the full event URL or just the event code from the link
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowAddEventModal(false)
                  setEventLinkInput('')
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddEventByLink}
                loading={addingEvent}
                icon={<Bookmark className="h-4 w-4" />}
              >
                Add Event
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

function EventRow({
  event,
  copiedId,
  loading,
  onCopy,
  onDelete,
  onShowQR
}: {
  event: EventWithCount
  copiedId: string | null
  loading: string | null
  onCopy: (event: Event) => void
  onDelete: (eventId: string, isBookmarked?: boolean) => void
  onShowQR: (event: EventWithCount) => void
}) {
  const itemCount = event.items[0]?.count || 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
    >
      {/* QR Code */}
      <div 
        className="hidden sm:block flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
        onClick={() => onShowQR(event)}
        title="Click to enlarge QR code"
      >
        <div className="rounded-lg bg-white p-1.5 shadow-sm border border-[rgb(var(--border))]">
          <QRCodeSVG
            value={getEventUrl(event.slug)}
            size={60}
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <Link 
          href={`/event/${event.slug}`}
          className="group flex items-center gap-2"
        >
          <h3 className="font-semibold text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors truncate">
            {event.title}
          </h3>
          {/* Show bookmark badge for saved events */}
          {event.isBookmarked && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Bookmark className="h-3 w-3" />
              Saved
            </span>
          )}
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
        {/* Mobile QR button */}
        <Button
          variant="outline"
          size="sm"
          className="sm:hidden"
          onClick={() => onShowQR(event)}
          icon={<QrCode className="h-4 w-4" />}
        >
          QR
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopy(event)}
          icon={copiedId === event.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        >
          {copiedId === event.id ? 'Copied' : 'Copy'}
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
          onClick={() => onDelete(event.id, event.isBookmarked)}
          className="text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/10"
          title={event.isBookmarked ? 'Remove from dashboard' : 'Delete event'}
        >
          {event.isBookmarked ? <BookmarkX className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  )
}
