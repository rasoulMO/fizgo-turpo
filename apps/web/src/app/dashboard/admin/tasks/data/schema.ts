import { TaskLabel, TaskPriority, TaskStatus } from '@prisma/client'
import { z } from 'zod'

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(TaskStatus),
  label: z.nativeEnum(TaskLabel),
  priority: z.nativeEnum(TaskPriority),
  created_at: z.date(),
  updated_at: z.date(),
  due_date: z.date().nullable(),
  created_by: z.string(),
  assigned_to: z.string().nullable(),
  related_order_id: z.string().nullable(),
  related_shop_id: z.string().nullable(),
  related_delivery_id: z.string().nullable(),
  metadata: z.any().nullable(),
  // Relations
  assignee: z
    .object({
      id: z.string(),
      full_name: z.string().nullable(),
      avatar_url: z.string().nullable()
    })
    .nullable(),
  creator: z
    .object({
      id: z.string(),
      full_name: z.string().nullable(),
      avatar_url: z.string().nullable()
    })
    .nullable(),
  order: z
    .object({
      id: z.string(),
      status: z.string()
    })
    .nullable(),
  shop: z
    .object({
      id: z.string(),
      name: z.string()
    })
    .nullable()
})

export type Task = z.infer<typeof taskSchema>
