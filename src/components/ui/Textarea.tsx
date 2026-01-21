'use client'

import { cn } from '@/lib/utils'
import { forwardRef, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
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
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'min-h-[120px] w-full resize-y rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] transition-all focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/20',
            error && 'border-[rgb(var(--destructive))] focus:border-[rgb(var(--destructive))] focus:ring-[rgb(var(--destructive))]/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[rgb(var(--destructive))]">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
