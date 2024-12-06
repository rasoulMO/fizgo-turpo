import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function ItemNotFound() {
  return (
    <div className="container py-32 text-center">
      <h1 className="text-4xl font-bold">Item Not Found</h1>
      <p className="mt-4 text-muted-foreground">
        The item you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Button asChild className="mt-8">
        <Link href="/items">Browse Items</Link>
      </Button>
    </div>
  )
}
