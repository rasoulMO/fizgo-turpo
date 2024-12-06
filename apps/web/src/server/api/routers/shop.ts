import {
  getAccountBalance,
  getPayoutSchedule,
  listAccountPayouts,
  listAccountTransfers
} from '@/lib/stripe'
import {
  adminProcedure,
  createTRPCRouter,
  shopOwnerProcedure
} from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED'])
})

const updateShopSchema = z.object({
  stripe_account_id: z.string().optional(),
  stripe_account_status: z
    .enum(['PENDING', 'ACTIVE', 'DEAUTHORIZED', 'UPDATED', 'RESTRICTED'])
    .optional(),
  onboarding_completed: z.boolean().optional()
})

export const shopRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.shops.findMany()
  }),

  getMine: shopOwnerProcedure.query(async ({ ctx }) => {
    const shop = await ctx.db.shops.findFirst({
      where: {
        owner_id: ctx.user.id
      }
    })

    if (!shop) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Shop not found'
      })
    }

    return shop
  }),

  update: shopOwnerProcedure
    .input(updateShopSchema)
    .mutation(async ({ ctx, input }) => {
      const shop = await ctx.db.shops.findFirst({
        where: { owner_id: ctx.user.id }
      })

      if (!shop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found'
        })
      }

      return ctx.db.shops.update({
        where: { id: shop.id },
        data: input
      })
    }),

  updateStatus: shopOwnerProcedure
    .input(updateStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const shop = await ctx.db.shops.findFirst({
        where: { owner_id: ctx.user.id }
      })

      if (!shop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found'
        })
      }

      const updatedShop = await ctx.db.shops.update({
        where: { id: shop.id },
        data: { status: input.status }
      })

      return updatedShop
    }),

  getPayments: shopOwnerProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(10),
        cursor: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const shop = await ctx.db.shops.findFirst({
        where: {
          owner_id: ctx.user.id,
          status: 'ACTIVE'
        }
      })

      if (!shop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found'
        })
      }

      const payments = await ctx.db.payments.findMany({
        where: {
          order: {
            order_items: {
              some: {
                product: {
                  shop: {
                    owner_id: ctx.user.id
                  }
                }
              }
            }
          },
          NOT: {
            status: 'FAILED'
          }
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          order: {
            include: {
              order_items: {
                include: {
                  product: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (payments.length > input.limit) {
        const nextItem = payments.pop()
        nextCursor = nextItem?.id
      }

      return {
        items: payments,
        nextCursor
      }
    }),

  getBalance: shopOwnerProcedure.query(async ({ ctx }) => {
    const shop = await ctx.db.shops.findFirst({
      where: {
        owner_id: ctx.user.id,
        status: 'ACTIVE'
      }
    })

    if (!shop?.stripe_account_id) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Shop not found or Stripe account not connected'
      })
    }

    const balance = await getAccountBalance(shop.stripe_account_id)
    const payoutSchedule = await getPayoutSchedule(shop.stripe_account_id)

    return {
      balance,
      payoutSchedule: payoutSchedule ?? null
    }
  }),

  getPayouts: shopOwnerProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(10),
        cursor: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const shop = await ctx.db.shops.findFirst({
        where: {
          owner_id: ctx.user.id,
          status: 'ACTIVE'
        }
      })

      if (!shop?.stripe_account_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found or Stripe account not connected'
        })
      }

      const payouts = await listAccountPayouts({
        connectedAccountId: shop.stripe_account_id,
        limit: input.limit,
        startingAfter: input.cursor
      })

      const lastPayout = payouts.data[payouts.data.length - 1]

      return {
        items: payouts.data,
        nextCursor: payouts.has_more && lastPayout ? lastPayout.id : undefined
      }
    }),

  getTransfers: shopOwnerProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(10),
        cursor: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const shop = await ctx.db.shops.findFirst({
        where: {
          owner_id: ctx.user.id,
          status: 'ACTIVE'
        }
      })

      if (!shop?.stripe_account_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found or Stripe account not connected'
        })
      }

      const transfers = await listAccountTransfers({
        connectedAccountId: shop.stripe_account_id,
        limit: input.limit,
        startingAfter: input.cursor
      })

      const lastTransfer = transfers.data[transfers.data.length - 1]

      return {
        items: transfers.data,
        nextCursor:
          transfers.has_more && lastTransfer ? lastTransfer.id : undefined
      }
    })
})
