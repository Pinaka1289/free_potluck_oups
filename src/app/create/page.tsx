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
  Loader2,
  Link2,
  QrCode,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import type { EventInsert } from '@/types/database'

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
      
      const eventData: EventInsert = {
        slug,
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date || null,
        event_time: formData.event_time || null,
        location: formData.location || null,
        host_name: formData.host_name || null,
        host_email: formData.host_email || null,
        user_id: userId
      }
      
      const { error } = await supabase
        .from('potluckpartys_events')
        .insert(eventData as never)

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
    <main className="min-h-screen py-12" role="main">
      {/* Background */}
      <div className="absolute inset-0 bg-pattern opacity-50" aria-hidden="true" />
      <div className="absolute -left-64 top-0 h-[500px] w-[500px] rounded-full bg-[rgb(var(--primary))]/5 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full bg-[rgb(var(--accent))]/5 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          aria-label="Create potluck event"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))]">
            <PartyPopper className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Create Your <span className="text-gradient">Potluck Event</span>
          </h1>
          <p className="mt-3 text-[rgb(var(--muted-foreground))]">
            Fill in the details below to create your event. No sign-up required!
          </p>
        </motion.header>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
          aria-label="Key benefits"
        >
          {[
            { icon: <ShieldCheck className="h-4 w-4" />, label: '100% Free' },
            { icon: <Users className="h-4 w-4" />, label: 'No sign-up needed' },
            { icon: <Link2 className="h-4 w-4" />, label: 'Instant share link' },
            { icon: <QrCode className="h-4 w-4" />, label: 'QR code included' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2.5 text-xs font-medium text-[rgb(var(--muted-foreground))]"
            >
              <span className="text-[rgb(var(--primary))]">{icon}</span>
              {label}
            </div>
          ))}
        </motion.div>

        <section
          className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/20 p-4 md:p-5"
          aria-label="About creating potluck events"
        >
          <h2 className="sr-only">About creating potluck events</h2>
          <p className="text-center text-sm leading-relaxed text-[rgb(var(--muted-foreground))] md:text-base">
            <strong className="text-[rgb(var(--foreground))]">Create a potluck event</strong> for free with no sign-up. Add a title, optional date, time, and location. Share the event link or QR code with guests so they can claim dishes and see updates in real time. Host info is optional — perfect for casual potlucks, office parties, and family gatherings.
          </p>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10"
          aria-label="Event details form"
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

          {/* What happens next — 4 step mini-cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="mb-4 text-sm font-semibold text-[rgb(var(--foreground))]">What happens after you create your event</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: <Link2 className="h-5 w-5" />,
                  color: 'bg-emerald-500/20 text-emerald-400',
                  title: 'Unique link generated instantly',
                  desc: 'Your event gets its own URL the moment you click Create Event — no waiting, no email verification.',
                },
                {
                  icon: <QrCode className="h-5 w-5" />,
                  color: 'bg-blue-500/20 text-blue-400',
                  title: 'QR code ready to share',
                  desc: 'Every event includes a QR code guests can scan to join from any phone — perfect for in-person sharing.',
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  color: 'bg-purple-500/20 text-purple-400',
                  title: 'Guests claim dishes in real time',
                  desc: 'Guests add items and claim dishes directly on the event page — no account or app required for them.',
                },
                {
                  icon: <Sparkles className="h-5 w-5" />,
                  color: 'bg-orange-500/20 text-orange-400',
                  title: 'Need dish ideas? Use AI',
                  desc: 'Head to AI Potluck Ideas or AI Recipe Generator to get tailored suggestions and full recipes for free.',
                },
              ].map(({ icon, color, title, desc }) => (
                <Card key={title} className="h-full">
                  <CardContent className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[rgb(var(--foreground))]">{title}</h3>
                      <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* ── SEO content ── */}
        <section aria-label="About creating potluck events" className="mt-16 space-y-10 border-t border-[rgb(var(--border))] pt-10 pb-6">

          {/* Intro */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Create a Free Online Potluck Event — No Sign-up Required
            </h2>
            <p className="text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">
              <strong className="text-[rgb(var(--foreground))]">PotluckPartys</strong> lets you create a potluck event page in under a minute. Add a title, set an optional date, time, and location, then share the unique link or QR code with your guests. Everyone can see the dish list, claim what they are bringing, and stay updated in real time — no apps, no accounts, no friction. It is the modern replacement for the group chat or shared spreadsheet.
            </p>
          </div>

          {/* Tips */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Tips for a Great Potluck Event</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { tip: 'Give your event a descriptive title', detail: 'e.g. "Holiday Office Potluck 2025" or "Sarah\'s Birthday BBQ" — it helps guests identify the right event when you share the link.' },
                { tip: 'Add a description with guidance', detail: 'Mention the theme, dietary needs, or how many people are coming so guests know what category of dish to bring.' },
                { tip: 'Share the link in multiple places', detail: 'Send it in a group chat, email, or text. The QR code is great for displaying at the venue entrance.' },
                { tip: 'Use AI to suggest dishes', detail: 'Not sure what to ask guests to bring? Use AI Potluck Ideas to get a curated list by cuisine and dietary preference.' },
                { tip: 'Sign in to manage your events', detail: 'Creating a free account gives you a dashboard where all your events live — no more lost bookmark links.' },
                { tip: 'Check back before the event', detail: 'Visit your event page the day before to see who confirmed what and spot any missing categories like desserts or drinks.' },
              ].map(({ tip, detail }) => (
                <div key={tip} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3">
                  <p className="text-sm font-semibold text-[rgb(var(--foreground))]">{tip}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[rgb(var(--muted-foreground))]">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Use cases */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">What Can You Use This For?</h2>
            <p className="text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">
              The Create Event tool works for any occasion where a group of people each contributes food or drinks. Popular uses include <strong className="text-[rgb(var(--foreground))]">office holiday lunches</strong>, <strong className="text-[rgb(var(--foreground))]">Thanksgiving dinners</strong>, <strong className="text-[rgb(var(--foreground))]">neighbourhood BBQs</strong>, <strong className="text-[rgb(var(--foreground))]">birthday parties</strong>, <strong className="text-[rgb(var(--foreground))]">school bake sales</strong>, <strong className="text-[rgb(var(--foreground))]">church community meals</strong>, <strong className="text-[rgb(var(--foreground))]">baby showers</strong>, and any other gathering where a coordinated spread makes the day better.
            </p>
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Frequently Asked Questions</h2>
            <dl className="space-y-3">
              {[
                {
                  q: 'Do I need an account to create a potluck event?',
                  a: 'No. Just fill in the form and click Create Event. You get a unique link immediately. We recommend bookmarking it or signing up for a free account so all your events are in one dashboard.',
                },
                {
                  q: 'Do my guests need to sign up?',
                  a: 'No. Guests only need the link or QR code. They can add and claim dishes instantly with just their name — no account, no app, no password.',
                },
                {
                  q: 'Is there a limit on the number of guests or dishes?',
                  a: 'No limits. You can invite as many guests as you like and the dish list can grow as large as needed.',
                },
                {
                  q: 'Can I edit my event after creating it?',
                  a: 'Yes. From the event page you can update the title, description, date, time, and location at any time. Guests will see the updated details immediately.',
                },
                {
                  q: 'What is the QR code for?',
                  a: 'Each event automatically generates a QR code. Print it, display it on a screen, or include it in a message. Anyone who scans it lands directly on your event page and can add items right away.',
                },
                {
                  q: 'How do I avoid duplicate dishes at my potluck?',
                  a: 'Once a guest claims a dish, it is marked as taken with their name. Other guests can see the full list before adding their own, which naturally prevents duplicates. You can also use AI Potluck Ideas to suggest a balanced variety of dishes upfront.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-5 py-4">
                  <dt className="text-sm font-semibold text-[rgb(var(--foreground))]">{q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">{a}</dd>
                </div>
              ))}
            </dl>
          </div>

        </section>
      </div>
    </main>
  )
}
