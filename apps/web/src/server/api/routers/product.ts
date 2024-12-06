// src/server/api/routers/product.ts

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  shopOwnerProcedure
} from '../trpc'

// Input validation schemas
const createProductSchema = z.object({
  shop_id: z.string().uuid(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  sale_price: z.number().positive('Sale price must be positive').optional(),
  cost_price: z.number().positive('Cost price must be positive').optional(),
  sku: z.string().optional(),
  stock_quantity: z.number().int().default(0),
  low_stock_threshold: z.number().int().positive().optional().default(5),
  is_available: z.boolean().default(true),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX', 'KIDS']).default('UNISEX'),
  category: z.enum([
    'CLOTHING',
    'SHOES',
    'ACCESSORIES',
    'DESIGNER',
    'STREETWEAR',
    'SPORTS'
  ]),
  subcategory: z.string(),
  specifications: z
    .object({
      available_sizes: z.array(z.string()).optional(),
      colors: z.array(z.string()).optional(),
      materials: z.array(z.string()).optional(),
      height: z.string().optional(),
      width: z.string().optional(),
      length: z.string().optional()
    })
    .optional()
})

const updateProductSchema = createProductSchema.partial()

const queryParamsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
  shop_id: z.string().uuid().optional(),
  category: z
    .enum([
      'CLOTHING',
      'SHOES',
      'ACCESSORIES',
      'DESIGNER',
      'STREETWEAR',
      'SPORTS'
    ])
    .optional(),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX', 'KIDS']).optional(),
  search: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  isAvailable: z.boolean().optional(),
  orderBy: z.enum(['created_at', 'price_asc', 'price_desc']).optional()
})

export const productRouter = createTRPCRouter({
  create: shopOwnerProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify shop ownership
      const shop = await ctx.db.shops.findUnique({
        where: { id: input.shop_id }
      })

      if (!shop || shop.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to create products for this shop'
        })
      }

      const { specifications, ...productData } = input

      const product = await ctx.db.products.create({
        data: {
          ...productData,
          images: productData.images
            ? JSON.stringify(productData.images)
            : undefined,
          specifications: specifications
            ? {
                create: specifications
              }
            : undefined
        },
        include: {
          specifications: true
        }
      })

      return product
    }),

  getAll: publicProcedure
    .input(queryParamsSchema)
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        shop_id,
        category,
        gender,
        search,
        minPrice,
        maxPrice,
        isAvailable,
        orderBy
      } = input

      const where = {
        shop_id: shop_id,
        category: category ? { in: [category] } : undefined,
        gender: gender,
        is_available: isAvailable ?? true,
        price: {
          gte: minPrice,
          lte: maxPrice
        },
        name: search
          ? { contains: search, mode: 'insensitive' as const }
          : undefined
      }

      const orderByClause =
        orderBy === 'price_asc'
          ? { price: 'asc' as const }
          : orderBy === 'price_desc'
            ? { price: 'desc' as const }
            : { created_at: 'desc' as const }

      const items = await ctx.db.products.findMany({
        take: limit + 1,
        where,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: orderByClause,
        include: { shop: true }
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }

      return {
        items,
        nextCursor
      }
    }),

  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.products.findUnique({
        where: { id: input },
        include: { shop: true, specifications: true, likes: true }
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found'
        })
      }

      return {
        ...product,
        images: Array.isArray(product.images)
          ? product.images
          : typeof product.images === 'string'
            ? JSON.parse(product.images)
            : [],
        specifications: product.specifications
          ? {
              ...product.specifications
            }
          : undefined
      }
    }),

  toggleLike: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db.product_likes.findFirst({
        where: {
          product_id: input.productId,
          user_id: ctx.user.id
        }
      })

      if (existingLike) {
        // Unlike
        await ctx.db.product_likes.delete({
          where: {
            id: existingLike.id
          }
        })
      } else {
        // Like
        await ctx.db.product_likes.create({
          data: {
            product_id: input.productId,
            user_id: ctx.user.id
          }
        })
      }

      return { success: true }
    }),

  getLikes: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid()
      })
    )
    .query(async ({ ctx, input }) => {
      const [totalLikes, userLike] = await Promise.all([
        ctx.db.product_likes.count({
          where: {
            product_id: input.productId
          }
        }),
        ctx.db.product_likes.findFirst({
          where: {
            product_id: input.productId,
            user_id: ctx.user.id
          }
        })
      ])

      return {
        count: totalLikes,
        isLiked: !!userLike
      }
    }),

  update: shopOwnerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateProductSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.products.findUnique({
        where: { id: input.id },
        include: { shop: true }
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found'
        })
      }

      if (product.shop?.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this product'
        })
      }

      const { specifications, shop_id, ...updateData } = input.data

      return ctx.db.products.update({
        where: { id: input.id },
        data: {
          ...updateData,
          images: updateData.images
            ? JSON.stringify(updateData.images)
            : undefined,
          specifications: specifications
            ? {
                upsert: {
                  create: specifications,
                  update: specifications
                }
              }
            : undefined
        },
        include: {
          specifications: true
        }
      })
    }),

  getByOwnerId: protectedProcedure.query(async ({ ctx }) => {
    const shop = await ctx.db.shops.findFirst({
      where: { owner_id: ctx.user.id }
    })

    if (!shop) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Shop not found'
      })
    }

    return shop
  }),

  delete: shopOwnerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership and delete
      return ctx.db.products.delete({
        where: { id: input.id }
      })
    }),

  updateStock: shopOwnerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().min(0)
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.products.update({
        where: { id: input.id },
        data: {
          stock_quantity: input.quantity,
          updated_at: new Date()
        }
      })
    }),

  updateThreshold: shopOwnerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        threshold: z.number().min(0)
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.products.update({
        where: { id: input.id },
        data: {
          low_stock_threshold: input.threshold,
          updated_at: new Date()
        }
      })
    }),

  toggleAvailability: shopOwnerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.products.findUnique({
        where: { id: input.id }
      })

      return ctx.db.products.update({
        where: { id: input.id },
        data: {
          is_available: !product?.is_available,
          updated_at: new Date()
        }
      })
    }),

  // Admin procedures
  getAllAdmin: adminProcedure
    .input(queryParamsSchema)
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        shop_id,
        category,
        gender,
        search,
        minPrice,
        maxPrice,
        isAvailable
      } = input

      const where = {
        shop_id: shop_id,
        category: category,
        gender: gender,
        is_available: isAvailable,
        price: {
          gte: minPrice,
          lte: maxPrice
        },
        name: search
          ? { contains: search, mode: 'insensitive' as const }
          : undefined
      }

      const items = await ctx.db.products.findMany({
        take: limit + 1,
        where,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { created_at: 'desc' },
        include: { shop: true }
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }

      return {
        items,
        nextCursor
      }
    }),

  updateSpecifications: shopOwnerProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        specifications: z.object({
          available_sizes: z.array(z.string()).optional(),
          colors: z.array(z.string()).optional(),
          materials: z.array(z.string()).optional(),
          height: z.string().optional(),
          width: z.string().optional(),
          length: z.string().optional()
        })
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.products.findUnique({
        where: { id: input.productId },
        include: { shop: true, specifications: true }
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found'
        })
      }

      if (product.shop?.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this product'
        })
      }

      if (product.specifications) {
        // Update existing specifications
        return ctx.db.product_specifications.update({
          where: { product_id: input.productId },
          data: input.specifications
        })
      } else {
        // Create new specifications
        return ctx.db.product_specifications.create({
          data: {
            ...input.specifications,
            product_id: input.productId
          }
        })
      }
    })
})
