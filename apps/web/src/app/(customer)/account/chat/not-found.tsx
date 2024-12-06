import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Chat Not Found</h2>
      <p className="text-muted-foreground">
        The chat you're looking for doesn't exist or you don't have access to
        it.
      </p>
      <Button asChild>
        <Link href="/account/chat">Return to Messages</Link>
      </Button>
    </div>
  )
}
