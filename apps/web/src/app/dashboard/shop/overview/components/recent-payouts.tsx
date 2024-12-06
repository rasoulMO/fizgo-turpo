import { formatDate, formatPrice } from '@/utils/format'

interface RecentPayoutsProps {
  payouts: Array<{
    id: string
    amount: number
    arrival_date: number
    status: string
  }>
}

export function RecentPayouts({ payouts }: RecentPayoutsProps) {
  return (
    <div className="space-y-8">
      {payouts.map((payout) => (
        <div key={payout.id} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              Payout #{payout.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(new Date(payout.arrival_date * 1000))}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {formatPrice(payout.amount / 100)}
          </div>
        </div>
      ))}
    </div>
  )
}
