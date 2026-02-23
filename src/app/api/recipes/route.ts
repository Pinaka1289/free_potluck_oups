import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { AI_QUOTA_LIMIT } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const OPENAI_MODEL = 'gpt-5-mini'

export type IngredientGroup = { group: string; items: string[] }

export type RecipeResponse = {
  title: string
  overview: string
  servings?: number
  prepTime?: string
  cookTime?: string
  ingredients: IngredientGroup[]
  instructions: string[]
  keyTips: string[]
  proTips: string[]
  variations: string[]
  servingIdeas: string[]
}

type Body = { prompt?: string }

const OUTPUT_JSON = `{
  "title": "Recipe name",
  "overview": "2-4 sentence description.",
  "servings": 4,
  "prepTime": "15 min",
  "cookTime": "30 min",
  "ingredients": [{ "group": "Main", "items": ["1 cup flour", "..."] }],
  "instructions": ["Step 1...", "Step 2..."],
  "keyTips": ["Tip 1"],
  "proTips": ["Pro tip 1", "Pro tip 2", "Pro tip 3"],
  "variations": ["Variation 1"],
  "servingIdeas": ["Serve with..."]
}`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

  type QuotaData = {
    allowed?: boolean
    remaining?: number | null
    quota_limit?: number | null
    is_unlimited?: boolean
    reset_date?: string
    used?: number
  }
  let quotaData: QuotaData | null = null

  // Quota is only enforced for logged-in users
  if (user) {
    const { data: quotaDataRaw, error: quotaError } = await supabase.rpc(
      'check_and_increment_ai_usage',
      {
        p_user_id: user.id,
        p_default_quota: AI_QUOTA_LIMIT,
      } as never
    )
    if (quotaError) {
      console.error('Quota check error:', quotaError)
      return NextResponse.json(
        { error: 'Failed to check quota. Please try again.' },
        { status: 500 }
      )
    }
    quotaData = quotaDataRaw as QuotaData | null
    if (!quotaData?.allowed) {
      const resetDate = quotaData?.reset_date
        ? new Date(quotaData.reset_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : 'next month'
      return NextResponse.json(
        {
          error: 'Monthly quota exhausted',
          remaining: quotaData?.remaining ?? 0,
          quota_limit: quotaData?.quota_limit ?? AI_QUOTA_LIMIT,
          reset_date: quotaData?.reset_date,
          message: `You've used all ${quotaData?.quota_limit ?? AI_QUOTA_LIMIT} free AI prompts this month. Your quota will reset on ${resetDate}.`,
        },
        { status: 429 }
      )
    }
  }

  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured. Add it to .env.local.' },
      { status: 500 }
    )
  }

  try {
    const body = (await req.json()) as Body
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    if (!prompt) {
      return NextResponse.json(
        { error: 'Enter a recipe prompt (e.g. "vegetarian lasagna" or "chocolate cake").' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a recipe assistant. Generate a recipe based on the user's prompt.

Adapt to what they ask: dish name, cuisine, diet, time, equipment, etc.
Return ONLY a valid JSON object. No markdown, no explanation.

Structure:
${OUTPUT_JSON}

- ingredients: array of { "group": "Group name", "items": ["item 1", ...] }
- instructions, keyTips, variations, servingIdeas: arrays of strings.
- proTips: exactly 3 items (chef-level insights, common mistakes, flavor/texture improvements).`

    const openai = new OpenAI({ apiKey: key })
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a recipe for: ${prompt}` },
      ],
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const parsed = JSON.parse(content) as Record<string, unknown>
    const title = typeof parsed.title === 'string' ? parsed.title.trim() : 'Recipe'
    const overview = typeof parsed.overview === 'string' ? parsed.overview.trim() : ''
    const servings = Math.max(1, Math.min(24, Number(parsed.servings) || 4))
    const prepTime = typeof parsed.prepTime === 'string' ? parsed.prepTime.trim() : ''
    const cookTime = typeof parsed.cookTime === 'string' ? parsed.cookTime.trim() : ''

    const rawIng = Array.isArray(parsed.ingredients) ? (parsed.ingredients as unknown[]) : []
    const ingredients: IngredientGroup[] = rawIng
      .map((x) => {
        if (!x || typeof x !== 'object') return null
        const o = x as Record<string, unknown>
        const group = typeof o.group === 'string' ? o.group.trim() : 'Main'
        const arr = Array.isArray(o.items) ? o.items : []
        const items = arr.map((i) => (typeof i === 'string' ? i.trim() : String(i))).filter(Boolean)
        if (!items.length) return null
        return { group: group || 'Main', items }
      })
      .filter((x): x is IngredientGroup => x !== null)
    if (!ingredients.length) ingredients.push({ group: 'Main', items: ['See overview.'] })

    const rawInst = Array.isArray(parsed.instructions) ? (parsed.instructions as unknown[]) : []
    const instructions = rawInst
      .map((i) => (typeof i === 'string' ? i.trim() : String(i)))
      .filter(Boolean)

    const arr = (k: string) => {
      const a = Array.isArray(parsed[k]) ? (parsed[k] as unknown[]) : []
      return a.map((i) => (typeof i === 'string' ? i.trim() : String(i))).filter(Boolean)
    }

    const recipe: RecipeResponse = {
      title: title || 'Recipe',
      overview: overview || `A delicious recipe for ${prompt}.`,
      servings,
      prepTime: prepTime || undefined,
      cookTime: cookTime || undefined,
      ingredients,
      instructions: instructions.length ? instructions : ['Follow the overview.'],
      keyTips: arr('keyTips'),
      proTips: arr('proTips').slice(0, 3),
      variations: arr('variations'),
      servingIdeas: arr('servingIdeas'),
    }

    return NextResponse.json({
      ...recipe,
      quota: user ? {
        remaining: quotaData?.remaining ?? null,
        is_unlimited: quotaData?.is_unlimited ?? false,
        used: quotaData?.used ?? 0,
      } : null,
    })
  } catch (err) {
    console.error('Recipes API error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to generate recipe'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
