import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  email: z
    .string()
    .nullable()
    .transform((val) => val ?? '—'),
  full_name: z
    .string()
    .nullable()
    .transform((val) => val ?? '—'),
  avatar_url: z.string().nullable(),
  role: z.enum([
    'CUSTOMER',
    'SHOP_OWNER',
    'DELIVERY_PARTNER',
    'INTERNAL_OPERATOR',
    'ADMIN',
    'SUPER_ADMIN'
  ])
})

export type User = z.infer<typeof userSchema>
