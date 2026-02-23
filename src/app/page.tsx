'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Users,
  LinkIcon,
  Clock,
  Utensils,
  PartyPopper,
  CheckCircle2,
  Sparkles,
  QrCode,
  ChefHat,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

export default function HomePage() {
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'No Sign-up Required',
      description: 'Create a potluck event instantly — no account needed. Fill in the details and share the link in seconds.',
    },
    {
      icon: <LinkIcon className="h-6 w-6" />,
      title: 'Instant Link & QR Sharing',
      description: 'Every event gets a unique shareable link and a QR code guests can scan to join from any device.',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Real-time Updates',
      description: 'See who is bringing what live. No more duplicate dishes or last-minute scrambles.',
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      title: 'Organised by Category',
      description: 'Items are sorted by category — appetizers, mains, sides, desserts, drinks, and more.',
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'AI Potluck Ideas',
      description: 'Not sure what to serve? Generate tailored potluck dish suggestions by cuisine, diet, and category.',
    },
    {
      icon: <ChefHat className="h-6 w-6" />,
      title: 'AI Recipe Generator',
      description: 'Turn any dish idea into a full recipe with ingredients, instructions, and pro tips — instantly.',
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Create Your Event',
      description: 'Set up your potluck in under a minute. Add event details — date, time, location, and guest count.',
    },
    {
      number: '02',
      title: 'Share the Link or QR',
      description: 'Copy your unique event link or show the QR code — guests can join from any device, no app needed.',
    },
    {
      number: '03',
      title: 'Guests Claim Dishes',
      description: 'Each guest picks what they are bringing directly on the event page. No sign-up required for them either.',
    },
    {
      number: '04',
      title: 'Enjoy the Feast!',
      description: 'Everything is organised and visible. Show up, eat well, and celebrate a perfectly coordinated spread.',
    },
  ]

  const testimonials = [
    {
      quote: 'Used PotluckPartys for our office holiday lunch. Sent the link in Slack and within an hour everything was claimed. Zero back-and-forth emails.',
      name: 'Sarah M.',
      role: 'Office Manager',
    },
    {
      quote: 'The AI potluck ideas tool saved our neighbourhood BBQ. I typed "summer backyard, mixed dietary" and got 15 perfect suggestions in seconds.',
      name: 'James T.',
      role: 'Neighbourhood Host',
    },
    {
      quote: 'Finally a tool that just works. No app download, no sign-up for guests. My extended family actually used it without any help from me.',
      name: 'Priya K.',
      role: 'Family Reunion Organiser',
    },
  ]

  return (
    <div className="overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative flex min-h-[90vh] items-center" aria-label="Hero">
        <div className="absolute inset-0 bg-pattern opacity-50" />
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-[rgb(var(--primary))]/10 blur-3xl" />
        <div className="absolute -bottom-64 -right-64 h-[500px] w-[500px] rounded-full bg-[rgb(var(--accent))]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Copy */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={stagger}
              className="text-center lg:text-left"
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--primary))]/30 bg-[rgb(var(--primary))]/10 px-4 py-2 text-sm font-medium text-[rgb(var(--primary))]"
              >
                <Sparkles className="h-4 w-4" />
                Free · No sign-up · AI-powered
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
              >
                The Free Potluck Organizer
                <span className="text-gradient"> with AI Ideas</span>
                {' '}& Recipes
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-[rgb(var(--muted-foreground))] md:text-xl"
              >
                Create a potluck event in seconds, share via link or QR code, and let guests claim their dishes. Need inspiration? Generate AI potluck ideas and full recipes — all free, no account needed.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
              >
                <Link href="/create">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create Free Event
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    How It Works
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start"
              >
                {[
                  { value: '10,000+', label: 'Events Created' },
                  { value: '50,000+', label: 'Dishes Claimed' },
                  { value: '100%', label: 'Free Forever' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center lg:text-left">
                    <div className="text-xl font-bold text-[rgb(var(--foreground))]">{value}</div>
                    <div className="text-sm text-[rgb(var(--muted-foreground))]">{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=1200&auto=format&fit=crop"
                  alt="A colourful potluck spread with many dishes on a table"
                  fill
                  className="object-cover brightness-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-[rgb(var(--background))]/60 via-transparent to-transparent" />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-6 left-6 right-6 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]/90 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--primary))]/20">
                      <PartyPopper className="h-6 w-6 text-[rgb(var(--primary))]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[rgb(var(--foreground))]">Summer BBQ Potluck</div>
                      <div className="text-sm text-[rgb(var(--muted-foreground))]">12 items claimed · 8 guests</div>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-2xl bg-[rgb(var(--primary))] opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-2xl bg-[rgb(var(--accent))] opacity-20 blur-xl" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative py-24" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 id="features-heading" className="text-3xl font-bold sm:text-4xl">
              Why Choose <span className="text-gradient">PotluckPartys</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[rgb(var(--muted-foreground))]">
              Everything you need to plan a stress-free potluck — from event creation to AI-generated dish ideas and full recipes.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeUp}>
                <Card hover className="h-full">
                  <CardContent>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--primary))]/20 text-[rgb(var(--primary))]">
                      {feature.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-[rgb(var(--foreground))]">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative py-24 bg-[rgb(var(--secondary))]/30" aria-labelledby="how-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 id="how-heading" className="text-3xl font-bold sm:text-4xl">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[rgb(var(--muted-foreground))]">
              Four simple steps from idea to feast
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-linear-to-r from-[rgb(var(--primary))] to-transparent lg:block" />
                )}
                <div className="relative text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-2xl font-bold text-white shadow-lg shadow-[rgb(var(--primary))]/30">
                    {step.number}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[rgb(var(--foreground))]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Tools Spotlight ── */}
      <section className="relative py-24" aria-labelledby="ai-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--primary))]/30 bg-[rgb(var(--primary))]/10 px-4 py-2 text-sm font-medium text-[rgb(var(--primary))]">
              <Sparkles className="h-4 w-4" />
              Powered by AI
            </div>
            <h2 id="ai-heading" className="text-3xl font-bold sm:text-4xl">
              Never Run Out of <span className="text-gradient">Ideas</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[rgb(var(--muted-foreground))]">
              Two free AI tools built right into PotluckPartys. No sign-in needed — just type and generate.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {/* AI Potluck Ideas */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[rgb(var(--primary))]/10 blur-2xl transition-all group-hover:bg-[rgb(var(--primary))]/20" />
              <div className="relative">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--primary))]/20">
                  <Sparkles className="h-7 w-7 text-[rgb(var(--primary))]" />
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--foreground))]">AI Potluck Ideas</h3>
                <p className="mt-3 text-[rgb(var(--muted-foreground))]">
                  Pick a cuisine, set dietary preference (veg, vegan, non-veg, mixed), and get up to 25 tailored potluck dish suggestions instantly. Add a custom prompt — &ldquo;summer BBQ&rdquo;, &ldquo;kid-friendly&rdquo;, &ldquo;holiday brunch&rdquo; — for even more precise results.
                </p>
                <ul className="mt-5 space-y-2">
                  {['15+ cuisines — Italian, Mexican, Indian, Thai & more', 'Filter by food category (appetizer, main, dessert…)', 'Copy as CSV or download for bulk upload'].map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--primary))]" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link href="/ideas">
                    <Button variant="outline" className="gap-2">
                      Try AI Potluck Ideas <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* AI Recipe Generator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[rgb(var(--accent))]/10 blur-2xl transition-all group-hover:bg-[rgb(var(--accent))]/20" />
              <div className="relative">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--accent))]/20">
                  <ChefHat className="h-7 w-7 text-[rgb(var(--accent))]" />
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--foreground))]">AI Recipe Generator</h3>
                <p className="mt-3 text-[rgb(var(--muted-foreground))]">
                  Describe any dish — a cuisine, a diet, a time limit — and the AI returns a complete recipe with grouped ingredients, numbered instructions, prep and cook times, and chef-level pro tips. Works for any occasion.
                </p>
                <ul className="mt-5 space-y-2">
                  {['Any cuisine, dietary need, or occasion', 'Full ingredients, steps, servings & timing', 'Pro tips, variations & serving ideas included'].map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--accent))]" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link href="/recipes">
                    <Button variant="outline" className="gap-2">
                      Try AI Recipe Generator <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="relative py-24 bg-[rgb(var(--secondary))]/30" aria-labelledby="benefits-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[400px] overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] md:h-[500px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop"
                alt="Friends enjoying a potluck dinner together around a table full of food"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[rgb(var(--background))]/30 to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 id="benefits-heading" className="text-3xl font-bold sm:text-4xl">
                Everything You Need for a
                <span className="text-gradient"> Successful Potluck</span>
              </h2>
              <p className="mt-4 text-[rgb(var(--muted-foreground))]">
                Stop juggling spreadsheets and group chats. PotluckPartys handles dish coordination, sharing, and inspiration in one place.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  'Create unlimited potluck events for free',
                  'Guests join with a link — no app or account needed',
                  'Unique QR code for every event',
                  'Track who is bringing what in real time',
                  'Prevent duplicate dishes automatically',
                  'AI dish ideas and full recipes built in',
                  'Works on any device, any browser',
                ].map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.07 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[rgb(var(--primary))]" />
                    <span className="text-[rgb(var(--foreground))]">{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/create">
                  <Button size="lg">
                    Start Planning Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/ideas">
                  <Button variant="outline" size="lg" icon={<Sparkles className="h-4 w-4" />}>
                    Get AI Ideas
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative py-24" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 id="testimonials-heading" className="text-3xl font-bold sm:text-4xl">
              Loved by <span className="text-gradient">Hosts Everywhere</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[rgb(var(--muted-foreground))]">
              From office lunches to family reunions — here&apos;s what real hosts say.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="mt-16 grid gap-6 sm:grid-cols-3"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col justify-between gap-6">
                    <div>
                      <div className="mb-4 flex gap-1">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className="h-4 w-4 fill-[rgb(var(--primary))] text-[rgb(var(--primary))]" />
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed text-[rgb(var(--foreground))]">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--primary))]/20 text-sm font-bold text-[rgb(var(--primary))]">
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[rgb(var(--foreground))]">{t.name}</div>
                        <div className="text-xs text-[rgb(var(--muted-foreground))]">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24" aria-label="Call to action">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] p-8 md:p-16"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Ready to Host Your Potluck?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
                Join thousands of hosts who&apos;ve discovered the easiest way to organise potluck events — with AI ideas and recipes built right in. Free, fast, and fun.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/create">
                  <button className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white px-8 text-lg font-medium text-orange-600 shadow-lg transition-all hover:bg-gray-100 hover:shadow-xl sm:w-auto">
                    Create Your Free Event
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link href="/ideas">
                  <button className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-8 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto">
                    <Sparkles className="h-5 w-5" />
                    Get AI Potluck Ideas
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SEO content ── */}
      <section aria-label="About PotluckPartys" className="bg-[rgb(var(--secondary))]/20 py-20">
        <div className="mx-auto max-w-4xl space-y-12 px-4 sm:px-6 lg:px-8">

          {/* What is it */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              What Is PotluckPartys? The Free Potluck Event Organizer
            </h2>
            <p className="text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">
              <strong className="text-[rgb(var(--foreground))]">PotluckPartys</strong> is a free online potluck planner that makes it effortless to coordinate who is bringing what to your gathering. Create a potluck event page, share the link or QR code with guests, and watch the dish list fill itself. No spreadsheets, no group chat chaos, no duplicate lasagnes. And with built-in AI tools, you can generate potluck food ideas and full recipes in seconds — all at no cost, with no account required.
            </p>
          </div>

          {/* Use cases */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Perfect for Every Occasion</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: '🏢', title: 'Office Potlucks', desc: 'Holiday lunches, team celebrations, farewell parties — coordinate with your whole floor via one shared link.' },
                { icon: '👨‍👩‍👧', title: 'Family Gatherings', desc: 'Thanksgiving, Christmas, summer reunions — ensure a balanced spread without the usual phone-tree mayhem.' },
                { icon: '🏡', title: 'Neighbourhood Events', desc: 'Block parties, BBQs, and community dinners organised in minutes and shared via QR code at the gate.' },
                { icon: '🎉', title: 'Birthday & Holiday Parties', desc: 'Let friends claim dishes and drinks so you can focus on celebrating, not coordinating.' },
                { icon: '⛪', title: 'Church & Community Groups', desc: 'Manage large gatherings with dietary preferences and category filters so everyone is covered.' },
                { icon: '🎓', title: 'School & Club Events', desc: 'Class parties, bake sales, club socials — simple enough for parents and students alike.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
                  <span className="text-2xl leading-none">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--foreground))]">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[rgb(var(--muted-foreground))]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Frequently Asked Questions</h2>
            <dl className="space-y-3">
              {[
                {
                  q: 'Is PotluckPartys really free?',
                  a: 'Yes — 100% free. Create unlimited potluck events, use the AI ideas and recipe tools, and share with any number of guests at no cost. No hidden plans or paywalls.',
                },
                {
                  q: 'Do my guests need to create an account?',
                  a: 'No. Guests only need the event link or QR code. They can add and claim dishes instantly without signing up for anything.',
                },
                {
                  q: 'How does the QR code feature work?',
                  a: 'Every event automatically gets a unique QR code. Print it, display it on a screen, or share it digitally. Anyone who scans it lands directly on your potluck event page.',
                },
                {
                  q: 'What are the AI Potluck Ideas and AI Recipe Generator tools?',
                  a: 'AI Potluck Ideas generates a tailored list of dish suggestions based on cuisine, dietary preference, and food category. AI Recipe Generator turns any prompt into a complete recipe with ingredients, instructions, and pro tips. Both are free and require no sign-in.',
                },
                {
                  q: 'Can I use PotluckPartys for large events?',
                  a: 'Yes. There is no guest or item limit. The platform handles small dinner parties and large community events alike.',
                },
                {
                  q: 'What is the difference between PotluckPartys and a shared spreadsheet?',
                  a: 'A spreadsheet requires sharing access, manual formatting, and constant updating. PotluckPartys gives you a dedicated event page, real-time updates, category organisation, QR code sharing, and AI tools — all without any setup.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-5 py-4">
                  <dt className="text-sm font-semibold text-[rgb(var(--foreground))]">{q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">{a}</dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </section>

    </div>
  )
}
