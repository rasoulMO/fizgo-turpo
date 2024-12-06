// src/server/api/routers/user.ts
import { randomUUID } from 'crypto'
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const optionalUrl = z.union([
  z.string().url(),
  z.string().max(0),
  z.literal('')
])

const profileSettingsSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  website: optionalUrl.optional(),
  location: z.string().max(100).optional(),
  display_email: z.boolean().optional(),
  display_phone: z.boolean().optional(),
  is_public: z.boolean().optional(),
  social_links: z
    .object({
      twitter: optionalUrl.optional(),
      instagram: optionalUrl.optional(),
      linkedin: optionalUrl.optional()
    })
    .optional()
})

export const userRouter = createTRPCRouter({
  // Get public profile
  getPublicProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.user_profile.findFirst({
        where: {
          username: input.username,
          is_public: true
        },
        include: {
          user: {
            select: {
              full_name: true,
              avatar_url: true,
              email: true,
              phone_number: true
            }
          }
        }
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found'
        })
      }

      return {
        ...profile,
        user: {
          ...profile.user,
          email: profile.display_email ? profile.user.email : null,
          phone_number: profile.display_phone ? profile.user.phone_number : null
        }
      }
    }),

  // Get own full profile
  getOwnProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.users.findUnique({
      where: { id: ctx.user.id },
      include: {
        profile: true
      }
    })

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Profile not found'
      })
    }

    return profile
  }),

  // Update profile settings
  updateProfile: protectedProcedure
    .input(profileSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const cleanedInput = {
        ...input,
        website: input.website === '' ? null : input.website,
        social_links: input.social_links
          ? {
              twitter:
                input.social_links.twitter === ''
                  ? null
                  : input.social_links.twitter,
              instagram:
                input.social_links.instagram === ''
                  ? null
                  : input.social_links.instagram,
              linkedin:
                input.social_links.linkedin === ''
                  ? null
                  : input.social_links.linkedin
            }
          : undefined
      }

      if (input.username) {
        const existing = await ctx.db.user_profile.findUnique({
          where: { username: input.username }
        })
        if (existing && existing.user_id !== ctx.user.id) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Username already taken'
          })
        }
      }

      // First, try to find existing profile
      const existingProfile = await ctx.db.user_profile.findUnique({
        where: { user_id: ctx.user.id }
      })

      if (existingProfile) {
        // Update existing profile
        return ctx.db.user_profile.update({
          where: { user_id: ctx.user.id },
          data: cleanedInput
        })
      } else {
        // Create new profile with generated UUID
        return ctx.db.user_profile.create({
          data: {
            id: randomUUID(),
            user_id: ctx.user.id,
            ...input
          }
        })
      }
    }),

  // Update basic user info
  updateUser: protectedProcedure
    .input(
      z.object({
        full_name: z.string().min(2).max(50).optional(),
        phone_number: z.string().min(10).max(15).optional().nullable(),
        avatar_url: z.string().url().optional().nullable()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.users.update({
        where: { id: ctx.user.id },
        data: input
      })
    }),

  // Handle avatar upload
  updateAvatar: protectedProcedure
    .input(z.object({ avatarUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.users.update({
        where: { id: ctx.user.id },
        data: { avatar_url: input.avatarUrl }
      })
    }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.users.findMany()
  })
})
