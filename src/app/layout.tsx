import type { Metadata } from 'next'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/components/ui/Toast'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'PotluckPartys - Free Potluck Event Organizer',
  description: 'Create and organize potluck events for free. No sign-up required! Share links with guests and let everyone contribute to the feast.',
  keywords: ['potluck', 'event', 'party', 'food', 'organizer', 'free'],
  authors: [{ name: 'PotluckPartys' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'PotluckPartys - Free Potluck Event Organizer',
    description: 'Create and organize potluck events for free. No sign-up required!',
    type: 'website',
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
      </body>
    </html>
  )
}
