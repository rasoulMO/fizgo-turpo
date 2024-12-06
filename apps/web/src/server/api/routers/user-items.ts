import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

const createItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  price: z.number().positive('Price must be positive'),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  materials: z.array(z.string()).optional(),
  is_negotiable: z.boolean().default(true),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  location: z
    .object({
      longitude: z.number(),
      latitude: z.number()
    })
    .optional()
})

const queryParamsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD', 'ARCHIVED']).optional(),
  seller_id: z.string().uuid().optional()
})

export const userItemsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createItemSchema)
    .mutation(async ({ ctx, input }) => {
      const { location, images, ...rest } = input

      return ctx.db.user_items.create({
        data: {
          ...rest,
          seller_id: ctx.user.id,
          status: 'DRAFT',
          images: images ? JSON.stringify(images) : undefined,
          location: location
            ? `(${location.longitude},${location.latitude})`
            : undefined
        }
      })
    }),

  // Other methods remain the same, just update the data structure where specifications was used
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: createItemSchema.partial()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.user_items.findUnique({
        where: { id: input.id }
      })

      if (!item || item.seller_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this item'
        })
      }

      const { location, images, ...rest } = input.data

      return ctx.db.user_items.update({
        where: { id: input.id },
        data: {
          ...rest,
          images: images ? JSON.stringify(images) : undefined,
          location: location
            ? `(${location.longitude},${location.latitude})`
            : undefined
        }
      })
    }),

  getAll: publicProcedure
    .input(queryParamsSchema)
    .query(async ({ ctx, input }) => {
      const where = {
        condition: input.condition,
        price: {
          gte: input.minPrice,
          lte: input.maxPrice
        },
        status: input.status ?? 'PUBLISHED',
        seller_id: input.seller_id,
        name: input.search
          ? { contains: input.search, mode: 'insensitive' as const }
          : undefined
      }

      const items = await ctx.db.user_items.findMany({
        take: input.limit + 1,
        where,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { created_at: 'desc' },
        include: { seller: true }
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (items.length > input.limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }

      return {
        items,
        nextCursor
      }
    }),

  getAllByUerId: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      return ctx.db.user_items.findMany({
        where: { seller_id: input },
        include: { seller: true },
        orderBy: { created_at: 'desc' }
      })
    }),

  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.user_items.findUnique({
        where: { id: input },
        include: { seller: true, likes: true }
      })

      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Item not found'
        })
      }

      return {
        ...item,
        images: Array.isArray(item.images)
          ? item.images
          : typeof item.images === 'string'
            ? JSON.parse(item.images)
            : []
      }
    }),

  toggleLike: protectedProcedure
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
      } else {
        await ctx.db.item_likes.create({
          data: {
            item_id: input.itemId,
            user_id: ctx.user.id
          }
        })
      }

      return { success: true }
    }),

  publish: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.user_items.findUnique({
        where: { id: input }
      })

      if (!item || item.seller_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to publish this item'
        })
      }

      return ctx.db.user_items.update({
        where: { id: input },
        data: { status: 'PUBLISHED' }
      })
    }),

  archive: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.user_items.findUnique({
        where: { id: input }
      })

      if (!item || item.seller_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to archive this item'
        })
      }

      return ctx.db.user_items.update({
        where: { id: input },
        data: { status: 'ARCHIVED' }
      })
    })
})
