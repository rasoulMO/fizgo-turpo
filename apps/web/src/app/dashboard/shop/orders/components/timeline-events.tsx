import React from 'react'
import type { order_events, OrderEventStatus } from '@prisma/client'
import { format } from 'date-fns'

import { orderStatusConfig } from './order-status-config'

interface TimelineEventsProps {
  events: (order_events & {
    creator: { full_name: string | null } | null
  })[]
  currentStatus: OrderEventStatus
}

const variantToBgColor: { [key: string]: string } = {
  default: 'bg-gray-100',
  secondary: 'bg-gray-200',
  destructive: 'bg-red-500',
  outline: 'bg-gray-100',
  ghost: 'bg-gray-100',
  link: 'bg-gray-100',
  success: 'bg-green-500',
  warning: 'bg-yellow-500'
}

const variantToTextColor: { [key: string]: string } = {
  default: 'text-gray-900',
  secondary: 'text-gray-900',
  destructive: 'text-white',
  outline: 'text-gray-900',
  ghost: 'text-gray-900',
  link: 'text-gray-900',
  success: 'text-white',
  warning: 'text-white'
}

type EventOrder = order_events & {
  creator: { full_name: string | null } | null
}

export function TimelineEvents({ events, currentStatus }: TimelineEventsProps) {
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const lastEventByType = events.reduce<Record<OrderEventStatus, order_events>>(
    (acc, event) => {
      acc[event.event_type] = event
      return acc
    },
    {} as Record<OrderEventStatus, order_events>
  )

  // Define the standard order flow steps
  const steps: OrderEventStatus[] = [
    'ORDER_PLACED',
    'PAYMENT_COMPLETED',
    'ORDER_CONFIRMED',
    'PREPARATION_STARTED',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED'
  ]

  // Calculate progress
  const getProgress = (): number => {
    const currentStepIndex = steps.findIndex(
      (status) => status === currentStatus
    )
    if (currentStepIndex === -1) return 0
    return ((currentStepIndex + 1) / steps.length) * 100
  }

  // Get special events (events not in the main steps)
  const specialEventStatuses = Object.keys(orderStatusConfig).filter(
    (status) => !steps.includes(status as OrderEventStatus)
  ) as OrderEventStatus[]

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200">
        <div
          className="absolute left-0 top-0 w-full bg-blue-500 transition-all duration-500"
          style={{ height: `${getProgress()}%` }}
        />
      </div>

      <div className="space-y-8">
        {/* Main Steps */}
        {steps.map((status, index) => {
          const config = orderStatusConfig[status]
          const event = lastEventByType[status] as EventOrder
          const isActive = currentStatus === status
          const isPassed = steps.findIndex((s) => s === currentStatus) >= index

          const bgColor = isPassed
            ? variantToBgColor[config.variant]
            : 'bg-gray-100'
          const iconColor = isPassed
            ? variantToTextColor[config.variant]
            : 'text-muted-foreground'
          const textColor = isPassed
            ? 'text-foreground'
            : 'text-muted-foreground'

          return (
            <div key={status} className="relative flex items-start gap-6 pl-8">
              {/* Icon */}
              <div
                className={`absolute left-0 rounded-full p-2 transition-colors duration-200 ${bgColor}`}
              >
                <config.icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              {/* Event Details */}
              <div className="flex-1 space-y-1 px-3 py-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${textColor}`}>
                    {config.label}
                  </p>
                  {event && (
                    <time className="text-sm text-muted-foreground">
                      {format(new Date(event.created_at), 'MMM d, h:mm a')}
                    </time>
                  )}
                </div>
                {event?.description && (
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
                {event?.creator?.full_name && (
                  <p className="text-sm text-muted-foreground">
                    by {event.creator.full_name}
                  </p>
                )}
                {event?.location && (
                  <p className="text-sm text-muted-foreground">
                    📍 {(event.location as { address: string }).address}
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {/* Special Events */}
        {sortedEvents
          .filter((event) => specialEventStatuses.includes(event.event_type))
          .map((event: EventOrder) => {
            const config = orderStatusConfig[event.event_type]
            const bgColor = variantToBgColor[config.variant]
            const iconColor = variantToTextColor[config.variant]

            return (
              <div
                key={event.id}
                className="relative flex items-start gap-6 pl-8"
              >
                {/* Icon */}
                <div className={`absolute left-0 rounded-full p-2 ${bgColor}`}>
                  <config.icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                {/* Event Details */}
                <div className="flex-1 space-y-1 p-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{config.label}</p>
                    <time className="text-sm text-muted-foreground">
                      {format(new Date(event.created_at), 'MMM d, h:mm a')}
                    </time>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  {event.creator?.full_name && (
                    <p className="text-sm text-muted-foreground">
                      by {event.creator.full_name}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
