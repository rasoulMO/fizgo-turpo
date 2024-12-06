// /server/api/routers/address.ts
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

const addressSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  is_default: z.boolean().default(false)
})

export const addressRouter = createTRPCRouter({
  create: protectedProcedure
    .input(addressSchema)
    .mutation(async ({ ctx, input }) => {
      // If this is the first address or marked as default, unset other default addresses
      if (input.is_default) {
        await ctx.db.customer_addresses.updateMany({
          where: { user_id: ctx.user.id },
          data: { is_default: false }
        })
      }

      return ctx.db.customer_addresses.create({
        data: {
          ...input,
          user_id: ctx.user.id
        }
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: addressSchema.partial()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const address = await ctx.db.customer_addresses.findUnique({
        where: { id: input.id }
      })

      if (!address) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Address not found'
        })
      }

      if (address.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this address'
        })
      }

      // If setting as default, unset other default addresses
      if (input.data.is_default) {
        await ctx.db.customer_addresses.updateMany({
          where: {
            user_id: ctx.user.id,
            id: { not: input.id }
          },
          data: { is_default: false }
        })
      }

      return ctx.db.customer_addresses.update({
        where: { id: input.id },
        data: input.data
      })
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const address = await ctx.db.customer_addresses.findUnique({
        where: { id: input }
      })

      if (!address) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Address not found'
        })
      }

      if (address.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this address'
        })
      }

      return ctx.db.customer_addresses.delete({
        where: { id: input }
      })
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.customer_addresses.findMany({
      where: { user_id: ctx.user.id },
      orderBy: { created_at: 'desc' }
    })
  }),

  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const address = await ctx.db.customer_addresses.findUnique({
        where: { id: input }
      })

      if (!address) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Address not found'
        })
      }

      if (address.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this address'
        })
      }

      return address
    }),

  getDefault: protectedProcedure.query(({ ctx }) => {
    return ctx.db.customer_addresses.findFirst({
      where: {
        user_id: ctx.user.id,
        is_default: true
      }
    })
  })
})
