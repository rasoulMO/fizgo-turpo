// /server/api/routers/order.ts
import { sendOrderConfirmationEmail } from '@/server/trigger/order-confirmation-email'
import {
  OrderEventStatus,
  TaskLabel,
  TaskPriority,
  UserRole
} from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  shopOwnerProcedure
} from '../trpc'

const createOrderSchema = z.object({
  cart_id: z.string().uuid(),
  address_id: z.string().uuid(),
  notes: z.string().optional()
})

const queryParamsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  cursor: z.string().uuid().optional(),
  status: z.nativeEnum(OrderEventStatus).optional(),
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  orderBy: z.enum(['created_at', 'total', 'status']).optional()
})

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // 1. Get user details for email
        const user = await tx.users.findUnique({
          where: { id: ctx.user.id },
          select: {
            email: true,
            full_name: true
          }
        })

        if (!user?.email) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User email is required for order creation'
          })
        }

        // 2. Verify address belongs to user
        const address = await tx.customer_addresses.findUnique({
          where: { id: input.address_id }
        })

        if (!address || address.user_id !== ctx.user.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid delivery address'
          })
        }

        // 3. Get cart items with product and shop information
        const cartItems = await tx.cart_item.findMany({
          where: {
            cart_id: input.cart_id,
            cart: { user_id: ctx.user.id }
          },
          include: {
            product: {
              include: {
                shop: true
              }
            }
          }
        })

        if (cartItems.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cart is empty'
          })
        }

        // 4. Verify product availability and stock
        for (const item of cartItems) {
          if (!item.product.is_available) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Product ${item.product.name} is no longer available`
            })
          }

          if (item.quantity > item.product.stock_quantity) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Insufficient stock for ${item.product.name}`
            })
          }
        }

        // 5. Calculate totals
        const subtotal = cartItems.reduce(
          (sum, item) => sum + item.quantity * Number(item.product.price),
          0
        )
        const delivery_fee = 5.0 // You might want to calculate this based on distance/weight
        const total = subtotal + delivery_fee

        // 6. Create order
        const order = await tx.orders.create({
          data: {
            user_id: ctx.user.id,
            address_id: input.address_id,
            subtotal,
            delivery_fee,
            total,
            notes: input.notes,
            status: OrderEventStatus.ORDER_PLACED,
            order_items: {
              create: cartItems.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.product.price,
                subtotal: item.quantity * Number(item.product.price)
              }))
            }
          },
          include: {
            order_items: {
              include: {
                product: true
              }
            },
            delivery_address: true
          }
        })

        // 7. Update product stock
        for (const item of cartItems) {
          await tx.products.update({
            where: { id: item.product_id },
            data: {
              stock_quantity: {
                decrement: item.quantity
              }
            }
          })
        }

        // 8. Clear cart
        await tx.cart_item.deleteMany({
          where: { cart_id: input.cart_id }
        })

        // 9. Group items by shop for task creation
        const itemsByShop = cartItems.reduce(
          (acc, item) => {
            const shopId = item.product.shop?.id
            if (!shopId) return acc

            if (!acc[shopId]) {
              acc[shopId] = {
                shopId,
                shopName: item.product.shop?.name,
                ownerId: item.product.shop?.owner_id ?? undefined,
                items: []
              }
            }

            acc[shopId].items.push({
              name: item.product.name,
              quantity: item.quantity,
              productId: item.product_id
            })

            return acc
          },
          {} as Record<
            string,
            {
              shopId: string
              shopName?: string
              ownerId?: string
              items: Array<{
                name: string
                quantity: number
                productId: string
              }>
            }
          >
        )

        // 10. Create processing tasks for each shop
        for (const shopGroup of Object.values(itemsByShop)) {
          await tx.tasks.create({
            data: {
              title: `Process Order #${order.id.slice(-8)}`,
              description: [
                `New order received from ${user.full_name || 'Customer'} requiring processing:`,
                '- Review order items',
                '- Verify stock availability',
                '- Pack items according to order specifications',
                '- Mark as ready for pickup when completed',
                '',
                'Items:',
                ...shopGroup.items.map(
                  (item) => `- ${item.quantity}x ${item.name}`
                )
              ].join('\n'),
              label: TaskLabel.NEW_ORDER,
              priority: TaskPriority.HIGH,
              due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
              creator: {
                connect: { id: ctx.user.id }
              },
              ...(shopGroup.ownerId && {
                assignee: {
                  connect: { id: shopGroup.ownerId }
                }
              }),
              order: {
                connect: { id: order.id }
              },
              shop: {
                connect: { id: shopGroup.shopId }
              },
              metadata: {
                items: shopGroup.items,
                created: new Date().toISOString()
              }
            }
          })
        }

        // 11. Create delivery assignment task
        await tx.tasks.create({
          data: {
            title: `Assign Delivery for Order #${order.id.slice(-8)}`,
            description: [
              `Order #${order.id.slice(-8)} ready for delivery assignment.`,
              `- Delivery Address: ${address.address_line1}, ${address.city}, ${address.state}`,
              `- Estimated Weight: ${cartItems.reduce((total, item) => total + item.quantity, 0)}kg`,
              '- Review delivery location and requirements',
              '- Assign appropriate delivery partner',
              '- Ensure delivery partner has capacity'
            ].join('\n'),
            label: TaskLabel.DELIVERY_MANAGEMENT,
            priority: TaskPriority.HIGH,
            due_date: new Date(Date.now() + 48 * 60 * 60 * 1000),
            creator: {
              connect: { id: ctx.user.id }
            },
            order: {
              connect: { id: order.id }
            },
            metadata: {
              deliveryAddress: `${address.address_line1}, ${address.city}, ${address.state}`,
              estimatedWeight: cartItems.reduce(
                (total, item) => total + item.quantity,
                0
              ),
              specialHandling: false,
              preferredDeliveryTime: 'standard',
              created: new Date().toISOString()
            }
          }
        })

        const deliveryPartners = await tx.users.findMany({
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

        // Create notification tasks for each delivery partner
        const notifications = await Promise.all(
          deliveryPartners.map((partner) =>
            tx.tasks.create({
              data: {
                title: `New Delivery Request - Order #${order.id.slice(-8)}`,
                description: [
                  'New delivery request available:',
                  `- Delivery to: ${address.city}, ${address.state}`,
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
                related_order_id: order.id,
                metadata: {
                  orderDetails: {
                    id: order.id,
                    items: order.order_items.length,
                    deliveryAddress: {
                      city: address.city,
                      state: address.state
                    }
                  }
                }
              }
            })
          )
        )

        // 12. Prepare and send order confirmation email
        const emailPayload = {
          orderId: order.id,
          customerEmail: user.email,
          customerName: user.full_name || 'Valued Customer',
          orderNumber: order.id.slice(-8).toUpperCase(),
          orderDate: order.created_at,
          deliveryAddress: {
            fullName: address.full_name,
            addressLine1: address.address_line1,
            addressLine2: address.address_line2,
            city: address.city,
            state: address.state,
            postalCode: address.postal_code,
            country: address.country
          },
          items: order.order_items.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            subtotal: Number(item.subtotal)
          })),
          subtotal: Number(order.subtotal),
          deliveryFee: Number(order.delivery_fee),
          total: Number(order.total)
        }

        await sendOrderConfirmationEmail.trigger(emailPayload)

        return {
          ...order,
          tasks_created: true,
          shop_count: Object.keys(itemsByShop).length,
          notifications_sent: notifications.length,
          delivery_partners_notified: deliveryPartners.length
        }
      })
    }),

  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.orders.findUnique({
        where: { id: input },
        include: {
          order_items: {
            include: {
              product: true
            }
          },
          delivery_address: true,
          payment: true
        }
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found'
        })
      }

      if (order.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this order'
        })
      }

      return order
    }),

  getUserOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().uuid().optional(),
        status: z.nativeEnum(OrderEventStatus).optional() // Updated to use OrderEventStatus
      })
    )
    .query(async ({ ctx, input }) => {
      const orders = await ctx.db.orders.findMany({
        where: {
          user_id: ctx.user.id,
          ...(input.status ? { status: input.status } : {})
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { created_at: 'desc' },
        include: {
          order_items: {
            include: {
              product: true
            }
          },
          delivery_address: true,
          payment: true
        }
      })

      let nextCursor: typeof input.cursor = undefined
      if (orders.length > input.limit) {
        const nextItem = orders.pop()
        nextCursor = nextItem?.id
      }

      return {
        items: orders,
        nextCursor
      }
    }),

  getOrderSummary: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.orders.findUnique({
        where: { id: input },
        include: {
          order_items: {
            include: {
              product: true
            }
          },
          delivery_address: true,
          payment: {
            include: {
              payment_method: true
            }
          }
        }
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found'
        })
      }

      if (order.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this order'
        })
      }

      return order
    }),

  cancelOrder: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const order = await tx.orders.findUnique({
          where: { id: input },
          include: {
            order_items: true,
            payment: true
          }
        })

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found'
          })
        }

        if (order.user_id !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to cancel this order'
          })
        }

        if (order.status !== OrderEventStatus.ORDER_PLACED) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Can only cancel orders that have been placed but not yet processed'
          })
        }

        // Restore product stock
        for (const item of order.order_items) {
          await tx.products.update({
            where: { id: item.product_id },
            data: {
              stock_quantity: {
                increment: item.quantity
              }
            }
          })
        }

        // Update order status
        return tx.orders.update({
          where: { id: input },
          data: { status: OrderEventStatus.CANCELLED },
          include: {
            order_items: {
              include: {
                product: true
              }
            },
            delivery_address: true,
            payment: true
          }
        })
      })
    }),

  getOrderWithEvents: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.orders.findUnique({
        where: {
          id: input,
          user_id: ctx.user.id
        },
        include: {
          order_events: {
            orderBy: {
              created_at: 'asc'
            },
            include: {
              creator: {
                select: {
                  full_name: true
                }
              }
            }
          },
          order_items: {
            include: {
              product: true
            }
          },
          delivery_address: true,
          payment: {
            include: {
              payment_method: true
            }
          }
        }
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found'
        })
      }

      return order
    }),

  // Helper mutation to create order events (for internal use)
  createOrderEvent: protectedProcedure
    .input(
      z.object({
        order_id: z.string().uuid(),
        event_type: z.nativeEnum(OrderEventStatus), // Updated to use OrderEventStatus
        description: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        location: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            address: z.string()
          })
          .optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify order exists and user has permission
      const order = await ctx.db.orders.findUnique({
        where: { id: input.order_id }
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found'
        })
      }

      // Create the event
      return ctx.db.order_events.create({
        data: {
          order_id: input.order_id,
          event_type: input.event_type,
          description: input.description,
          metadata: input.metadata,
          location: input.location,
          created_by: ctx.user.id
        }
      })
    }),

  // shopOwnerProcedure
  getShopOrders: shopOwnerProcedure
    .input(queryParamsSchema)
    .query(async ({ ctx, input }) => {
      const shop = await ctx.db.shops.findFirst({
        where: { owner_id: ctx.user.id }
      })

      if (!shop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found'
        })
      }

      const orders = await ctx.db.orders.findMany({
        where: {
          order_items: {
            some: {
              product: {
                shop_id: shop.id
              }
            }
          }
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          order_items: true,
          delivery_address: true,
          payment: true
        },
        orderBy: { created_at: 'desc' }
      })

      let nextCursor: typeof input.cursor = undefined
      if (orders.length > input.limit) {
        const nextItem = orders.pop()
        nextCursor = nextItem?.id
      }

      return {
        items: orders,
        nextCursor
      }
    }),

  getOrderDetails: shopOwnerProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      // Find the shop owned by the user
      const shop = await ctx.db.shops.findFirst({
        where: { owner_id: ctx.user.id }
      })

      if (!shop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found'
        })
      }

      // Get order with all related data, ensuring it belongs to the shop
      const order = await ctx.db.orders.findFirst({
        where: {
          id: input,
          order_items: {
            some: {
              product: {
                shop_id: shop.id
              }
            }
          }
        },
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          },
          order_events: {
            orderBy: {
              created_at: 'desc'
            },
            include: {
              creator: {
                select: {
                  full_name: true
                }
              }
            }
          },
          order_items: {
            include: {
              product: {
                include: {
                  shop: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          },
          delivery_address: true,
          payment: {
            include: {
              payment_method: true
            }
          }
        }
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found or you do not have permission to view it'
        })
      }

      return order
    }),

  updateStatus: shopOwnerProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        status: z.nativeEnum(OrderEventStatus)
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.orders.update({
        where: { id: input.orderId },
        data: { status: input.status }
      })
    })
})
