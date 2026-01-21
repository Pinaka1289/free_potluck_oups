import { ChefHat } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-[rgb(var(--primary))]/30" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))]">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">Loading...</p>
      </div>
    </div>
  )
}
