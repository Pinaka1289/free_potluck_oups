import type { Metadata } from 'next'

const PAGE_TITLE = 'AI Recipe Generator | Generate Custom Recipes with AI – PotluckPartys'
const PAGE_DESC =
  'Generate custom recipes instantly with AI. Describe any dish, cuisine, diet, or time limit and get full recipes—ingredients, step-by-step instructions, and pro tips. Free AI-powered recipe tool for potlucks and home cooking.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  keywords: [
    'AI recipe generator',
    'AI recipes',
    'generate recipe with AI',
    'AI-powered recipes',
    'custom recipe generator',
    'recipe by prompt',
    'instant recipe AI',
    'potluck recipes',
    'vegetarian recipes',
    'quick recipes',
    'meal ideas',
    'cooking assistant',
  ],
  authors: [{ name: 'PotluckPartys' }],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    type: 'website',
    siteName: 'PotluckPartys',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESC,
  },
  alternates: {
    canonical: '/recipes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  other: {
    'article:section': 'Food & Recipes',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Recipe Generator',
  description: PAGE_DESC,
  applicationCategory: 'LifestyleApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Generate custom recipes from a simple prompt',
    'Get ingredients, instructions, prep & cook times',
    'AI-powered pro tips and variations',
  ],
}

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
