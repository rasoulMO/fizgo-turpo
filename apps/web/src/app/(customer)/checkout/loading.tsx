import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-4 w-full" />
        <div className="mt-4 flex justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <Skeleton className="mr-2 h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        </div>

        <Card className="h-fit p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="mt-6">
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    </div>
  )
}
