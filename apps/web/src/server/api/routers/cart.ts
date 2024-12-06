import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const cartRouter = createTRPCRouter({
  getCart: protectedProcedure.query(async ({ ctx }) => {
    const cart = await ctx.db.cart.findFirst({
      where: { user_id: ctx.user.id },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    return cart
  }),

  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1)
      })
    )
    .mutation(async ({ ctx, input }) => {
      let cart = await ctx.db.cart.findFirst({
        where: { user_id: ctx.user.id }
      })

      if (!cart) {
        cart = await ctx.db.cart.create({
          data: { user_id: ctx.user.id }
        })
      }

      return ctx.db.cart_item.upsert({
        where: {
          cart_id_product_id: {
            cart_id: cart.id,
            product_id: input.productId
          }
        },
        create: {
          cart_id: cart.id,
          product_id: input.productId,
          quantity: input.quantity
        },
        update: {
          quantity: { increment: input.quantity }
        }
      })
    }),

  removeItem: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.db.cart.findFirst({
        where: { user_id: ctx.user.id }
      })

      if (!cart) return null

      return ctx.db.cart_item.delete({
        where: {
          cart_id_product_id: {
            cart_id: cart.id,
            product_id: input.productId
          }
        }
      })
    }),

  updateQuantity: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().min(0)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.db.cart.findFirst({
        where: { user_id: ctx.user.id }
      })

      if (!cart) return null

      if (input.quantity === 0) {
        return ctx.db.cart_item.delete({
          where: {
            cart_id_product_id: {
              cart_id: cart.id,
              product_id: input.productId
            }
          }
        })
      }

      return ctx.db.cart_item.update({
        where: {
          cart_id_product_id: {
            cart_id: cart.id,
            product_id: input.productId
          }
        },
        data: { quantity: input.quantity }
      })
    })
})
