'use client'

import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-2 block text-sm font-medium text-[rgb(var(--foreground))]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-[rgb(var(--muted-foreground))]">{icon}</span>
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] transition-all focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/20',
              icon && 'pl-11',
              error && 'border-[rgb(var(--destructive))] focus:border-[rgb(var(--destructive))] focus:ring-[rgb(var(--destructive))]/20',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[rgb(var(--destructive))]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
