import type { Metadata } from 'next'

const PAGE_TITLE = 'AI Potluck Ideas | Free Potluck Food Ideas Generator – PotluckPartys'
const PAGE_DESC =
  'Generate AI-powered potluck food ideas instantly. Choose from 15+ cuisines, set dietary preferences (veg, vegan, non-veg, mixed), filter by category, and get a tailored dish list. Copy as CSV or download for your potluck event. Free, no sign-in required.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  keywords: [
    'AI potluck ideas',
    'potluck food ideas',
    'potluck ideas generator',
    'potluck planner',
    'potluck dish ideas',
    'party food ideas',
    'vegetarian potluck ideas',
    'vegan potluck ideas',
    'potluck suggestions',
    'Italian potluck',
    'Mexican potluck',
    'Indian potluck',
    'easy potluck dishes',
    'potluck appetizers',
    'potluck mains',
    'potluck desserts',
    'free potluck planner',
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
    canonical: '/ideas',
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
    'article:section': 'Food & Entertaining',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Potluck Ideas Generator',
  description: PAGE_DESC,
  applicationCategory: 'LifestyleApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Generate potluck dish ideas from 15+ cuisines',
    'Filter by dietary preference: veg, vegan, non-veg, mixed',
    'Choose food categories or get a full mix',
    'Add custom instructions for tailored results',
    'Copy as CSV or download for bulk upload',
  ],
}

export default function IdeasLayout({
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
