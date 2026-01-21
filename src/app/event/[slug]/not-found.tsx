import Link from 'next/link'
import { AlertCircle, Home, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function EventNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--destructive))]/10">
        <AlertCircle className="h-10 w-10 text-[rgb(var(--destructive))]" />
      </div>
      
      <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
        Event Not Found
      </h1>
      
      <p className="mt-3 max-w-md text-[rgb(var(--muted-foreground))]">
        The event you&apos;re looking for doesn&apos;t exist or may have been removed. 
        Please check the link and try again.
      </p>
      
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button variant="outline" icon={<Home className="h-4 w-4" />}>
            Go Home
          </Button>
        </Link>
        <Link href="/create">
          <Button icon={<Plus className="h-4 w-4" />}>
            Create New Event
          </Button>
        </Link>
      </div>
    </div>
  )
}
