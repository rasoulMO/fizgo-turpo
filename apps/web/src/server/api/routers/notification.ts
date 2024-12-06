import { env } from '@/env'
import { Expo } from 'expo-server-sdk'
import { Resend } from 'resend'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

const expo = new Expo({
  accessToken: env.EXPO_ACCESS_TOKEN,
  useFcmV1: true
})

const resend = new Resend(env.RESEND_API_KEY)

export const notificationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        type: z.enum(['PUSH', 'EMAIL', 'BOTH']),
        target_users: z.array(z.string()).optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notifications.create({
        data: {
          title: input.title,
          body: input.body,
          type: input.type,
          target_users: input.target_users || []
        }
      })
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.notifications.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
  }),

  send: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notifications.findUnique({
        where: { id: input.id }
      })

      if (!notification) {
        throw new Error('Notification not found')
      }

      // Get target users
      const userQuery =
        notification.target_users.length > 0
          ? { id: { in: notification.target_users } }
          : {}

      const users = await ctx.db.users.findMany({
        where: {
          ...userQuery,
          OR: [
            {
              expo_push_token:
                notification.type !== 'EMAIL' ? { not: null } : undefined,
              is_push_notification:
                notification.type !== 'EMAIL' ? true : undefined
            },
            {
              email: notification.type !== 'PUSH' ? { not: null } : undefined
            }
          ]
        },
        select: {
          id: true,
          email: true,
          expo_push_token: true,
          is_push_notification: true
        }
      })

      // Handle push notifications
      if (notification.type !== 'EMAIL') {
        const pushMessages = users
          .filter((user) => user.expo_push_token && user.is_push_notification)
          .map((user) => user.expo_push_token)
          .filter((token): token is string => {
            return token !== null && Expo.isExpoPushToken(token)
          })
          .map((pushToken) => ({
            to: pushToken,
            sound: 'default',
            title: notification.title,
            body: notification.body,
            data: { notificationId: notification.id }
          }))

        const chunks = expo.chunkPushNotifications(pushMessages)
        for (const chunk of chunks) {
          try {
            await expo.sendPushNotificationsAsync(chunk)
          } catch (error) {
            console.error('Error sending push notification:', error)
          }
        }
      }

      // Handle email notifications
      if (notification.type !== 'PUSH') {
        const emailUsers = users.filter((user) => user.email)

        for (const user of emailUsers) {
          try {
            await resend.emails.send({
              from: 'notifications@fizgo.ai',
              to: user.email!,
              subject: notification.title,
              html: `
                <div>
                  <h1>${notification.title}</h1>
                  <p>${notification.body}</p>
                </div>
              `
            })
          } catch (error) {
            console.error('Error sending email:', error)
          }
        }
      }

      // Mark notification as sent
      return ctx.db.notifications.update({
        where: { id: input.id },
        data: { sent: true }
      })
    })
})
