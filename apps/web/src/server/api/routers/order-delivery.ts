import crypto from 'crypto'
import {
  OrderEventStatus,
  TaskLabel,
  TaskPriority,
  UserRole
} from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export function generateSecureToken(): string {
  return crypto.randomBytes(16).toString('hex')
}

// Schema definitions
const deliveryTokenSchema = z.object({
  orderId: z.string().uuid(),
  token: z.string()
})

const deliveryResponseSchema = z.object({
  orderId: z.string().uuid(),
  accept: z.boolean(),
  rejectionReason: z.string().optional()
})

// Router definition
export const orderDeliveryRouter = createTRPCRouter({
  notifyDeliveryPartners: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input: orderId }) => {
      const order = await ctx.db.orders.findUnique({
        where: { id: orderId },
        include: {
          delivery_address: true,
          order_items: true
        }
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found'
        })
      }

      const deliveryPartners = await ctx.db.users.findMany({
        where: {
          role: UserRole.DELIVERY_PARTNER,
          delivery_partner_profiles: {
            some: {
              status: 'ACTIVE'
            }
          }
        },
        include: {
          delivery_partner_profiles: true
        }
      })

      const notifications = await Promise.all(
        deliveryPartners.map((partner) =>
          ctx.db.tasks.create({
            data: {
              title: `New Delivery Request - Order #${orderId.slice(-8)}`,
              description: [
                'New delivery request available:',
                `- Delivery to: ${order.delivery_address.city}, ${order.delivery_address.state}`,
                `- Items: ${order.order_items.length}`,
                `- Total Value: $${order.total}`,
                '',
                'Please respond within 30 minutes if you d like to accept this delivery.'
              ].join('\n'),
              label: TaskLabel.DELIVERY_PICKUP,
              priority: TaskPriority.HIGH,
              status: 'TODO',
              due_date: new Date(Date.now() + 30 * 60 * 1000),
              created_by: ctx.user.id,
              assigned_to: partner.id,
              related_order_id: orderId,
              metadata: {
                orderDetails: {
                  id: order.id,
                  items: order.order_items.length,
                  deliveryAddress: {
                    city: order.delivery_address.city,
                    state: order.delivery_address.state
                  }
                }
              }
            }
          })
        )
      )

      return { notified: notifications.length }
    }),

  respondToDeliveryRequest: protectedProcedure
    .input(deliveryResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.orders.findUnique({
        where: { id: input.orderId }
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found'
        })
      }

      if (input.accept) {
        const deliveryToken = generateSecureToken()

        return ctx.db.$transaction(async (tx) => {
          await tx.orders.update({
            where: { id: input.orderId },
            data: {
              status: OrderEventStatus.PICKUP_COMPLETED,
              tasks: {
                create: {
                  title: `Delivery Token for Order #${input.orderId.slice(-8)}`,
                  description: `Secure delivery token: ${deliveryToken}\nPresent this token to the shop to collect the order.`,
                  label: TaskLabel.DELIVERY_PICKUP,
                  priority: TaskPriority.HIGH,
                  status: 'TODO',
                  created_by: ctx.user.id,
                  assigned_to: ctx.user.id,
                  metadata: {
                    deliveryToken,
                    generatedAt: new Date().toISOString()
                  }
                }
              }
            }
          })

          await tx.order_events.create({
            data: {
              order_id: input.orderId,
              event_type: OrderEventStatus.PICKUP_COMPLETED,
              description: 'Delivery partner assigned',
              created_by: ctx.user.id,
              metadata: {
                deliveryPartnerId: ctx.user.id,
                deliveryToken
              }
            }
          })

          await tx.tasks.updateMany({
            where: {
              related_order_id: input.orderId,
              label: TaskLabel.DELIVERY_PICKUP,
              assigned_to: {
                not: ctx.user.id
              }
            },
            data: {
              status: 'CANCELLED'
            }
          })

          return { success: true, deliveryToken }
        })
      } else {
        await ctx.db.tasks.updateMany({
          where: {
            related_order_id: input.orderId,
            assigned_to: ctx.user.id,
            label: TaskLabel.DELIVERY_PICKUP
          },
          data: {
            status: 'CANCELLED',
            metadata: {
              rejectionReason: input.rejectionReason,
              rejectedAt: new Date().toISOString()
            }
          }
        })

        return { success: true }
      }
    }),

  verifyDeliveryToken: protectedProcedure
    .input(deliveryTokenSchema)
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.orders.findFirst({
        where: {
          id: input.orderId,
          order_events: {
            some: {
              event_type: OrderEventStatus.PICKUP_COMPLETED,
              metadata: {
                path: ['deliveryToken'],
                equals: input.token
              }
            }
          }
        }
      })

      if (!order) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid delivery token'
        })
      }

      return { verified: true }
    })
})
