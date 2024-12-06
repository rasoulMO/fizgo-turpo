import { sendPartnerApplicationEmail } from '@/server/trigger/partner-application-email'
import { sendStatusChangeEmail } from '@/server/trigger/partner-application-status-change'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import {
  adminProcedure,
  createTRPCRouter,
  customerProcedure,
  protectedProcedure
} from '../trpc'

// Input validation schemas
const createApplicationSchema = z.object({
  business_name: z.string(),
  business_description: z.string().optional(),
  business_address: z.string(),
  business_phone: z.string(),
  business_email: z.string().email(),
  business_registration_number: z.string().optional(),
  business_type: z.string(),
  contact_person_name: z.string(),
  contact_person_position: z.string(),
  social_media_links: z.record(z.string()).optional(),
  documents: z.record(z.unknown()).optional()
})

const updateApplicationSchema = createApplicationSchema.partial()

const reviewApplicationSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['APPROVED', 'REJECTED', 'UNDER_REVIEW']),
  rejection_reason: z.string().optional(),
  notes: z.array(z.string()).optional()
})

export const partnerApplicationRouter = createTRPCRouter({
  create: customerProcedure
    .input(createApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      // Create application
      const application = await ctx.db.partner_applications.create({
        data: {
          ...input,
          documents: input.documents
            ? JSON.stringify(input.documents)
            : undefined,
          user_id: ctx.user.id,
          status: 'SUBMITTED',
          submitted_at: new Date()
        }
      })

      // Send confirmation email
      await sendPartnerApplicationEmail.trigger({
        businessName: input.business_name,
        businessEmail: input.business_email,
        applicationNumber: application.application_number,
        status: application.status!,
        submittedAt: application.submitted_at!
      })

      return application
    }),

  getByApplicationNumber: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const application = await ctx.db.partner_applications.findFirst({
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

  getById: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const application = await ctx.db.partner_applications.findUnique({
        where: { id: input },
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

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateApplicationSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db.partner_applications.findUnique({
        where: { id: input.id }
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
          message: 'Not authorized to update this application'
        })
      }

      if (application.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only update applications in DRAFT status'
        })
      }

      return ctx.db.partner_applications.update({
        where: { id: input.id },
        data: {
          ...input.data,
          documents: input.data.documents
            ? JSON.stringify(input.data.documents)
            : undefined
        }
      })
    }),

  submit: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db.partner_applications.findUnique({
        where: { id: input }
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
          message: 'Not authorized to submit this application'
        })
      }

      return ctx.db.partner_applications.update({
        where: { id: input },
        data: {
          status: 'SUBMITTED',
          submitted_at: new Date()
        }
      })
    }),

  // Admin procedures below
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.partner_applications.findMany({
      include: { user: true, reviewer: true }
    })
  }),

  getByApplicationNumberAdmin: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.partner_applications.findFirst({
        where: { application_number: input },
        include: { user: true, reviewer: true }
      })
    }),

  review: adminProcedure
    .input(reviewApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db.partner_applications.update({
        where: { id: input.id },
        data: {
          status: input.status,
          reviewed_by: ctx.user.id,
          reviewed_at: new Date(),
          rejection_reason: input.rejection_reason,
          notes: input.notes
        },
        include: { user: true } // Include user to get email
      })

      // Send status change email
      await sendStatusChangeEmail.trigger({
        businessName: application.business_name,
        businessEmail: application.business_email,
        applicationNumber: application.application_number,
        newStatus: input.status,
        rejectionReason: input.rejection_reason,
        notes: input.notes
      })

      return application
    })
})
