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
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'No Sign-up Required',
      description: 'Create potluck events instantly without creating an account. Just fill in the details and share!'
    },
    {
      icon: <LinkIcon className="h-6 w-6" />,
      title: 'Easy Sharing',
      description: 'Get a unique link for each event. Share it with guests and they can add items immediately.'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Real-time Updates',
      description: 'See who is bringing what in real-time. No more duplicate dishes or forgotten essentials!'
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      title: 'Organized Categories',
      description: 'Items are organized by category — appetizers, mains, sides, desserts, and more.'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Create Your Event',
      description: 'Set up your potluck in seconds. Add event details like date, time, and location.'
    },
    {
      number: '02',
      title: 'Share the Link',
      description: 'Copy your unique event link and share it with all your guests.'
    },
    {
      number: '03',
      title: 'Guests Add Items',
      description: 'Your guests can claim what they\'re bringing directly on the event page.'
    },
    {
      number: '04',
      title: 'Enjoy the Feast!',
      description: 'Everything is organized. Now just show up and enjoy the delicious variety!'
    }
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-pattern opacity-50" />
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-[rgb(var(--primary))]/10 blur-3xl" />
        <div className="absolute -bottom-64 -right-64 h-[500px] w-[500px] rounded-full bg-[rgb(var(--accent))]/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--primary))]/30 bg-[rgb(var(--primary))]/10 px-4 py-2 text-sm font-medium text-[rgb(var(--primary))]">
                <Sparkles className="h-4 w-4" />
                100% Free, No Sign-up Required
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
              >
                Organize Your 
                <span className="text-gradient"> Perfect Potluck</span>
                <br />in Minutes
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-lg text-[rgb(var(--muted-foreground))] md:text-xl"
              >
                Create, share, and manage potluck events effortlessly. Let guests claim their dishes and never worry about who&apos;s bringing what again!
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
              >
                <Link href="/create">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create Event
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    How It Works
                  </Button>
                </Link>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="mt-8 flex items-center justify-center gap-6 lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-[rgb(var(--background))] bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))]"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-[rgb(var(--foreground))]">10,000+</div>
                  <div className="text-sm text-[rgb(var(--muted-foreground))]">Events Created</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=1200&auto=format&fit=crop"
                  alt="Delicious potluck spread with various dishes"
                  fill
                  className="object-cover brightness-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--background))]/60 via-transparent to-transparent" />
                
                {/* Floating Card */}
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
                      <div className="text-sm text-[rgb(var(--muted-foreground))]">12 items claimed • 8 guests</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-2xl bg-[rgb(var(--primary))] opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-2xl bg-[rgb(var(--accent))] opacity-20 blur-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Why Choose <span className="text-gradient">PotluckPartys</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[rgb(var(--muted-foreground))]">
              We&apos;ve made organizing potlucks as easy as pie (or any other dish you&apos;re bringing!)
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
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

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24 bg-[rgb(var(--secondary))]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[rgb(var(--muted-foreground))]">
              Four simple steps to potluck perfection
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
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-[rgb(var(--primary))] to-transparent lg:block" />
                )}
                <div className="relative text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-2xl font-bold text-white shadow-lg shadow-[rgb(var(--primary))]/30">
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

      {/* Benefits Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]"
            >
              <Image
                src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop"
                alt="Friends enjoying potluck dinner together"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {/* Overlay gradient for better visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--background))]/30 to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold sm:text-4xl">
                Everything You Need for a
                <span className="text-gradient"> Successful Potluck</span>
              </h2>
              <p className="mt-4 text-[rgb(var(--muted-foreground))]">
                Stop using spreadsheets and group chats to organize your potluck. PotluckPartys handles everything in one place.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  'Create unlimited events for free',
                  'No account needed for basic features',
                  'Guest-friendly — anyone can add items',
                  'Track who\'s bringing what',
                  'Prevent duplicate dishes',
                  'Access your events from any device'
                ].map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[rgb(var(--primary))]" />
                    <span className="text-[rgb(var(--foreground))]">{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/create">
                  <Button size="lg">
                    Start Planning Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] p-8 md:p-16"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Ready to Host Your Potluck?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
                Join thousands of hosts who&apos;ve discovered the easiest way to organize potluck events. It&apos;s free, fast, and fun!
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/create">
                  <button 
                    className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all h-14 px-8 text-lg w-full sm:w-auto bg-white text-orange-600 hover:bg-gray-100 shadow-lg hover:shadow-xl"
                  >
                    Create Your Event
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link href="/auth">
                  <button 
                    className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all h-14 px-8 text-lg w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    Sign Up for More Features
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
