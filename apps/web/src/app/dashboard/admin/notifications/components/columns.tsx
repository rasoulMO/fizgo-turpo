'use client'

import { api } from '@/trpc/react'
import { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type Notification = {
  id: string
  title: string
  body: string
  type: 'PUSH' | 'EMAIL' | 'BOTH'
  sent: boolean
  target_users: string[]
  created_at: Date
}

export const columns: ColumnDef<Notification>[] = [
  {
    accessorKey: 'title',
    header: 'Title'
  },
  {
    accessorKey: 'body',
    header: 'Message'
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type
      return (
        <Badge variant="outline">
          {type === 'BOTH'
            ? 'Push & Email'
            : type === 'PUSH'
              ? 'Push Only'
              : 'Email Only'}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'target_users',
    header: 'Target',
    cell: ({ row }) => {
      const count = row.original.target_users.length
      return (
        <Badge variant="outline">
          {count === 0 ? 'All Users' : `${count} User${count === 1 ? '' : 's'}`}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'sent',
    header: 'Status',
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.sent ? 'success' : 'secondary'}>
          {row.original.sent ? 'Sent' : 'Pending'}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleString()
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const notification = row.original
      const utils = api.useUtils()
      const { mutate: sendNotification, isPending } =
        api.notification.send.useMutation({
          onSuccess: () => {
            utils.notification.getAll.invalidate()
          }
        })

      return (
        <Button
          variant="outline"
          size="sm"
          disabled={notification.sent || isPending}
          onClick={() => {
            if (!notification.sent) {
              sendNotification({ id: notification.id })
            }
          }}
        >
          {notification.sent ? 'Sent' : isPending ? 'Sending...' : 'Send Now'}
        </Button>
      )
    }
  }
]
