import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { ITEM_CATEGORIES, TOP_CUISINES, AI_QUOTA_LIMIT } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const OPENAI_MODEL = 'gpt-5-mini'

const categoriesList = ITEM_CATEGORIES.join(', ')

export type FoodIdeaItem = { name: string; category: string }

const DIETARY_VALUES = ['veg', 'non-veg', 'vegan', 'mixed'] as const

type Body = {
  cuisine?: string
  customPrompt?: string
  count: number
  dietary?: string
  categories: string[]
}

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
    const { cuisine, customPrompt, count = 10, dietary = 'mixed', categories = [] } = body

    const countClamped = Math.min(50, Math.max(3, Number(count) || 10))
    const dietarySafe = DIETARY_VALUES.includes(dietary as (typeof DIETARY_VALUES)[number])
      ? dietary
      : 'mixed'
    const useCategories =
      Array.isArray(categories) && categories.length > 0
        ? categories.filter((c) => ITEM_CATEGORIES.includes(c as (typeof ITEM_CATEGORIES)[number]))
        : ITEM_CATEGORIES
    const categoryFilter =
      useCategories.length === ITEM_CATEGORIES.length
        ? 'Mix of all categories: ' + categoriesList
        : 'Only these categories: ' + useCategories.join(', ')

    const dietaryRule =
      dietarySafe === 'veg'
        ? 'All items must be VEGETARIAN (no meat, fish, poultry). Eggs and dairy are allowed.'
        : dietarySafe === 'vegan'
          ? 'All items must be VEGAN (no meat, fish, poultry, eggs, dairy, or other animal products).'
          : dietarySafe === 'non-veg'
            ? 'Include both vegetarian and non-vegetarian items. Non-veg items can include meat, fish, poultry.'
            : 'Include a MIX of vegetarian, vegan, and non-vegetarian items for variety.'

    const hasCuisine = cuisine && cuisine.trim()
    const safeCuisine = hasCuisine && TOP_CUISINES.includes(cuisine as (typeof TOP_CUISINES)[number])
      ? cuisine
      : hasCuisine
        ? cuisine!.trim()
        : ''
    const hasCustom = customPrompt && customPrompt.trim()
    const customText = hasCustom ? customPrompt!.trim() : ''

    let context = ''
    if (safeCuisine && customText) {
      context = `Cuisine: ${safeCuisine}. Additional instructions: "${customText}".`
    } else if (customText) {
      context = `Custom theme/idea: "${customText}".`
    } else if (safeCuisine) {
      context = `Cuisine/theme: ${safeCuisine}.`
    } else {
      context = `Top cuisines to inspire variety: ${TOP_CUISINES.join(', ')}. Pick a mix.`
    }

    const systemPrompt = `You are a helpful potluck planner. Generate specific, realistic potluck food item ideas.
Valid categories (use exactly): ${categoriesList}.
${categoryFilter}

Dietary requirement: ${dietaryRule}

Respond ONLY with a JSON object: { "items": [ { "name": "Item Name", "category": "Exact Category" }, ... ] }.
No markdown, no explanation, no extra text. Use only the valid categories listed.`

    const userPrompt = `Generate exactly ${countClamped} potluck food ideas. ${context}
Dietary: ${dietarySafe}.
Return a JSON object with an "items" array of ${countClamped} objects. Each: { "name": "...", "category": "..." }. Use only the valid categories given. Respect the dietary requirement.`

    const openai = new OpenAI({ apiKey: key })
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    let parsed: { items?: FoodIdeaItem[] } | FoodIdeaItem[] = JSON.parse(content)
    let items: FoodIdeaItem[] = Array.isArray(parsed) ? parsed : parsed?.items ?? []

    items = items
      .filter((x) => x && typeof x.name === 'string' && typeof x.category === 'string')
      .map((x) => ({
        name: String(x.name).trim(),
        category: String(x.category).trim(),
      }))
      .filter((x) => x.name && ITEM_CATEGORIES.includes(x.category as (typeof ITEM_CATEGORIES)[number]))
      .slice(0, countClamped)

    return NextResponse.json({
      items,
      quota: user ? {
        remaining: quotaData?.remaining ?? null,
        is_unlimited: quotaData?.is_unlimited ?? false,
        used: quotaData?.used ?? 0,
      } : null,
    })
  } catch (err) {
    console.error('Food ideas API error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to generate ideas'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
