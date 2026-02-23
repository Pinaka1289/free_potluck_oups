import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/components/ui/Toast'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const SITE_NAME = 'PotluckPartys'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://potluckpartys.com'
const SITE_TITLE = 'PotluckPartys | Free Potluck Organizer with AI Ideas & Recipes'
const SITE_DESC =
  'PotluckPartys is the free potluck event organizer with built-in AI. Create a potluck event in seconds, share via link or QR code, let guests claim dishes, and use AI to generate potluck food ideas and full recipes — no sign-up required.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    'potluck organizer',
    'free potluck planner',
    'potluck event app',
    'potluck ideas',
    'AI potluck ideas',
    'AI recipe generator',
    'potluck food ideas',
    'organize potluck',
    'potluck party planner',
    'share potluck link',
    'potluck dish tracker',
    'free party planner',
    'potluck sign up sheet',
    'who is bringing what potluck',
    'potluck app free',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
    creator: '@potluckpartys',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] antialiased">
        <ThemeProvider>
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 pt-16 md:pt-20">
                {children}
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
