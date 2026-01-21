'use client'

import Link from 'next/link'
import { ChefHat, Heart, Github, Twitter } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))]">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[rgb(var(--foreground))]">
                Potluck<span className="text-[rgb(var(--primary))]">Party</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-[rgb(var(--muted-foreground))]">
              The easiest way to organize potluck events. Create, share, and collaborate with friends and family — no sign-up required!
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[rgb(var(--foreground))]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--primary))]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className="text-sm text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--primary))]"
                >
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  href="/auth"
                  className="text-sm text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--primary))]"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[rgb(var(--foreground))]">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--primary))]"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--primary))]"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--primary))]"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[rgb(var(--border))] pt-8 md:flex-row">
          <p className="flex items-center gap-1 text-sm text-[rgb(var(--muted-foreground))]">
            Made with <Heart className="h-4 w-4 text-[rgb(var(--accent))]" /> for potluck lovers everywhere
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--foreground))]"
              aria-label="Github"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--foreground))]"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            © {currentYear} PotluckParty. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
