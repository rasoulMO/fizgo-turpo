'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { columns } from './components/columns'
import { DataTable } from './components/data-table'

type NotificationType = 'PUSH' | 'EMAIL' | 'BOTH'

export default function NotificationsPage() {
  const router = useRouter()
  const [type, setType] = useState<NotificationType>('PUSH')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const utils = api.useUtils()

  const { data: notifications = [] } = api.notification.getAll.useQuery()
  const { data: users = [] } = api.user.getAll.useQuery()
  const { mutate: createNotification } = api.notification.create.useMutation({
    onSuccess: () => {
      utils.notification.getAll.invalidate()
    },
    onMutate: async (newNotification) => {
      await utils.notification.getAll.cancel()
      const prevData = utils.notification.getAll.getData()

      utils.notification.getAll.setData(undefined, (old = []) => [
        {
          id: 'temp-' + Date.now(),
          title: newNotification.title,
          body: newNotification.body,
          type: newNotification.type,
          target_users: newNotification.target_users ?? [],
          sent: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        ...old
      ])

      return { prevData }
    },
    onError: (err, newNotification, context) => {
      utils.notification.getAll.setData(undefined, context?.prevData)
    }
  })

  const userOptions = React.useMemo(() => {
    return (users ?? []).map((user) => ({
      value: user.id,
      label: user.email || user.full_name || user.id
    }))
  }, [users])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const body = formData.get('body') as string

    createNotification({
      title,
      body,
      type,
      target_users: selectedUsers
    })

    e.currentTarget.reset()
    setSelectedUsers([])
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
            <CardDescription>
              Send notifications to users via push notifications and/or email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Notification Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) =>
                      setType(value as NotificationType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUSH">Push Only</SelectItem>
                      <SelectItem value="EMAIL">Email Only</SelectItem>
                      <SelectItem value="BOTH">Push & Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Target Users</Label>
                  <MultiSelect
                    options={userOptions}
                    selected={selectedUsers}
                    onChange={setSelectedUsers}
                    placeholder="Select users (leave empty for all users)"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Notification title"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    name="body"
                    placeholder="Enter your notification message"
                    required
                  />
                </div>

                <Button type="submit">Send Notification</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification History</CardTitle>
            <CardDescription>
              View all sent and pending notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={notifications} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
