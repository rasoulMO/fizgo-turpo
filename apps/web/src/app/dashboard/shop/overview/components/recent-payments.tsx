import { type payments } from '@prisma/client'

import { formatDate, formatPrice } from '@/utils/format'

interface RecentPaymentsProps {
  payments: Array<
    payments & {
      order: {
        order_items: Array<{
          product: {
            name: string
          }
        }>
      } | null
    }
  >
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  return (
    <div className="space-y-8">
      {payments.map((payment) => (
        <div key={payment.id} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {payment.order?.order_items[0]?.product.name ?? 'Unknown Product'}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(new Date(payment.created_at))}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {formatPrice(Number(payment.amount))}
          </div>
        </div>
      ))}
    </div>
  )
}
