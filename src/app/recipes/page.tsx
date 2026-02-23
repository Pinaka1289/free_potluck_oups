'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChefHat,
  Copy,
  Download,
  Check,
  Clock,
  Users,
  UtensilsCrossed,
  ListOrdered,
  Lightbulb,
  Infinity,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PotluckPartyLoader } from '@/components/ui/PotluckPartyLoader'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { cn, AI_QUOTA_LIMIT } from '@/lib/utils'
import type { RecipeResponse, IngredientGroup } from '@/app/api/recipes/route'
import type { User } from '@supabase/supabase-js'

export default function RecipesPage() {
  const { showToast } = useToast()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [quotaInfo, setQuotaInfo] = useState<{
    remaining: number | null
    quota_limit: number | null
    is_unlimited: boolean
    used: number
  } | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
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
    if (!loading && recipe && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loading, recipe])

  const handleGenerate = async () => {
    const q = prompt.trim()
    if (!q) {
      showToast('Enter a recipe prompt.', 'error')
      return
    }
    setLoading(true)
    setRecipe(null)
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 429) {
          showToast(json.message || json.error || 'Monthly quota exhausted', 'error')
        } else {
          showToast(json.error || 'Failed to generate recipe', 'error')
        }
        fetchQuotaInfo() // Refresh quota display
        return
      }
      setRecipe(json as RecipeResponse)
      if (json.quota) {
        setQuotaInfo(json.quota)
      }
      showToast('Recipe ready!', 'success')
    } catch (err) {
      console.error('Recipe error:', err)
      showToast('Something went wrong. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function recipeToText(r: RecipeResponse): string {
    const lines: string[] = [r.title, '', r.overview, '']
    if (r.servings != null) lines.push(`Servings: ${r.servings}`)
    if (r.prepTime) lines.push(`Prep: ${r.prepTime}`)
    if (r.cookTime) lines.push(`Cook: ${r.cookTime}`)
    if (r.servings != null || r.prepTime || r.cookTime) lines.push('')
    lines.push('INGREDIENTS', '-----------')
    for (const g of r.ingredients) {
      lines.push('', `${g.group}:`)
      g.items.forEach((i) => lines.push(`  • ${i}`))
    }
    lines.push('', 'INSTRUCTIONS', '------------')
    r.instructions.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
    const proTips = r.proTips.slice(0, 3)
    if (proTips.length) {
      lines.push('', 'PRO TIPS', '---------')
      proTips.forEach((t) => lines.push(`  • ${t}`))
    }
    return lines.join('\n')
  }

  const recipeText = recipe ? recipeToText(recipe) : ''

  const copyRecipe = async () => {
    if (!recipeText) return
    try {
      await navigator.clipboard.writeText(recipeText)
      setCopied(true)
      showToast('Copied!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Could not copy', 'error')
    }
  }

  const downloadRecipe = () => {
    if (!recipeText || !recipe) return
    const blob = new Blob([recipeText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${recipe.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-recipe.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Downloaded!', 'success')
  }

  const proTips = recipe ? recipe.proTips.slice(0, 3) : []

  return (
    <main className="relative min-h-screen py-8 md:py-12" role="main">
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
            <PotluckPartyLoader fillContainer title="Cooking up your recipe…" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <header className="text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-[rgb(var(--primary))]/10 p-3">
              <ChefHat className="h-8 w-8 text-[rgb(var(--primary))]" />
            </div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] md:text-4xl">
              AI Recipe Generator
            </h1>
            <p className="mt-2 text-[rgb(var(--muted-foreground))]">
              Describe any dish, cuisine, diet, or time—AI generates a full recipe with ingredients, instructions, and pro tips.
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ChefHat className="h-5 w-5" />
                Recipe prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder='e.g. "vegetarian lasagna for 6" or "quick chicken curry, 30 min" or "chocolate cake gluten-free"'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full resize-none"
              />
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="btn-base h-12 w-full px-6 text-base"
              >
                Generate recipe
              </Button>
            </CardContent>
          </Card>

          {/* ── Recipe output ── */}
          {recipe && (
            <motion.article
              ref={resultsRef}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="scroll-mt-24"
              aria-label="Generated recipe"
            >
              {/* Action bar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[rgb(var(--muted-foreground))]">
                  Your AI-generated recipe
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyRecipe}
                    icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadRecipe}
                    icon={<Download className="h-4 w-4" />}
                  >
                    Download
                  </Button>
                </div>
              </div>

              {/* Recipe card */}
              <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg">
                {/* Hero header */}
                <div className="border-b border-[rgb(var(--border))] bg-gradient-to-br from-[rgb(var(--primary))]/5 via-transparent to-[rgb(var(--accent))]/5 px-6 py-8 sm:px-8 sm:py-10">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-[rgb(var(--foreground))] sm:text-3xl">
                    {recipe.title}
                  </h3>
                  {(recipe.servings != null || recipe.prepTime || recipe.cookTime) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {recipe.servings != null && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--secondary))] px-3 py-1.5 text-sm font-medium text-[rgb(var(--foreground))]">
                          <Users className="h-4 w-4 text-[rgb(var(--primary))]" aria-hidden />
                          {recipe.servings} servings
                        </span>
                      )}
                      {recipe.prepTime && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--secondary))] px-3 py-1.5 text-sm font-medium text-[rgb(var(--foreground))]">
                          <Clock className="h-4 w-4 text-[rgb(var(--primary))]" aria-hidden />
                          Prep {recipe.prepTime}
                        </span>
                      )}
                      {recipe.cookTime && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--secondary))] px-3 py-1.5 text-sm font-medium text-[rgb(var(--foreground))]">
                          <Clock className="h-4 w-4 text-[rgb(var(--primary))]" aria-hidden />
                          Cook {recipe.cookTime}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-0">
                  {/* Overview */}
                  {recipe.overview && (
                    <section
                      className="border-b border-[rgb(var(--border))] px-6 py-6 sm:px-8"
                      aria-labelledby="overview-heading"
                    >
                      <h4 id="overview-heading" className="sr-only">
                        Overview
                      </h4>
                      <p className="leading-relaxed text-[rgb(var(--foreground))] text-[15px]">
                        {recipe.overview}
                      </p>
                    </section>
                  )}

                  {/* Ingredients */}
                  <section
                    className="border-b border-[rgb(var(--border))] px-6 py-6 sm:px-8"
                    aria-labelledby="ingredients-heading"
                  >
                    <h4
                      id="ingredients-heading"
                      className="mb-4 flex items-center gap-2 text-base font-semibold text-[rgb(var(--foreground))]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                        <UtensilsCrossed className="h-4 w-4" aria-hidden />
                      </span>
                      Ingredients
                    </h4>
                    <div className="space-y-5">
                      {recipe.ingredients.map((g: IngredientGroup, i: number) => (
                        <div key={i}>
                          {recipe.ingredients.length > 1 && (
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                              {g.group}
                            </p>
                          )}
                          <ul
                            className={cn(
                              'grid gap-2 sm:grid-cols-2',
                              recipe.ingredients.length === 1 && 'sm:grid-cols-1'
                            )}
                          >
                            {g.items.map((item, j) => (
                              <li
                                key={j}
                                className="flex gap-2 rounded-lg bg-[rgb(var(--secondary))]/30 px-3 py-2 text-sm text-[rgb(var(--foreground))]"
                              >
                                <span
                                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--primary))]"
                                  aria-hidden
                                />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Instructions */}
                  <section
                    className="border-b border-[rgb(var(--border))] px-6 py-6 sm:px-8"
                    aria-labelledby="instructions-heading"
                  >
                    <h4
                      id="instructions-heading"
                      className="mb-4 flex items-center gap-2 text-base font-semibold text-[rgb(var(--foreground))]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                        <ListOrdered className="h-4 w-4" aria-hidden />
                      </span>
                      Instructions
                    </h4>
                    <ol className="space-y-4">
                      {recipe.instructions.map((step, i) => (
                        <li
                          key={i}
                          className="flex gap-4 rounded-xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--secondary))]/20 p-4 transition-colors hover:bg-[rgb(var(--secondary))]/30"
                        >
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-bold text-white"
                            aria-hidden
                          >
                            {i + 1}
                          </span>
                          <p className="flex-1 pt-0.5 text-[15px] leading-relaxed text-[rgb(var(--foreground))]">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </section>

                  {/* Pro tips */}
                  {proTips.length > 0 && (
                    <section
                      className="px-6 py-6 sm:px-8"
                      aria-labelledby="pro-tips-heading"
                    >
                      <h4
                        id="pro-tips-heading"
                        className="mb-4 flex items-center gap-2 text-base font-semibold text-[rgb(var(--foreground))]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                          <Lightbulb className="h-4 w-4" aria-hidden />
                        </span>
                        Pro tips
                      </h4>
                      <ul className="space-y-3">
                        {proTips.map((t, i) => (
                          <li
                            key={i}
                            className="flex gap-3 rounded-xl border-l-4 border-amber-500/50 bg-amber-500/5 px-4 py-3 dark:bg-amber-500/10"
                          >
                            <span className="text-amber-600 dark:text-amber-400" aria-hidden>
                              •
                            </span>
                            <span className="text-sm leading-relaxed text-[rgb(var(--foreground))]">
                              {t}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </div>
            </motion.article>
          )}
          {/* ── SEO content (always visible, below the fold) ── */}
          <section aria-label="About AI Recipe Generator" className="space-y-10 border-t border-[rgb(var(--border))] pt-10 pb-4">

            {/* Intro */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Free AI Recipe Generator — Instant Custom Recipes for Any Dish
              </h2>
              <p className="text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">
                The <strong className="text-[rgb(var(--foreground))]">PotluckPartys AI Recipe Generator</strong> turns a single sentence into a complete, chef-quality recipe in seconds. Type a dish name, cuisine, dietary preference, or time constraint and our AI returns full recipes with grouped ingredients, step-by-step instructions, prep and cook times, pro tips, and serving ideas — all for free, no sign-in required.
              </p>
            </div>

            {/* How it works */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">How to Use the AI Recipe Generator</h2>
              <ol className="space-y-3 text-sm text-[rgb(var(--muted-foreground))]">
                {[
                  { step: '1', title: 'Describe what you want', body: 'Type a prompt in plain English — a dish name, a cuisine style, a dietary need, or a time limit. No special syntax needed.' },
                  { step: '2', title: 'Click Generate recipe', body: 'The AI reads your prompt and returns a full structured recipe with ingredients, instructions, timing, and expert tips.' },
                  { step: '3', title: 'Copy or download', body: 'Copy to clipboard or download as a text file for meal planning, grocery lists, or sharing with guests.' },
                ].map(({ step, title, body }) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))]/10 text-xs font-bold text-[rgb(var(--primary))]">{step}</span>
                    <span><strong className="text-[rgb(var(--foreground))]">{title} — </strong>{body}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Example prompts */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Example Prompts to Try</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {[
                  '"Vegetarian lasagna for 6 people"',
                  '"Quick chicken curry, 30 minutes"',
                  '"Gluten-free chocolate cake"',
                  '"Vegan Thai green curry"',
                  '"Easy potluck pasta salad"',
                  '"BBQ pulled pork sliders"',
                  '"Keto breakfast egg muffins"',
                  '"Indian butter chicken, beginner-friendly"',
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 px-3 py-2 text-xs text-[rgb(var(--muted-foreground))]">
                    <span className="mt-0.5 text-[rgb(var(--primary))]">✦</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What every recipe includes */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">What Every AI-Generated Recipe Includes</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: '🧾', label: 'Full ingredient list', desc: 'Grouped by category (main, sauce, garnish) with exact quantities.' },
                  { icon: '📋', label: 'Step-by-step instructions', desc: 'Clear, numbered steps from prep to plating.' },
                  { icon: '⏱️', label: 'Prep & cook times', desc: 'Realistic estimates so you can plan your kitchen schedule.' },
                  { icon: '🍽️', label: 'Serving size', desc: 'Scaled for the number of people your recipe is meant to serve.' },
                  { icon: '💡', label: 'Pro tips', desc: 'Chef-level insights, common mistakes to avoid, and texture secrets.' },
                  { icon: '🔄', label: 'Variations & serving ideas', desc: 'Dietary swaps, adaptations, and pairing suggestions.' },
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
                Whether you&rsquo;re planning a <strong className="text-[rgb(var(--foreground))]">potluck dinner</strong>, a <strong className="text-[rgb(var(--foreground))]">weeknight family meal</strong>, a <strong className="text-[rgb(var(--foreground))]">holiday feast</strong>, or a <strong className="text-[rgb(var(--foreground))]">special dietary menu</strong>, the AI Recipe Generator adapts to your needs. It&rsquo;s perfect for home cooks exploring new cuisines, hosts looking for crowd-pleasing dishes, meal preppers who need structured ingredient lists, and anyone tired of scrolling through lengthy blog posts just to find a simple recipe.
              </p>
            </div>

            {/* FAQ */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Frequently Asked Questions</h2>
              <dl className="space-y-3">
                {[
                  {
                    q: 'Is the AI Recipe Generator free to use?',
                    a: 'Yes — completely free with no sign-in required. Type your prompt and generate a recipe instantly.',
                  },
                  {
                    q: 'What cuisines does the AI support?',
                    a: 'All of them. Italian, Mexican, Indian, Chinese, Japanese, Thai, Mediterranean, American, French, and more. Just include the cuisine in your prompt.',
                  },
                  {
                    q: 'Can I generate vegetarian, vegan, or gluten-free recipes?',
                    a: 'Yes. Include your dietary requirement in the prompt — "vegan Thai curry" or "gluten-free banana bread" — and the AI respects it throughout ingredients and instructions.',
                  },
                  {
                    q: 'How accurate are the recipes?',
                    a: 'The AI generates well-structured, realistic recipes. We recommend reviewing quantities and times for your specific stove or oven. The pro tips section highlights common pitfalls to watch for.',
                  },
                  {
                    q: 'Can I use these recipes for a potluck event?',
                    a: 'Absolutely. The AI Recipe Generator is part of PotluckPartys — a free potluck organizer. Once you have a recipe, create a potluck event, assign dishes to guests, and share via QR code.',
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
