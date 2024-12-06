// src/server/api/routers/favorites.ts
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const favoritesRouter = createTRPCRouter({
  getLikedProducts: protectedProcedure.query(async ({ ctx }) => {
    const likedProducts = await ctx.db.product_likes.findMany({
      where: {
        user_id: ctx.user.id
      },
      include: {
        product: {
          include: {
            shop: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return likedProducts.map(({ product }) => ({
      ...product,
      images:
        typeof product.images === 'string'
          ? JSON.parse(product.images)
          : product.images
    }))
  }),

  getLikedItems: protectedProcedure.query(async ({ ctx }) => {
    const likedItems = await ctx.db.item_likes.findMany({
      where: {
        user_id: ctx.user.id
      },
      include: {
        item: {
          include: {
            seller: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return likedItems.map(({ item }) => ({
      ...item,
      images:
        typeof item.images === 'string' ? JSON.parse(item.images) : item.images
    }))
  }),

  // Add toggle methods for convenience
  toggleProductLike: protectedProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db.product_likes.findFirst({
        where: {
          product_id: input.productId,
          user_id: ctx.user.id
        }
      })

      if (existingLike) {
        await ctx.db.product_likes.delete({
          where: { id: existingLike.id }
        })
        return { liked: false }
      }

      await ctx.db.product_likes.create({
        data: {
          product_id: input.productId,
          user_id: ctx.user.id
        }
      })
      return { liked: true }
    }),

  toggleItemLike: protectedProcedure
    .input(z.object({ itemId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db.item_likes.findFirst({
        where: {
          item_id: input.itemId,
          user_id: ctx.user.id
        }
      })

      if (existingLike) {
        await ctx.db.item_likes.delete({
          where: { id: existingLike.id }
        })
        return { liked: false }
      }

      await ctx.db.item_likes.create({
        data: {
          item_id: input.itemId,
          user_id: ctx.user.id
        }
      })
      return { liked: true }
    })
})
