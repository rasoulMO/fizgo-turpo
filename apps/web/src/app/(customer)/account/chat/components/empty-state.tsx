import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border p-8 text-center">
      <div className="rounded-full bg-primary/10 p-4">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">No messages yet</h3>
        <p className="text-muted-foreground">
          Start a conversation by browsing items and making an offer
        </p>
      </div>
      <Button asChild>
        <Link href="/items">Browse Items</Link>
      </Button>
    </div>
  )
}
