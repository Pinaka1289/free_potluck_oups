'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Copy,
  Check,
  Plus,
  Edit2,
  Trash2,
  Share2,
  Link as LinkIcon,
  Utensils,
  ChefHat
} from 'lucide-react'
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
          table: 'items',
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
      const { error } = await supabase
        .from('items')
        .insert({
          event_id: event.id,
          name: itemForm.name,
          category: itemForm.category,
          quantity: itemForm.quantity,
          brought_by: itemForm.brought_by || null,
          notes: itemForm.notes || null,
          claimed: !!itemForm.brought_by
        })

      if (error) throw error

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
      const { error } = await supabase
        .from('items')
        .update({
          name: itemForm.name,
          category: itemForm.category,
          quantity: itemForm.quantity,
          brought_by: itemForm.brought_by || null,
          notes: itemForm.notes || null,
          claimed: !!itemForm.brought_by
        })
        .eq('id', editingItem.id)

      if (error) throw error

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
        .from('items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      showToast('Item deleted', 'success')
    } catch (error) {
      console.error('Error deleting item:', error)
      showToast('Failed to delete item', 'error')
    }
  }

  const handleClaimItem = async (item: Item) => {
    const name = prompt('Enter your name to claim this item:')
    if (!name) return

    try {
      const { error } = await supabase
        .from('items')
        .update({
          brought_by: name,
          claimed: true
        })
        .eq('id', item.id)

      if (error) throw error

      showToast(`You're bringing ${item.name}!`, 'success')
    } catch (error) {
      console.error('Error claiming item:', error)
      showToast('Failed to claim item', 'error')
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('events')
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
              <div className="mt-6 flex gap-6 border-t border-[rgb(var(--border))] pt-6">
                <div>
                  <div className="text-2xl font-bold text-[rgb(var(--foreground))]">{totalItems}</div>
                  <div className="text-sm text-[rgb(var(--muted-foreground))]">Total Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{claimedItems}</div>
                  <div className="text-sm text-[rgb(var(--muted-foreground))]">Claimed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">{totalItems - claimedItems}</div>
                  <div className="text-sm text-[rgb(var(--muted-foreground))]">Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Share Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-[rgb(var(--primary))]/10 border-[rgb(var(--primary))]/30">
            <CardContent className="flex flex-col items-center gap-4 py-4 md:flex-row md:justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-[rgb(var(--primary))]" />
                <span className="text-sm text-[rgb(var(--foreground))]">
                  Share this link with your guests so they can add items
                </span>
              </div>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <div className="flex flex-1 items-center gap-2 rounded-lg bg-[rgb(var(--card))] px-3 py-2 md:flex-none">
                  <LinkIcon className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                  <code className="text-xs text-[rgb(var(--muted-foreground))] truncate max-w-[200px]">
                    {getEventUrl(event.slug)}
                  </code>
                </div>
                <Button size="sm" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
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
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              <Utensils className="mr-2 inline-block h-5 w-5 text-[rgb(var(--primary))]" />
              Potluck Items
            </h2>
            <Button onClick={() => setShowAddModal(true)} icon={<Plus className="h-4 w-4" />}>
              Add Item
            </Button>
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
          ) : (
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
                                  onClick={() => handleClaimItem(item)}
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
      </div>
    </div>
  )
}
