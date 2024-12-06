// /server/api/routers/task.ts
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { TaskLabel, TaskPriority, TaskStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const updateTaskSchema = z.object({
  taskId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  label: z.nativeEnum(TaskLabel).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  metadata: z.record(z.any()).optional(),
  dueDate: z.date().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional()
})

const createTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default('TODO'),
  label: z.nativeEnum(TaskLabel),
  priority: z.nativeEnum(TaskPriority).default('MEDIUM'),
  dueDate: z.date().optional(),
  assignedTo: z.string().optional(),
  relatedOrderId: z.string().optional(),
  relatedShopId: z.string().optional(),
  relatedDeliveryId: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

export const taskRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tasks.findMany({
      include: {
        assignee: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true
          }
        },
        creator: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true
          }
        },
        order: true,
        shop: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })
  }),

  getById: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.tasks.findUnique({
        where: { id: input.taskId },
        include: {
          assignee: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true
            }
          },
          creator: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true
            }
          },
          order: true,
          shop: true,
          history: {
            include: {
              old_assignee: {
                select: {
                  id: true,
                  full_name: true
                }
              },
              new_assignee: {
                select: {
                  id: true,
                  full_name: true
                }
              },
              changer: {
                select: {
                  id: true,
                  full_name: true
                }
              }
            },
            orderBy: {
              changed_at: 'desc'
            }
          }
        }
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found'
        })
      }

      return task
    }),

  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.tasks.create({
        data: {
          title: input.title,
          description: input.description,
          status: input.status,
          label: input.label,
          priority: input.priority,
          due_date: input.dueDate,
          assigned_to: input.assignedTo,
          created_by: ctx.user.id,
          related_order_id: input.relatedOrderId,
          related_shop_id: input.relatedShopId,
          related_delivery_id: input.relatedDeliveryId,
          metadata: input.metadata
        }
      })

      return task
    }),

  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { taskId, notes, ...updateData } = input

      // Get the current task state for comparison
      const currentTask = await ctx.db.tasks.findUnique({
        where: { id: taskId },
        select: {
          status: true,
          priority: true,
          assigned_to: true
        }
      })

      if (!currentTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found'
        })
      }

      // Create history entry if there are relevant changes
      if (
        updateData.status !== currentTask.status ||
        updateData.priority !== currentTask.priority ||
        updateData.assignedTo !== currentTask.assigned_to
      ) {
        await ctx.db.task_history.create({
          data: {
            task_id: taskId,
            changed_by: ctx.user.id,
            status_from: currentTask.status,
            status_to: updateData.status,
            priority_from: currentTask.priority,
            priority_to: updateData.priority,
            assigned_from: currentTask.assigned_to,
            assigned_to: updateData.assignedTo,
            notes
          }
        })
      }

      // Update the task
      const task = await ctx.db.tasks.update({
        where: { id: taskId },
        data: {
          title: updateData.title,
          description: updateData.description,
          status: updateData.status,
          label: updateData.label,
          priority: updateData.priority,
          due_date: updateData.dueDate,
          assigned_to: updateData.assignedTo,
          metadata: updateData.metadata
        }
      })

      return task
    }),

  delete: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tasks.delete({
        where: { id: input.taskId }
      })

      return { success: true }
    })
})
