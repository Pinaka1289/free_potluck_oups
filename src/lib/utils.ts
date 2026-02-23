import { customAlphabet } from 'nanoid'

// Generate a URL-friendly slug for events
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)

export function generateSlug(): string {
  return nanoid()
}

// Format date for display
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'TBD'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format time for display
export function formatTime(timeString: string | null): string {
  if (!timeString) return 'TBD'
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Get event URL
export function getEventUrl(slug: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/event/${slug}`
  }
  return `/event/${slug}`
}

// Categories for potluck items
export const ITEM_CATEGORIES = [
  'Appetizers',
  'Main Dishes',
  'Side Dishes',
  'Salads',
  'Desserts',
  'Drinks',
  'Snacks',
  'Bread & Rolls',
  'Utensils & Plates',
  'Other',
] as const

export type ItemCategory = (typeof ITEM_CATEGORIES)[number]

// Category icons and colors
export const CATEGORY_STYLES: Record<ItemCategory, { icon: string; color: string }> = {
  'Appetizers': { icon: '🥗', color: 'bg-emerald-500/20 text-emerald-400' },
  'Main Dishes': { icon: '🍖', color: 'bg-orange-500/20 text-orange-400' },
  'Side Dishes': { icon: '🥔', color: 'bg-amber-500/20 text-amber-400' },
  'Salads': { icon: '🥬', color: 'bg-green-500/20 text-green-400' },
  'Desserts': { icon: '🍰', color: 'bg-pink-500/20 text-pink-400' },
  'Drinks': { icon: '🥤', color: 'bg-blue-500/20 text-blue-400' },
  'Snacks': { icon: '🍿', color: 'bg-yellow-500/20 text-yellow-400' },
  'Bread & Rolls': { icon: '🥖', color: 'bg-amber-600/20 text-amber-300' },
  'Utensils & Plates': { icon: '🍽️', color: 'bg-slate-500/20 text-slate-400' },
  'Other': { icon: '📦', color: 'bg-purple-500/20 text-purple-400' },
}

// Top cuisines for Quick Food Ideas
export const TOP_CUISINES = [
  'Italian',
  'Mexican',
  'Indian',
  'Chinese',
  'Japanese',
  'American',
  'Mediterranean',
  'Thai',
  'BBQ / Southern',
  'Vegetarian / Vegan',
] as const

// Classnames utility
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// AI Quota Configuration
export const AI_QUOTA_LIMIT = parseInt(process.env.AI_QUOTA_LIMIT || '3', 10)
