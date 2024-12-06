'use client'

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { formatPrice } from '@/utils/format'
import { Card } from '@/components/ui/card'

interface BalanceChartProps {
  data: {
    available: Array<{
      amount: number
      currency: string
      source_types: {
        card: number | undefined
      }
    }>
    pending: Array<{
      amount: number
      currency: string
      source_types: {
        card: number | undefined
      }
    }>
  }
}

export function BalanceChart({ data }: BalanceChartProps) {
  const chartData = [
    {
      name: 'Available',
      total: data.available.reduce((sum, b) => sum + b.amount, 0) / 100
    },
    {
      name: 'Pending',
      total: data.pending.reduce((sum, b) => sum + b.amount, 0) / 100
    }
  ]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatPrice(value)}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload?.[0]?.payload) {
              return (
                <Card className="p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {payload[0].payload.name}
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {formatPrice(payload[0].value as number)}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
