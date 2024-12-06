import { api } from '@/trpc/server'
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  ShoppingBag
} from 'lucide-react'

import { formatPrice } from '@/utils/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { BalanceChart } from './components/balance-chart'
import { RecentPayments } from './components/recent-payments'
import { RecentPayouts } from './components/recent-payouts'

export default async function ShopOverviewPage() {
  const shop = await api.shop.getMine()
  const { balance, payoutSchedule } = await api.shop.getBalance()
  const payments = await api.shop.getPayments({ limit: 5 })
  const payouts = await api.shop.getPayouts({ limit: 5 })
  const transfers = await api.shop.getTransfers({ limit: 5 })

  const availableBalance =
    balance.available.reduce((sum, b) => sum + b.amount, 0) / 100

  const pendingBalance =
    balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100

  const formattedBalance = {
    available: balance.available.map((b) => ({
      amount: b.amount,
      currency: b.currency,
      source_types: { card: b.source_types?.card ?? 0 }
    })),
    pending: balance.pending.map((b) => ({
      amount: b.amount,
      currency: b.currency,
      source_types: { card: b.source_types?.card ?? 0 }
    }))
  }

  return (
    <div className="container py-8">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">
          Manage and track your shop balance and activity
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Balance
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(availableBalance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Next payout: {payoutSchedule?.schedule?.interval ?? 'manual'}{' '}
                  schedule
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Balance
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(pendingBalance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {balance.pending.length} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Transfers
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(transfers.items[0]?.amount ?? 0 / 100)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last transfer{' '}
                  {transfers.items[0]?.created
                    ? new Date(
                        transfers.items[0].created * 1000
                      ).toLocaleDateString()
                    : 'N/A'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Payouts
                </CardTitle>
                <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(payouts.items[0]?.amount ?? 0 / 100)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last payout{' '}
                  {payouts.items[0]?.arrival_date
                    ? new Date(
                        payouts.items[0].arrival_date * 1000
                      ).toLocaleDateString()
                    : 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Balance Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <BalanceChart data={formattedBalance} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentPayments payments={payments.items} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentPayouts payouts={payouts.items} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
