import type { Metadata } from 'next'

const PAGE_TITLE = 'Create a Free Potluck Event | No Sign-up Required – PotluckPartys'
const PAGE_DESC =
  'Create a free potluck event in seconds — no account needed. Add a title, date, time, and location, then share a unique link or QR code so guests can claim their dishes. Perfect for office parties, family gatherings, and neighbourhood BBQs.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  keywords: [
    'create potluck event',
    'free potluck organizer',
    'potluck event planner',
    'host a potluck',
    'potluck sign up sheet online',
    'potluck party organizer',
    'create potluck online',
    'potluck invite link',
    'free party planner',
    'potluck coordinator',
    'no sign up potluck',
    'potluck event creator',
    'organize potluck dinner',
    'office potluck organizer',
    'family potluck planner',
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
    canonical: '/create',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Create Potluck Event — PotluckPartys',
  description: PAGE_DESC,
  applicationCategory: 'LifestyleApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Create a potluck event for free with no sign-up',
    'Get a unique shareable link and QR code instantly',
    'Guests can claim dishes without creating an account',
    'Real-time visibility of who is bringing what',
  ],
}

export default function CreateLayout({
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
