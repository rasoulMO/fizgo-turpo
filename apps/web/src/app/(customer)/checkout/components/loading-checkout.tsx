import { Skeleton } from '@/components/ui/skeleton'

export function LoadingCheckout() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-4 w-full" />
        <div className="mt-4 flex justify-between">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-24" />
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Skeleton className="h-[400px] w-full" />
        </div>
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  )
}
