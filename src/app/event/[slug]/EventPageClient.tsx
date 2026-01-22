'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Copy,
  Check,
  Plus,
  Edit2,
  Trash2,
  Share2,
  Link as LinkIcon,
  Utensils,
  ChefHat,
  LayoutGrid,
  Table2,
  QrCode,
  Download,
  LogIn,
  Bookmark,
  X
} from 'lucide-react'
import Link from 'next/link'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime, getEventUrl, copyToClipboard, ITEM_CATEGORIES, CATEGORY_STYLES, cn } from '@/lib/utils'
import type { Event, Item, ItemCategory } from '@/types/database'

interface Props {
  event: Event
  initialItems: Item[]
}

export function EventPageClient({ event, initialItems }: Props) {
  const { showToast } = useToast()
  const supabase = createClient()
  
  const [items, setItems] = useState<Item[]>(initialItems)
  const [copied, setCopied] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(false)
  const [showEditEventModal, setShowEditEventModal] = useState(false)
  const [eventData, setEventData] = useState(event)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table')
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimingItem, setClaimingItem] = useState<Item | null>(null)
  const [claimerName, setClaimerName] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null)
  const [isEventSaved, setIsEventSaved] = useState(false)
  const [savingEvent, setSavingEvent] = useState(false)

  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Main Dishes' as ItemCategory,
    quantity: 1,
    brought_by: '',
    notes: ''
  })

  const [eventForm, setEventForm] = useState({
    title: event.title,
    description: event.description || '',
    event_date: event.event_date || '',
    event_time: event.event_time || '',
    location: event.location || '',
    host_name: event.host_name || ''
  })

  // Real-time subscription for items
  useEffect(() => {
    const channel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'potluckpartys_items',
          filter: `event_id=eq.${event.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems(prev => [...prev, payload.new as Item])
          } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new as Item : item
            ))
          } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(item => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [event.id, supabase])

  // Check user and show welcome modal on first visit
  useEffect(() => {
    const checkUserAndFirstVisit = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Check if event is already saved to user's dashboard (owned or bookmarked)
      if (user) {
        if (event.user_id === user.id) {
          setIsEventSaved(true)
        } else {
          // Check localStorage for bookmarked events
          const savedEvents = JSON.parse(localStorage.getItem(`savedEvents_${user.id}`) || '[]')
          if (savedEvents.includes(event.slug)) {
            setIsEventSaved(true)
          }
        }
      }

      // Check if this is user's first visit to this event
      const visitedEvents = JSON.parse(localStorage.getItem('visitedEvents') || '[]')
      const hasVisited = visitedEvents.includes(event.slug)

      if (!hasVisited) {
        // Show welcome modal for first-time visitors
        setShowWelcomeModal(true)
        // Mark as visited
        localStorage.setItem('visitedEvents', JSON.stringify([...visitedEvents, event.slug]))
      }

      // Check if there's a pending event to save after login
      const pendingEventSlug = localStorage.getItem('pendingEventToSave')
      if (user && pendingEventSlug === event.slug) {
        // Auto-save the event to user's dashboard
        await handleSaveEventToDashboard(user.id)
        localStorage.removeItem('pendingEventToSave')
      }
    }

    checkUserAndFirstVisit()
  }, [event.slug, event.user_id, event.id, supabase])

  // Save event to user's dashboard
  const handleSaveEventToDashboard = async (userId?: string) => {
    const uid = userId || currentUser?.id
    if (!uid) {
      // Store the event slug to save after login
      localStorage.setItem('pendingEventToSave', event.slug)
      showToast('Sign in to save this event to your dashboard', 'info')
      return
    }

    setSavingEvent(true)
    try {
      // If the event has no owner, claim it
      if (!event.user_id) {
        const { error } = await supabase
          .from('potluckpartys_events')
          .update({ user_id: uid })
          .eq('id', event.id)
          .is('user_id', null)

        if (!error) {
          setIsEventSaved(true)
          showToast('Event saved to your dashboard!', 'success')
          setSavingEvent(false)
          return
        }
      }
      
      // If event already has an owner (or claiming failed), bookmark it locally
      const savedEvents = JSON.parse(localStorage.getItem(`savedEvents_${uid}`) || '[]')
      if (!savedEvents.includes(event.slug)) {
        savedEvents.push(event.slug)
        localStorage.setItem(`savedEvents_${uid}`, JSON.stringify(savedEvents))
      }
      
      setIsEventSaved(true)
      showToast('Event added to your dashboard!', 'success')
    } catch (error) {
      console.error('Error saving event:', error)
      showToast('Failed to save event', 'error')
    } finally {
      setSavingEvent(false)
    }
  }

  // Handle sign in redirect
  const handleSignInToSave = () => {
    localStorage.setItem('pendingEventToSave', event.slug)
    window.location.href = `/auth?redirect=/event/${event.slug}`
  }

  const handleCopyLink = async () => {
    const url = getEventUrl(event.slug)
    const success = await copyToClipboard(url)
    if (success) {
      setCopied(true)
      showToast('Link copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } else {
      showToast('Failed to copy link', 'error')
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemForm.name.trim()) {
      showToast('Please enter an item name', 'error')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('potluckpartys_items')
        .insert({
          event_id: event.id,
          name: itemForm.name,
          category: itemForm.category,
          quantity: itemForm.quantity,
          brought_by: itemForm.brought_by || null,
          notes: itemForm.notes || null,
          claimed: !!itemForm.brought_by
        })
        .select()
        .single()

      if (error) throw error

      // Manually update state for immediate UI feedback
      if (data) {
        setItems(prev => [...prev, data as Item])
      }

      showToast('Item added successfully!', 'success')
      setShowAddModal(false)
      resetItemForm()
    } catch (error) {
      console.error('Error adding item:', error)
      showToast('Failed to add item', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !itemForm.name.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('potluckpartys_items')
        .update({
          name: itemForm.name,
          category: itemForm.category,
          quantity: itemForm.quantity,
          brought_by: itemForm.brought_by || null,
          notes: itemForm.notes || null,
          claimed: !!itemForm.brought_by
        })
        .eq('id', editingItem.id)
        .select()
        .single()

      if (error) throw error

      // Manually update state for immediate UI feedback
      if (data) {
        setItems(prev => prev.map(item => 
          item.id === editingItem.id ? data as Item : item
        ))
      }

      showToast('Item updated successfully!', 'success')
      setEditingItem(null)
      resetItemForm()
    } catch (error) {
      console.error('Error updating item:', error)
      showToast('Failed to update item', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('potluckpartys_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      // Manually update state for immediate UI feedback
      setItems(prev => prev.filter(item => item.id !== itemId))

      showToast('Item deleted', 'success')
    } catch (error) {
      console.error('Error deleting item:', error)
      showToast('Failed to delete item', 'error')
    }
  }

  const openClaimModal = (item: Item) => {
    setClaimingItem(item)
    setClaimerName('')
    setShowClaimModal(true)
  }

  const handleClaimItem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!claimingItem || !claimerName.trim()) {
      showToast('Please enter your name', 'error')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('potluckpartys_items')
        .update({
          brought_by: claimerName.trim(),
          claimed: true
        })
        .eq('id', claimingItem.id)
        .select()
        .single()

      if (error) throw error

      // Manually update state for immediate UI feedback
      if (data) {
        setItems(prev => prev.map(i => 
          i.id === claimingItem.id ? data as Item : i
        ))
      }

      showToast(`You're bringing ${claimingItem.name}!`, 'success')
      setShowClaimModal(false)
      setClaimingItem(null)
      setClaimerName('')
    } catch (error) {
      console.error('Error claiming item:', error)
      showToast('Failed to claim item', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('potluckpartys_events')
        .update({
          title: eventForm.title,
          description: eventForm.description || null,
          event_date: eventForm.event_date || null,
          event_time: eventForm.event_time || null,
          location: eventForm.location || null,
          host_name: eventForm.host_name || null
        })
        .eq('id', event.id)

      if (error) throw error

      setEventData(prev => ({
        ...prev,
        ...eventForm
      }))
      showToast('Event updated successfully!', 'success')
      setShowEditEventModal(false)
    } catch (error) {
      console.error('Error updating event:', error)
      showToast('Failed to update event', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetItemForm = () => {
    setItemForm({
      name: '',
      category: 'Main Dishes',
      quantity: 1,
      brought_by: '',
      notes: ''
    })
  }

  const openEditModal = (item: Item) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      category: item.category as ItemCategory,
      quantity: item.quantity,
      brought_by: item.brought_by || '',
      notes: item.notes || ''
    })
  }

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category as ItemCategory
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<ItemCategory, Item[]>)

  const totalItems = items.length
  const claimedItems = items.filter(item => item.claimed).length
  const participants = new Set(items.filter(item => item.brought_by).map(item => item.brought_by)).size

  return (
    <div className="min-h-screen py-8 md:py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-pattern opacity-30" />
      <div className="absolute -left-64 top-0 h-[500px] w-[500px] rounded-full bg-[rgb(var(--primary))]/5 blur-3xl" />
      <div className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full bg-[rgb(var(--accent))]/5 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Event Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="overflow-hidden">
            <div className="relative h-32 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))]">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              <div className="absolute bottom-4 left-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] md:text-3xl">
                    {eventData.title}
                  </h1>
                  {eventData.description && (
                    <p className="mt-2 text-[rgb(var(--muted-foreground))]">
                      {eventData.description}
                    </p>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-4">
                    {eventData.event_date && (
                      <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                        <Calendar className="h-4 w-4 text-[rgb(var(--primary))]" />
                        {formatDate(eventData.event_date)}
                      </div>
                    )}
                    {eventData.event_time && (
                      <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                        <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />
                        {formatTime(eventData.event_time)}
                      </div>
                    )}
                    {eventData.location && (
                      <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                        <MapPin className="h-4 w-4 text-[rgb(var(--primary))]" />
                        {eventData.location}
                      </div>
                    )}
                    {eventData.host_name && (
                      <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                        <User className="h-4 w-4 text-[rgb(var(--primary))]" />
                        Hosted by {eventData.host_name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  {currentUser && !isEventSaved && !event.user_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveEventToDashboard()}
                      loading={savingEvent}
                      icon={<Bookmark className="h-4 w-4" />}
                    >
                      Save to Dashboard
                    </Button>
                  )}
                  {isEventSaved && (
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-400">
                      <Check className="h-4 w-4" />
                      Saved
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditEventModal(true)}
                    icon={<Edit2 className="h-4 w-4" />}
                  >
                    Edit Event
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[rgb(var(--border))] pt-6 sm:flex sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/10">
                    <Utensils className="h-5 w-5 text-[rgb(var(--primary))]" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[rgb(var(--foreground))]">{totalItems}</div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">Total Items</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-emerald-400">{claimedItems}</div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">Claimed</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Plus className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-400">{totalItems - claimedItems}</div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">Available</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                    <Users className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-violet-400">{participants}</div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">Participants</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Share Section with QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-[rgb(var(--primary))]/10 border-[rgb(var(--primary))]/30">
            <CardContent className="py-6">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                {/* QR Code */}
                <div className="flex-shrink-0">
                  <div className="rounded-xl bg-white p-3 shadow-md">
                    <QRCodeSVG
                      value={getEventUrl(event.slug)}
                      size={120}
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                </div>
                
                {/* Share Info */}
                <div className="flex flex-1 flex-col items-center gap-4 text-center md:items-start md:text-left">
                  <div>
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                      <Share2 className="h-5 w-5 text-[rgb(var(--primary))]" />
                      <span className="font-medium text-[rgb(var(--foreground))]">
                        Share with Guests
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                      Scan the QR code or share the link so guests can add items
                    </p>
                  </div>
                  
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-2 rounded-lg bg-[rgb(var(--card))] px-3 py-2">
                      <LinkIcon className="h-4 w-4 flex-shrink-0 text-[rgb(var(--muted-foreground))]" />
                      <code className="text-xs text-[rgb(var(--muted-foreground))] truncate">
                        {getEventUrl(event.slug)}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCopyLink}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowQRModal(true)}>
                        <QrCode className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Items Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              <Utensils className="mr-2 inline-block h-5 w-5 text-[rgb(var(--primary))]" />
              Potluck Items
            </h2>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                    viewMode === 'table'
                      ? 'bg-[rgb(var(--primary))] text-white'
                      : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                  )}
                >
                  <Table2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                    viewMode === 'card'
                      ? 'bg-[rgb(var(--primary))] text-white'
                      : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
              <Button onClick={() => setShowAddModal(true)} icon={<Plus className="h-4 w-4" />}>
                Add Item
              </Button>
            </div>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--secondary))]">
                  <Utensils className="h-8 w-8 text-[rgb(var(--muted-foreground))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  No items yet
                </h3>
                <p className="mt-2 text-[rgb(var(--muted-foreground))]">
                  Be the first to add what you&apos;re bringing to the potluck!
                </p>
                <Button className="mt-4" onClick={() => setShowAddModal(true)} icon={<Plus className="h-4 w-4" />}>
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'card' ? (
            /* Card View */
            <div className="space-y-6">
              {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className={cn('inline-flex items-center gap-2 rounded-lg px-3 py-1 text-sm', CATEGORY_STYLES[category as ItemCategory]?.color)}>
                        {CATEGORY_STYLES[category as ItemCategory]?.icon}
                        {category}
                      </span>
                      <span className="text-sm font-normal text-[rgb(var(--muted-foreground))]">
                        ({categoryItems.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-[rgb(var(--border))]">
                      <AnimatePresence mode="popLayout">
                        {categoryItems.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[rgb(var(--foreground))]">
                                  {item.name}
                                </span>
                                {item.quantity > 1 && (
                                  <span className="rounded-md bg-[rgb(var(--secondary))] px-2 py-0.5 text-xs text-[rgb(var(--muted-foreground))]">
                                    ×{item.quantity}
                                  </span>
                                )}
                              </div>
                              {item.claimed && item.brought_by ? (
                                <div className="mt-1 flex items-center gap-1 text-sm text-emerald-400">
                                  <Check className="h-3.5 w-3.5" />
                                  {item.brought_by} is bringing this
                                </div>
                              ) : (
                                <button
                                  onClick={() => openClaimModal(item)}
                                  className="mt-1 text-sm text-[rgb(var(--primary))] hover:underline"
                                >
                                  Click to claim
                                </button>
                              )}
                              {item.notes && (
                                <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(item)}
                                className="rounded-lg p-2 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--secondary))] hover:text-[rgb(var(--foreground))]"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="rounded-lg p-2 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--destructive))]/10 hover:text-[rgb(var(--destructive))]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Table View */
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                          Category
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                          Brought By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                          Notes
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgb(var(--border))]">
                      <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                          <motion.tr
                            key={item.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group transition-colors hover:bg-[rgb(var(--secondary))]/30"
                          >
                            <td className="px-4 py-3">
                              <span className="font-medium text-[rgb(var(--foreground))]">
                                {item.name}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
                                CATEGORY_STYLES[item.category as ItemCategory]?.color
                              )}>
                                {CATEGORY_STYLES[item.category as ItemCategory]?.icon}
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="rounded-md bg-[rgb(var(--secondary))] px-2 py-1 text-sm font-medium text-[rgb(var(--foreground))]">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {item.brought_by ? (
                                <span className="flex items-center gap-1.5 text-sm text-[rgb(var(--foreground))]">
                                  <User className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                                  {item.brought_by}
                                </span>
                              ) : (
                                <button
                                  onClick={() => openClaimModal(item)}
                                  className="text-sm text-[rgb(var(--primary))] hover:underline"
                                >
                                  Click to claim
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {item.claimed ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                  <Check className="h-3 w-3" />
                                  Claimed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                                  Available
                                </span>
                              )}
                            </td>
                            <td className="max-w-[150px] px-4 py-3">
                              <span className="truncate text-sm text-[rgb(var(--muted-foreground))]">
                                {item.notes || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="rounded-lg p-1.5 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--secondary))] hover:text-[rgb(var(--foreground))]"
                                  title="Edit item"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="rounded-lg p-1.5 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--destructive))]/10 hover:text-[rgb(var(--destructive))]"
                                  title="Delete item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Add Item Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            resetItemForm()
          }}
          title="Add Item"
          description="What are you bringing to the potluck?"
        >
          <form onSubmit={handleAddItem} className="space-y-4">
            <Input
              id="item-name"
              label="Item Name *"
              placeholder="e.g., Pasta Salad"
              value={itemForm.name}
              onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Select
              id="item-category"
              label="Category"
              options={ITEM_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              value={itemForm.category}
              onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value as ItemCategory }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="item-quantity"
                label="Quantity"
                type="number"
                min="1"
                value={itemForm.quantity}
                onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
              <Input
                id="item-brought-by"
                label="Your Name"
                placeholder="Who's bringing this?"
                value={itemForm.brought_by}
                onChange={(e) => setItemForm(prev => ({ ...prev, brought_by: e.target.value }))}
              />
            </div>
            <Textarea
              id="item-notes"
              label="Notes (Optional)"
              placeholder="Any special instructions or details..."
              value={itemForm.notes}
              onChange={(e) => setItemForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => {
                setShowAddModal(false)
                resetItemForm()
              }}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                Add Item
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Item Modal */}
        <Modal
          isOpen={!!editingItem}
          onClose={() => {
            setEditingItem(null)
            resetItemForm()
          }}
          title="Edit Item"
          description="Update the item details"
        >
          <form onSubmit={handleUpdateItem} className="space-y-4">
            <Input
              id="edit-item-name"
              label="Item Name *"
              placeholder="e.g., Pasta Salad"
              value={itemForm.name}
              onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Select
              id="edit-item-category"
              label="Category"
              options={ITEM_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              value={itemForm.category}
              onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value as ItemCategory }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="edit-item-quantity"
                label="Quantity"
                type="number"
                min="1"
                value={itemForm.quantity}
                onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
              <Input
                id="edit-item-brought-by"
                label="Claimed By"
                placeholder="Who's bringing this?"
                value={itemForm.brought_by}
                onChange={(e) => setItemForm(prev => ({ ...prev, brought_by: e.target.value }))}
              />
            </div>
            <Textarea
              id="edit-item-notes"
              label="Notes (Optional)"
              placeholder="Any special instructions or details..."
              value={itemForm.notes}
              onChange={(e) => setItemForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => {
                setEditingItem(null)
                resetItemForm()
              }}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Event Modal */}
        <Modal
          isOpen={showEditEventModal}
          onClose={() => setShowEditEventModal(false)}
          title="Edit Event"
          description="Update your event details"
          size="lg"
        >
          <form onSubmit={handleUpdateEvent} className="space-y-4">
            <Input
              id="edit-event-title"
              label="Event Title *"
              placeholder="e.g., Summer BBQ Potluck"
              value={eventForm.title}
              onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Textarea
              id="edit-event-description"
              label="Description"
              placeholder="Tell your guests what the event is about..."
              value={eventForm.description}
              onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="edit-event-date"
                label="Date"
                type="date"
                value={eventForm.event_date}
                onChange={(e) => setEventForm(prev => ({ ...prev, event_date: e.target.value }))}
              />
              <Input
                id="edit-event-time"
                label="Time"
                type="time"
                value={eventForm.event_time}
                onChange={(e) => setEventForm(prev => ({ ...prev, event_time: e.target.value }))}
              />
            </div>
            <Input
              id="edit-event-location"
              label="Location"
              placeholder="e.g., 123 Main St"
              value={eventForm.location}
              onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
            />
            <Input
              id="edit-event-host"
              label="Host Name"
              placeholder="Your name"
              value={eventForm.host_name}
              onChange={(e) => setEventForm(prev => ({ ...prev, host_name: e.target.value }))}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditEventModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Claim Item Modal */}
        <Modal
          isOpen={showClaimModal}
          onClose={() => {
            setShowClaimModal(false)
            setClaimingItem(null)
            setClaimerName('')
          }}
          title="Claim This Item"
          description={claimingItem ? `You're claiming "${claimingItem.name}"` : ''}
        >
          <form onSubmit={handleClaimItem} className="space-y-4">
            <Input
              id="claimer-name"
              label="Your Name"
              placeholder="Enter your name"
              value={claimerName}
              onChange={(e) => setClaimerName(e.target.value)}
              icon={<User className="h-5 w-5" />}
              required
              autoFocus
            />
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Let everyone know you&apos;re bringing this item!
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowClaimModal(false)
                  setClaimingItem(null)
                  setClaimerName('')
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                Claim Item
              </Button>
            </div>
          </form>
        </Modal>

        {/* QR Code Download Modal */}
        <Modal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          title="Download QR Code"
          description="Save the QR code to print or share"
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="rounded-2xl bg-white p-4 shadow-lg">
              <QRCodeSVG
                value={getEventUrl(event.slug)}
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                {eventData.title}
              </p>
              <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                Share this QR code with your guests
              </p>
            </div>

            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const canvas = document.querySelector('#qr-code-modal canvas') as HTMLCanvasElement
                  if (canvas) {
                    const link = document.createElement('a')
                    link.download = `${eventData.title.replace(/\s+/g, '-')}-qr-code.png`
                    link.href = canvas.toDataURL('image/png')
                    link.click()
                  } else {
                    // For SVG, convert to canvas first
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
                        link.download = `${eventData.title.replace(/\s+/g, '-')}-qr-code.png`
                        link.href = canvas.toDataURL('image/png')
                        link.click()
                      }
                      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
                    }
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
                  copyToClipboard(getEventUrl(event.slug))
                  showToast('Link copied!', 'success')
                }}
                icon={<Copy className="h-4 w-4" />}
              >
                Copy Link
              </Button>
            </div>
          </div>
        </Modal>

        {/* Welcome Modal for First-Time Visitors */}
        <Modal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          title={`Welcome to ${eventData.title}!`}
          description="You've been invited to this potluck event"
        >
          <div className="space-y-6">
            {/* Event Info */}
            <div className="rounded-xl bg-[rgb(var(--secondary))]/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))]">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[rgb(var(--foreground))]">{eventData.title}</h3>
                  {eventData.event_date && (
                    <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                      {formatDate(eventData.event_date)} {eventData.event_time && `at ${formatTime(eventData.event_time)}`}
                    </p>
                  )}
                  {eventData.location && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">{eventData.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <p className="text-center text-sm text-[rgb(var(--muted-foreground))]">
                What would you like to do?
              </p>

              {!currentUser ? (
                <>
                  {/* Sign In Option */}
                  <button
                    onClick={handleSignInToSave}
                    className="flex w-full items-center gap-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 text-left transition-all hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/20">
                      <LogIn className="h-5 w-5 text-[rgb(var(--primary))]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[rgb(var(--foreground))]">Sign in to save this event</p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        Access it anytime from your dashboard
                      </p>
                    </div>
                  </button>

                  {/* Continue Without Login */}
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="flex w-full items-center gap-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 text-left transition-all hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--secondary))]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--secondary))]">
                      <Utensils className="h-5 w-5 text-[rgb(var(--muted-foreground))]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[rgb(var(--foreground))]">Continue without signing in</p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        You can still add items and participate
                      </p>
                    </div>
                  </button>

                  <p className="text-center text-xs text-[rgb(var(--muted-foreground))]">
                    ✨ Signing in is <span className="font-medium">optional</span> - you can always participate without an account!
                  </p>
                </>
              ) : (
                <>
                  {/* Save to Dashboard Option for Logged-in Users */}
                  {!isEventSaved && (
                    <button
                      onClick={() => {
                        handleSaveEventToDashboard()
                        setShowWelcomeModal(false)
                      }}
                      className="flex w-full items-center gap-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 text-left transition-all hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/20">
                        <Bookmark className="h-5 w-5 text-[rgb(var(--primary))]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[rgb(var(--foreground))]">Add to my dashboard</p>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">
                          Quick access from your account anytime
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Already Saved Info */}
                  {isEventSaved && (
                    <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                      <Check className="h-5 w-5 text-green-500" />
                      <p className="text-sm text-green-600 dark:text-green-400">
                        This event is already in your dashboard!
                      </p>
                    </div>
                  )}

                  {/* Continue Button */}
                  <Button
                    className="w-full"
                    onClick={() => setShowWelcomeModal(false)}
                  >
                    {isEventSaved ? 'View Event' : 'Continue to Event'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
