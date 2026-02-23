'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Copy, Download, Utensils, Check, Infinity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PotluckPartyLoader } from '@/components/ui/PotluckPartyLoader'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { ITEM_CATEGORIES, TOP_CUISINES, CATEGORY_STYLES, cn, AI_QUOTA_LIMIT, type ItemCategory } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

type FoodIdeaItem = { name: string; category: string }

const ITEM_COUNTS = [5, 10, 15, 20, 25] as const

const DIETARY_OPTIONS = [
  { value: 'veg', label: 'Veg' },
  { value: 'non-veg', label: 'Non-Veg' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'mixed', label: 'Mixed' },
] as const

export default function QuickIdeasPage() {
  const { showToast } = useToast()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [cuisine, setCuisine] = useState<string>(TOP_CUISINES[0])
  const [customPrompt, setCustomPrompt] = useState('')
  const [count, setCount] = useState<number>(10)
  const [dietary, setDietary] = useState<string>('mixed')
  const [categories, setCategories] = useState<string[]>([])
  const [items, setItems] = useState<FoodIdeaItem[]>([])
  const [copied, setCopied] = useState(false)
  const [quotaInfo, setQuotaInfo] = useState<{
    remaining: number | null
    quota_limit: number | null
    is_unlimited: boolean
    used: number
  } | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const useMix = categories.length === 0

  // Auth runs in background – never block the page. Show sign-in gate by default; switch to form when user is known.
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      // getSession() is instant (cache). Only call getUser() when a session exists.
      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelled) setUser(session?.user ?? null)
      if (!session) return
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (!cancelled) {
          setUser(u ?? null)
          if (u) fetchQuotaInfo()
          else setQuotaInfo(null)
        }
      } catch {
        // Session expired or invalid — clear user silently
        if (!cancelled) { setUser(null); setQuotaInfo(null) }
      }
    }
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchQuotaInfo()
      else setQuotaInfo(null)
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const fetchQuotaInfo = async () => {
    try {
      const res = await fetch('/api/admin/quota-info')
      const json = await res.json()
      if (res.ok) {
        setQuotaInfo(json)
      }
    } catch (err) {
      console.error('Fetch quota error:', err)
    }
  }

  useEffect(() => {
    if (!loading && items.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loading, items.length])

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    setItems([])
    try {
      const res = await fetch('/api/food-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuisine,
          customPrompt: customPrompt.trim() || undefined,
          count,
          dietary,
          categories: useMix ? [] : categories,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 429) {
          showToast(json.message || json.error || 'Monthly quota exhausted', 'error')
        } else {
          showToast(json.error || 'Failed to generate ideas', 'error')
        }
        fetchQuotaInfo() // Refresh quota display
        return
      }
      setItems(json.items ?? [])
      if (json.quota) {
        setQuotaInfo(json.quota)
      }
      showToast(`Generated ${(json.items ?? []).length} ideas!`, 'success')
    } catch (err) {
      console.error('Generate error:', err)
      showToast('Something went wrong. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const csvRows = [
    'Item Name,Category,Quantity,Brought By,Notes',
    ...items.map((i) => `${i.name},${i.category},1,,`),
  ]
  const csv = csvRows.join('\n')

  const copyCsv = async () => {
    try {
      await navigator.clipboard.writeText(csv)
      setCopied(true)
      showToast('Copied as CSV! Paste into a spreadsheet or bulk upload.', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Could not copy', 'error')
    }
  }

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'potluck-ideas.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Downloaded potluck-ideas.csv', 'success')
  }

  return (
    <main className="relative min-h-screen py-8 md:py-12">
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 bottom-0 z-[100] overflow-auto md:top-20"
            aria-live="polite"
            aria-busy="true"
          >
            <PotluckPartyLoader
              fillContainer
              title="Cooking up ideas…"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <header className="text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-[rgb(var(--primary))]/10 p-3">
              <Sparkles className="h-8 w-8 text-[rgb(var(--primary))]" />
            </div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] md:text-4xl">
              AI Potluck Ideas
            </h1>
            <p className="mt-2 text-[rgb(var(--muted-foreground))]">
              AI-generated potluck ideas. Pick a cuisine and add optional instructions.
            </p>
            {quotaInfo && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-2">
                {quotaInfo.is_unlimited ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-purple-600 dark:text-purple-400">
                    <Infinity className="h-4 w-4" />
                    Unlimited AI prompts
                  </span>
                ) : (
                  <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                    <span className={quotaInfo.remaining === 0 ? 'text-red-500' : 'text-green-500'}>
                      {quotaInfo.remaining}
                    </span>
                    {' / '}
                    {quotaInfo.quota_limit ?? AI_QUOTA_LIMIT} prompts remaining this month
                  </span>
                )}
              </div>
            )}
          </header>

          <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/20 p-4 md:p-6" aria-label="About AI Potluck Ideas">
            <h2 className="sr-only">About AI Potluck Ideas</h2>
            <p className="text-center text-sm leading-relaxed text-[rgb(var(--muted-foreground))] md:text-base">
              Use <strong className="text-[rgb(var(--foreground))]">AI Potluck Ideas</strong> to get instant, tailored food suggestions for your potluck or party. Select a cuisine (Italian, Mexican, Indian, and more), set dietary preferences (vegetarian, vegan, non-veg, or mixed), and optionally add instructions—for example, &ldquo;kid-friendly&rdquo; or &ldquo;gluten-free.&rdquo; Then generate ideas, copy them as CSV, or download and use them with our bulk upload for your potluck event.
            </p>
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Utensils className="h-5 w-5" />
                Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Top cuisines */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[rgb(var(--foreground))]">
                  Top cuisines
                </label>
                <Select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  options={TOP_CUISINES.map((c) => ({ value: c, label: c }))}
                  className="w-full"
                />
              </div>

              {/* Custom prompt – additional instructions */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[rgb(var(--foreground))]">
                  Custom prompt <span className="font-normal text-[rgb(var(--muted-foreground))]">(optional)</span>
                </label>
                <Textarea
                  placeholder="e.g. Summer backyard BBQ, kid-friendly snacks, holiday brunch, gluten-free options..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  className="w-full resize-none"
                />
                <p className="mt-1.5 text-xs text-[rgb(var(--muted-foreground))]">
                  Add extra instructions to narrow or tweak ideas. Use together with your selected cuisine.
                </p>
              </div>

              {/* Number of items */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[rgb(var(--foreground))]">
                  Number of items
                </label>
                <div className="flex flex-wrap gap-2">
                  {ITEM_COUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={cn(
                        'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
                        count === n
                          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
                          : 'border-[rgb(var(--border))] bg-transparent text-[rgb(var(--muted-foreground))] hover:border-[rgb(var(--foreground))]/30'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary: Veg / Non-Veg / Vegan / Mixed */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[rgb(var(--foreground))]">
                  Dietary
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDietary(opt.value)}
                      className={cn(
                        'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
                        dietary === opt.value
                          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
                          : 'border-[rgb(var(--border))] bg-transparent text-[rgb(var(--muted-foreground))] hover:border-[rgb(var(--foreground))]/30'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[rgb(var(--foreground))]">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCategories([])}
                    className={cn(
                      'rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all',
                      useMix
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
                        : 'border-[rgb(var(--border))] bg-transparent text-[rgb(var(--muted-foreground))] hover:border-[rgb(var(--foreground))]/30'
                    )}
                  >
                    Mix (all)
                  </button>
                  {ITEM_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        'rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all',
                        categories.includes(cat)
                          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
                          : 'border-[rgb(var(--border))] bg-transparent text-[rgb(var(--muted-foreground))] hover:border-[rgb(var(--foreground))]/30'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {categories.length > 0 && (
                  <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
                    Selected: {categories.join(', ')}
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                loading={loading}
                disabled={loading}
                icon={loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              >
                {loading ? 'Generating…' : 'Generate ideas'}
              </Button>
            </CardContent>
          </Card>

          {items.length > 0 && !loading && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 scroll-mt-24"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {items.length} ideas
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCsv}
                    icon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  >
                    {copied ? 'Copied' : 'Copy CSV'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCsv} icon={<Download className="h-4 w-4" />}>
                    Download CSV
                  </Button>
                </div>
              </div>
              <Card>
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full min-w-[320px]">
                    <thead>
                      <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                          Item name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                          Category
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const style = CATEGORY_STYLES[item.category as ItemCategory] ?? CATEGORY_STYLES.Other
                        return (
                          <tr
                            key={idx}
                            className={cn(
                              'border-b border-[rgb(var(--border))]/50 transition-colors hover:bg-[rgb(var(--secondary))]/30',
                              idx % 2 === 1 && 'bg-[rgb(var(--secondary))]/10'
                            )}
                          >
                            <td className="px-4 py-3 text-sm tabular-nums text-[rgb(var(--muted-foreground))]">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-[rgb(var(--foreground))]">
                              {item.name}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  'inline-block rounded-lg px-2.5 py-1 text-xs font-medium',
                                  style.color
                                )}
                              >
                                {item.category}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── SEO content (always visible, below the fold) ── */}
          <section aria-label="About AI Potluck Ideas" className="space-y-10 border-t border-[rgb(var(--border))] pt-10 pb-4">

            {/* Intro */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Free AI Potluck Ideas Generator — Instant Food Suggestions for Any Gathering
              </h2>
              <p className="text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">
                The <strong className="text-[rgb(var(--foreground))]">PotluckPartys AI Potluck Ideas</strong> tool generates a tailored list of potluck food suggestions in seconds. Pick a cuisine, set your dietary preference, choose a category mix, and the AI returns dish ideas grouped by category — all free, no sign-in required. Copy as CSV or download to use with bulk-upload for your event.
              </p>
            </div>

            {/* How it works */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">How to Get AI Potluck Ideas in 3 Steps</h2>
              <ol className="space-y-3 text-sm text-[rgb(var(--muted-foreground))]">
                {[
                  { step: '1', title: 'Choose your options', body: 'Select a cuisine (Italian, Mexican, Indian, and more), set dietary preference (Veg, Non-Veg, Vegan, or Mixed), and pick food categories or leave it on Mix for full variety.' },
                  { step: '2', title: 'Add an optional custom prompt', body: 'Narrow it down further — "summer BBQ", "kid-friendly snacks", "holiday brunch", or "gluten-free appetizers". Combine it with any cuisine for precise results.' },
                  { step: '3', title: 'Generate, copy, or download', body: 'Click Generate ideas and get an instant list. Copy as CSV to paste into a spreadsheet, or download and bulk-upload directly into your PotluckPartys event.' },
                ].map(({ step, title, body }) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))]/10 text-xs font-bold text-[rgb(var(--primary))]">{step}</span>
                    <span><strong className="text-[rgb(var(--foreground))]">{title} — </strong>{body}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Cuisine & dietary combos */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Popular Potluck Idea Combinations</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {[
                  'Italian · Vegetarian · Appetizers & Mains',
                  'Mexican · Mixed · Snacks & Mains',
                  'Indian · Vegan · All categories',
                  'American · Non-Veg · Mains & Desserts',
                  'Mediterranean · Vegetarian · Salads & Sides',
                  'Japanese · Mixed · Appetizers & Snacks',
                  'Chinese · Vegan · Mains & Sides',
                  'French · Mixed · Desserts & Drinks',
                ].map((combo) => (
                  <li key={combo} className="flex items-start gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 px-3 py-2 text-xs text-[rgb(var(--muted-foreground))]">
                    <span className="mt-0.5 text-[rgb(var(--primary))]">✦</span>
                    <span>{combo}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">What the AI Potluck Ideas Tool Gives You</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: '🍽️', label: 'Categorised dish list', desc: 'Every idea is tagged with a food category — Appetizer, Main, Side, Dessert, Drink, and more.' },
                  { icon: '🌍', label: '15+ cuisines supported', desc: 'Italian, Mexican, Indian, Chinese, Japanese, Thai, Mediterranean, American, French, Korean, Greek, and more.' },
                  { icon: '🥦', label: 'Full dietary control', desc: 'Filter by Vegetarian, Vegan, Non-Veg, or Mixed to match any guest list or dietary restriction.' },
                  { icon: '📊', label: 'CSV export ready', desc: 'Copy as CSV and paste into a spreadsheet, or download and use with bulk upload in your potluck event.' },
                  { icon: '✏️', label: 'Custom instructions', desc: 'Add a free-text prompt — "kid-friendly", "gluten-free", "summer BBQ" — for extra-tailored ideas.' },
                  { icon: '⚡', label: 'Instant results', desc: 'Generate up to 25 dish ideas in seconds with no account needed.' },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="flex gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
                    <span className="text-xl leading-none">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[rgb(var(--foreground))]">{label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[rgb(var(--muted-foreground))]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Who it's for */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Who Is This For?</h2>
              <p className="text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">
                AI Potluck Ideas is built for <strong className="text-[rgb(var(--foreground))]">potluck hosts</strong> who need a balanced spread fast, <strong className="text-[rgb(var(--foreground))]">event planners</strong> coordinating large gatherings, <strong className="text-[rgb(var(--foreground))]">office party organisers</strong> managing mixed dietary needs, and anyone who just wants fresh, creative food ideas without the mental effort. Whether it&rsquo;s a casual backyard BBQ, a holiday feast, a work lunch, or a birthday party, the tool adapts to any occasion.
              </p>
            </div>

            {/* FAQ */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Frequently Asked Questions</h2>
              <dl className="space-y-3">
                {[
                  {
                    q: 'Is AI Potluck Ideas free to use?',
                    a: 'Yes — completely free with no sign-in required. Pick your options and generate ideas instantly.',
                  },
                  {
                    q: 'How many dish ideas can I generate at once?',
                    a: 'You can generate 5, 10, 15, 20, or 25 dish ideas per request. Run it multiple times to get a wider variety.',
                  },
                  {
                    q: 'Can I filter for vegetarian or vegan potluck dishes?',
                    a: 'Yes. Set the dietary filter to Veg, Vegan, Non-Veg, or Mixed before generating. The AI strictly follows your dietary preference for every suggested dish.',
                  },
                  {
                    q: 'Can I use the results in my potluck event?',
                    a: 'Yes. Copy as CSV and use the bulk-upload feature in your PotluckPartys event to instantly populate your dish list, then share with guests via link or QR code.',
                  },
                  {
                    q: 'What cuisines are supported?',
                    a: 'Over 15 cuisines including Italian, Mexican, Indian, Chinese, Japanese, Thai, Mediterranean, American, French, Korean, Middle Eastern, Greek, Caribbean, Spanish, and more.',
                  },
                  {
                    q: 'Can I combine a cuisine with a custom prompt?',
                    a: 'Yes. For example, select "Italian" cuisine and add the custom prompt "kid-friendly birthday party" to get Italian dishes suitable for children. The two inputs work together.',
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

        </motion.div>
      </div>
    </main>
  )
}
