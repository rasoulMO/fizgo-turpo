// /src/types/partner.ts
import type { partner_applications } from '@prisma/client'
import { z } from 'zod'

// Shared validation schemas
export const socialMediaSchema = z.object({
  platform: z.string().min(1, 'Platform name is required'),
  url: z.string().url('Please enter a valid URL')
})

export const createApplicationSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  business_description: z
    .string()
    .min(10, 'Please provide a detailed business description'),
  business_address: z.string().min(5, 'Business address is required'),
  business_phone: z.string().min(5, 'Business phone is required'),
  business_email: z.string().email('Please enter a valid email'),
  business_registration_number: z.string().optional(),
  business_type: z.string().min(2, 'Business type is required'),
  contact_person_name: z.string().min(2, 'Contact person name is required'),
  contact_person_position: z
    .string()
    .min(2, 'Contact person position is required'),
  social_media_links: z.array(socialMediaSchema).optional(),
  documents: z.record(z.unknown()).optional()
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>

export interface PartnerApplicationResponse extends partner_applications {
  user?: {
    id: string
    email?: string | null
    full_name?: string | null
  } | null
  reviewer?: {
    id: string
    email?: string | null
    full_name?: string | null
  } | null
}
