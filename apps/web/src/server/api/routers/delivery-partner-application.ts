import { sendDeliveryPartnerApplicationEmail } from '@/server/trigger/delivery-partner-application-email'
import { sendDeliveryStatusChangeEmail } from '@/server/trigger/delivery-partner-status-change'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import {
  adminProcedure,
  createTRPCRouter,
  customerProcedure,
  protectedProcedure
} from '../trpc'

// Input validation schemas
const createDeliveryApplicationSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  date_of_birth: z.date(),
  phone_number: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),

  // Vehicle Information
  vehicle_type: z.enum(['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN']),
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_year: z.number().int().min(1900).optional(),
  vehicle_plate_number: z.string().optional(),

  // License Information
  drivers_license_number: z.string().optional(),
  drivers_license_expiry: z.date().optional(),

  // Experience
  has_delivery_experience: z.boolean(),
  years_of_experience: z.number().int().min(0).optional(),
  previous_companies: z.array(z.string()).optional(),

  // Availability
  preferred_work_areas: z
    .array(z.string())
    .min(1, 'At least one preferred work area is required'),
  available_hours: z.record(z.unknown()).optional(),

  // Documents
  documents: z.record(z.unknown()).optional()
})

const updateDeliveryApplicationSchema =
  createDeliveryApplicationSchema.partial()

const reviewDeliveryApplicationSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['APPROVED', 'REJECTED', 'UNDER_REVIEW']),
  rejection_reason: z.string().optional(),
  notes: z.array(z.string()).optional()
})

export const deliveryPartnerApplicationRouter = createTRPCRouter({
  // Create new application
  create: customerProcedure
    .input(createDeliveryApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user already has a pending or approved application
      const existingApplication =
        await ctx.db.delivery_partner_applications.findFirst({
          where: {
            user_id: ctx.user.id,
            status: {
              in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED']
            }
          }
        })

      if (existingApplication) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You already have an active delivery partner application'
        })
      }

      const application = await ctx.db.delivery_partner_applications.create({
        data: {
          ...input,
          documents: input.documents
            ? JSON.stringify(input.documents)
            : undefined,
          available_hours: input.available_hours
            ? JSON.stringify(input.available_hours)
            : undefined,
          user_id: ctx.user.id,
          status: 'SUBMITTED',
          submitted_at: new Date()
        }
      })

      // Send confirmation email
      await sendDeliveryPartnerApplicationEmail.trigger({
        fullName: input.full_name,
        email: input.email,
        applicationNumber: application.application_number,
        status: application.status,
        submittedAt: application.submitted_at!
      })

      return application
    }),

  // Get application by application number
  getByApplicationNumber: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const application = await ctx.db.delivery_partner_applications.findFirst({
        where: { application_number: input },
        include: { user: true, reviewer: true }
      })

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found'
        })
      }

      if (application.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this application'
        })
      }

      return application
    }),

  // Get application by ID
  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const application = await ctx.db.delivery_partner_applications.findUnique(
        {
          where: { id: input },
          include: { user: true, reviewer: true }
        }
      )

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found'
        })
      }

      if (application.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this application'
        })
      }

      return application
    }),

  // Get user's applications
  getUserApplications: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.delivery_partner_applications.findMany({
      where: { user_id: ctx.user.id },
      orderBy: { created_at: 'desc' },
      include: { reviewer: true }
    })
  }),

  // Update application
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateDeliveryApplicationSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db.delivery_partner_applications.findUnique(
        {
          where: { id: input.id }
        }
      )

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found'
        })
      }

      if (application.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this application'
        })
      }

      if (!['DRAFT', 'REJECTED'].includes(application.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only update applications in DRAFT or REJECTED status'
        })
      }

      return ctx.db.delivery_partner_applications.update({
        where: { id: input.id },
        data: {
          ...input.data,
          documents: input.data.documents
            ? JSON.stringify(input.data.documents)
            : undefined,
          available_hours: input.data.available_hours
            ? JSON.stringify(input.data.available_hours)
            : undefined
        }
      })
    }),

  // Submit draft application
  submit: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db.delivery_partner_applications.findUnique(
        {
          where: { id: input }
        }
      )

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found'
        })
      }

      if (application.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to submit this application'
        })
      }

      if (!['DRAFT', 'REJECTED'].includes(application.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only update applications in DRAFT or REJECTED status'
        })
      }

      const updatedApplication =
        await ctx.db.delivery_partner_applications.update({
          where: { id: input },
          data: {
            status: 'SUBMITTED',
            submitted_at: new Date()
          }
        })

      // Send submission confirmation email
      await sendDeliveryPartnerApplicationEmail.trigger({
        fullName: application.full_name,
        email: application.email,
        applicationNumber: application.application_number,
        status: 'SUBMITTED',
        submittedAt: new Date()
      })

      return updatedApplication
    }),

  // Withdraw application
  withdraw: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db.delivery_partner_applications.findUnique(
        {
          where: { id: input }
        }
      )

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found'
        })
      }

      if (application.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to withdraw this application'
        })
      }

      if (
        !['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(application.status)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot withdraw application in current status'
        })
      }

      return ctx.db.delivery_partner_applications.delete({
        where: { id: input }
      })
    }),

  // Admin procedures
  getAll: adminProcedure
    .input(
      z.object({
        status: z
          .enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'])
          .optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10)
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const where = input.status ? { status: input.status } : {}

      const [applications, total] = await Promise.all([
        ctx.db.delivery_partner_applications.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { created_at: 'desc' },
          include: { user: true, reviewer: true }
        }),
        ctx.db.delivery_partner_applications.count({ where })
      ])

      return {
        applications,
        pagination: {
          total,
          pages: Math.ceil(total / input.limit),
          page: input.page,
          limit: input.limit
        }
      }
    }),

  getByApplicationNumberAdmin: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const application = await ctx.db.delivery_partner_applications.findFirst({
        where: { application_number: input },
        include: { user: true, reviewer: true }
      })

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found'
        })
      }

      return application
    }),

  // Review application (admin only)
  review: adminProcedure
    .input(reviewDeliveryApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db.delivery_partner_applications.findUnique(
        {
          where: { id: input.id }
        }
      )

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found'
        })
      }

      if (!['SUBMITTED', 'UNDER_REVIEW'].includes(application.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Can only review applications in SUBMITTED or UNDER_REVIEW status'
        })
      }

      // If approving, check if user is already a delivery partner
      if (input.status === 'APPROVED') {
        const user = await ctx.db.users.findUnique({
          where: { id: application.user_id! }
        })

        if (user?.role === 'DELIVERY_PARTNER') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User is already a delivery partner'
          })
        }

        // Update user role to DELIVERY_PARTNER if approved
        await ctx.db.users.update({
          where: { id: application.user_id! },
          data: { role: 'DELIVERY_PARTNER' }
        })
      }

      const updatedApplication =
        await ctx.db.delivery_partner_applications.update({
          where: { id: input.id },
          data: {
            status: input.status,
            reviewed_by: ctx.user.id,
            reviewed_at: new Date(),
            rejection_reason: input.rejection_reason,
            notes: input.notes
          },
          include: { user: true }
        })

      // Send status change email
      await sendDeliveryStatusChangeEmail.trigger({
        fullName: updatedApplication.full_name,
        email: updatedApplication.email,
        applicationNumber: updatedApplication.application_number,
        newStatus: input.status,
        rejectionReason: input.rejection_reason,
        notes: input.notes
      })

      return updatedApplication
    })
})
