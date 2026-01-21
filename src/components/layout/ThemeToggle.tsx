'use client'

import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't use the hook until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]">
        <Moon className="h-5 w-5 text-[rgb(var(--foreground))]" />
      </div>
    )
  }
  
  return <ThemeToggleInner />
}

function ThemeToggleInner() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--secondary))]/80"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'light' ? 0 : 180,
          scale: theme === 'light' ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun className="h-5 w-5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 0 : -180,
          scale: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon className="h-5 w-5" />
      </motion.div>
    </button>
  )
}
