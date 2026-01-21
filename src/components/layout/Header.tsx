'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChefHat, User, LogOut, LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setShowUserMenu(false)
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/create', label: 'Create Event' },
  ]

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[rgb(var(--background))]/90 backdrop-blur-lg border-b border-[rgb(var(--border))]'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] transition-transform group-hover:scale-105">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[rgb(var(--foreground))]">
              Potluck<span className="text-[rgb(var(--primary))]">Party</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-[rgb(var(--primary))]'
                    : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] px-3 py-2 text-sm font-medium transition-colors hover:bg-[rgb(var(--secondary))]/80"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--primary))]">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="max-w-[120px] truncate">{user.email}</span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-1 shadow-lg"
                      >
                        <Link
                          href="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--secondary))]"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[rgb(var(--destructive))] transition-colors hover:bg-[rgb(var(--secondary))]"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--secondary))] md:hidden"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[rgb(var(--border))] bg-[rgb(var(--background))] md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block rounded-lg px-4 py-3 text-base font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
                      : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))]'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--secondary))]"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsOpen(false)
                    }}
                    className="w-full rounded-lg px-4 py-3 text-left text-base font-medium text-[rgb(var(--destructive))] transition-colors hover:bg-[rgb(var(--secondary))]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-[rgb(var(--primary))] transition-colors hover:bg-[rgb(var(--secondary))]"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
