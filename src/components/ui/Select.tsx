'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { forwardRef, SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
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
          <select
            ref={ref}
            id={id}
            className={cn(
              'w-full appearance-none rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 pr-10 text-[rgb(var(--foreground))] transition-all focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/20',
              error && 'border-[rgb(var(--destructive))] focus:border-[rgb(var(--destructive))] focus:ring-[rgb(var(--destructive))]/20',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-5 w-5 text-[rgb(var(--muted-foreground))]" />
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[rgb(var(--destructive))]">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
