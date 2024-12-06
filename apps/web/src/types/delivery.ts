// src/types/delivery.ts
import type { delivery_partner_applications } from '@prisma/client'
import { z } from 'zod'

export const createDeliveryApplicationSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  date_of_birth: z
    .date({
      required_error: 'Date of birth is required',
      invalid_type_error: 'Invalid date format'
    })
    .refine((date) => {
      const age = new Date().getFullYear() - date.getFullYear()
      return age >= 18
    }, 'You must be at least 18 years old'),
  phone_number: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Please enter a valid email'),
  address: z.string().min(5, 'Address is required'),

  // Vehicle Information
  vehicle_type: z.enum(['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN'], {
    required_error: 'Vehicle type is required'
  }),
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
  available_hours: z.record(z.boolean()).optional(),

  // Documents
  documents: z.record(z.unknown()).optional()
})

export type CreateDeliveryApplicationInput = z.infer<
  typeof createDeliveryApplicationSchema
>

export interface DeliveryApplicationResponse
  extends delivery_partner_applications {
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
