import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, shopOwnerProcedure } from '../trpc'

// Updated schemas to handle individual measurement fields
const createSpecificationsSchema = z.object({
  product_id: z.string().uuid(),
  available_sizes: z.array(z.string()),
  colors: z.array(z.string()),
  materials: z.array(z.string()),
  length: z.string().nullable(),
  width: z.string().nullable(),
  height: z.string().nullable()
})

const specificationsSchema = z.object({
  available_sizes: z.array(z.string()),
  colors: z.array(z.string()),
  materials: z.array(z.string()),
  length: z.string().nullable(),
  width: z.string().nullable(),
  height: z.string().nullable()
})

export const productSpecificationsRouter = createTRPCRouter({
  create: shopOwnerProcedure
    .input(createSpecificationsSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify product ownership
      const product = await ctx.db.products.findFirst({
        where: {
          id: input.product_id,
          shop: {
            owner_id: ctx.user.id
          }
        }
      })

      if (!product) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to add specifications to this product'
        })
      }

      return ctx.db.product_specifications.create({
        data: {
          product_id: input.product_id,
          available_sizes: input.available_sizes,
          colors: input.colors,
          materials: input.materials,
          length: input.length ?? null,
          width: input.width ?? null,
          height: input.height ?? null
        }
      })
    }),

  update: shopOwnerProcedure
    .input(
      z.object({
        id: z.string().uuid(), // This is the product_id
        data: specificationsSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First verify product ownership
      const product = await ctx.db.products.findFirst({
        where: {
          id: input.id,
          shop: {
            owner_id: ctx.user.id
          }
        },
        include: {
          specifications: true
        }
      })

      if (!product) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update these specifications'
        })
      }

      // Prepare the data
      const data = {
        product_id: input.id,
        available_sizes: input.data.available_sizes,
        colors: input.data.colors,
        materials: input.data.materials,
        length: input.data.length ?? null,
        width: input.data.width ?? null,
        height: input.data.height ?? null
      }

      // If specifications exist, update them; if not, create them
      return ctx.db.product_specifications.upsert({
        where: {
          product_id: input.id
        },
        update: data,
        create: data
      })
    }),

  getByProductId: shopOwnerProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const spec = await ctx.db.product_specifications.findFirst({
        where: {
          product_id: input,
          product: {
            shop: {
              owner_id: ctx.user.id
            }
          }
        }
      })

      if (!spec) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Specifications not found'
        })
      }

      return {
        ...spec
      }
    })
})
