'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  FileText,
  PartyPopper,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'

export default function CreateEventPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    host_name: '',
    host_email: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      showToast('Please enter an event title', 'error')
      return
    }

    setLoading(true)

    try {
      const slug = generateSlug()
      
      // Check if user is logged in and has a profile
      const { data: { user } } = await supabase.auth.getUser()
      
      let userId = null
      if (user) {
        // Check if user has a profile (foreign key constraint)
        const { data: profile } = await supabase
          .from('potluckpartys_profiles')
          .select('id')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          userId = user.id
        }
      }
      
      const { error } = await supabase
        .from('potluckpartys_events')
        .insert({
          slug,
          title: formData.title,
          description: formData.description || null,
          event_date: formData.event_date || null,
          event_time: formData.event_time || null,
          location: formData.location || null,
          host_name: formData.host_name || null,
          host_email: formData.host_email || null,
          user_id: userId
        })

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw new Error(error.message || 'Database error')
      }

      showToast('Event created successfully!', 'success')
      router.push(`/event/${slug}`)
    } catch (error) {
      console.error('Error creating event:', error instanceof Error ? error.message : error)
      showToast(error instanceof Error ? error.message : 'Failed to create event. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-pattern opacity-50" />
      <div className="absolute -left-64 top-0 h-[500px] w-[500px] rounded-full bg-[rgb(var(--primary))]/5 blur-3xl" />
      <div className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full bg-[rgb(var(--accent))]/5 blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))]">
            <PartyPopper className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Create Your <span className="text-gradient">Potluck Event</span>
          </h1>
          <p className="mt-3 text-[rgb(var(--muted-foreground))]">
            Fill in the details below to create your event. No sign-up required!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10"
        >
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Title */}
                <Input
                  id="title"
                  name="title"
                  label="Event Title *"
                  placeholder="e.g., Summer BBQ Potluck"
                  value={formData.title}
                  onChange={handleChange}
                  icon={<FileText className="h-5 w-5" />}
                  required
                />

                {/* Description */}
                <Textarea
                  id="description"
                  name="description"
                  label="Description"
                  placeholder="Tell your guests what the event is about..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />

                {/* Date and Time */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="event_date"
                    name="event_date"
                    label="Date"
                    type="date"
                    value={formData.event_date}
                    onChange={handleChange}
                    icon={<Calendar className="h-5 w-5" />}
                  />
                  <Input
                    id="event_time"
                    name="event_time"
                    label="Time"
                    type="time"
                    value={formData.event_time}
                    onChange={handleChange}
                    icon={<Clock className="h-5 w-5" />}
                  />
                </div>

                {/* Location */}
                <Input
                  id="location"
                  name="location"
                  label="Location"
                  placeholder="e.g., 123 Main St, or Backyard"
                  value={formData.location}
                  onChange={handleChange}
                  icon={<MapPin className="h-5 w-5" />}
                />

                {/* Host Info */}
                <div className="border-t border-[rgb(var(--border))] pt-6">
                  <h3 className="mb-4 text-sm font-medium text-[rgb(var(--muted-foreground))]">
                    Host Information (Optional)
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="host_name"
                      name="host_name"
                      label="Your Name"
                      placeholder="Enter your name"
                      value={formData.host_name}
                      onChange={handleChange}
                      icon={<User className="h-5 w-5" />}
                    />
                    <Input
                      id="host_email"
                      name="host_email"
                      label="Your Email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.host_email}
                      onChange={handleChange}
                      icon={<Mail className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col gap-3 pt-4">
                  <Button type="submit" size="lg" loading={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating Event...
                      </>
                    ) : (
                      <>
                        Create Event
                        <PartyPopper className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-[rgb(var(--muted-foreground))]">
                    By creating an event, you&apos;ll get a unique link to share with your guests
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <CardContent className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                    <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[rgb(var(--foreground))]">No Account Needed</h3>
                    <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                      Your event will be created instantly. Bookmark the link to access it later!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full">
                <CardContent className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[rgb(var(--foreground))]">Want More Features?</h3>
                    <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                      Sign up to manage all your events from a dashboard and never lose your links!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
