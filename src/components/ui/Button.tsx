'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles = 'btn-base inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary))]/90 focus-visible:ring-[rgb(var(--primary))]',
      secondary: 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))]/80 focus-visible:ring-[rgb(var(--secondary))]',
      outline: 'border-2 border-[rgb(var(--border))] bg-transparent hover:bg-[rgb(var(--secondary))] focus-visible:ring-[rgb(var(--primary))]',
      ghost: 'bg-transparent hover:bg-[rgb(var(--secondary))] focus-visible:ring-[rgb(var(--primary))]',
      danger: 'bg-[rgb(var(--destructive))] text-white hover:bg-[rgb(var(--destructive))]/90 focus-visible:ring-[rgb(var(--destructive))]',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-5 text-base',
      lg: 'h-14 px-8 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
