import Link from 'next/link'
import { SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container flex h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
      <div className="grid place-items-center gap-4 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground" />
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold">Application Not Found</h1>
          <p className="text-muted-foreground">
            The application number you provided could not be found.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
