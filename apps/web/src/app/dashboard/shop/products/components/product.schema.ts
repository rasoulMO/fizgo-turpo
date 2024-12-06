// schemas/product.schema.ts
import { ProductCategory, ProductGender } from '@prisma/client'
import { z } from 'zod'

// schemas/product.schema.ts
export const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Price must be a positive number'
  }),
  sale_price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Sale price must be a non-negative number'
    })
    .optional(),
  stock_quantity: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Stock quantity must be a non-negative number'
    }),
  low_stock_threshold: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Threshold must be a non-negative number'
    })
    .optional(),
  sku: z.string().optional(),
  gender: z.nativeEnum(ProductGender),
  category: z.nativeEnum(ProductCategory),
  subcategory: z.string().min(1, 'Subcategory is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  specifications: z.object({
    available_sizes: z
      .array(z.string())
      .min(1, 'At least one size is required'),
    colors: z.array(z.string()).min(1, 'At least one color is required'),
    materials: z.array(z.string()).min(1, 'At least one material is required'),
    length: z.string().nullable(),
    width: z.string().nullable(),
    height: z.string().nullable()
  })
})
