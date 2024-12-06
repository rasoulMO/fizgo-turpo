'use client'

import { useEffect, useState } from 'react'
import { api } from '@/trpc/react'
import { TaskPriority, TaskStatus } from '@prisma/client'
import { format } from 'date-fns'

import { Badge } from '@/components/ui/badge'

import { priorities, statuses } from '../../components/columns'

interface TaskHistoryProps {
  taskId: string
}

export function TaskHistory({ taskId }: TaskHistoryProps) {
  const { data: task } = api.task.getById.useQuery(
    { taskId },
    {
      refetchInterval: 5000 // Refetch every 5 seconds
    }
  )

  const getStatusBadge = (status: TaskStatus) => {
    const statusInfo = statuses.find((s) => s.value === status)
    if (!statusInfo) return null

    return (
      <Badge
        variant={
          status === 'COMPLETED'
            ? 'success'
            : status === 'BLOCKED'
              ? 'destructive'
              : status === 'IN_PROGRESS'
                ? 'default'
                : 'secondary'
        }
      >
        {statusInfo.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: TaskPriority) => {
    const priorityInfo = priorities.find((p) => p.value === priority)
    if (!priorityInfo) return null

    return (
      <Badge
        variant={
          priority === 'URGENT'
            ? 'destructive'
            : priority === 'HIGH'
              ? 'default'
              : 'secondary'
        }
      >
        {priorityInfo.label}
      </Badge>
    )
  }

  if (!task?.history) {
    return <p className="text-sm text-muted-foreground">Loading history...</p>
  }

  return (
    <div className="space-y-4">
      {task.history.map((item) => (
        <div key={item.id} className="flex gap-4">
          <div className="relative flex-none">
            <div className="absolute left-2 top-2 h-full w-px bg-muted-foreground/20" />
            <div className="relative z-10 h-4 w-4 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="flex-1 pb-4">
            <div className="mb-1">
              <span className="font-medium">
                {item.changer.full_name || 'Unknown'}
              </span>{' '}
              <span className="text-sm text-muted-foreground">
                {format(new Date(item.changed_at), 'PPp')}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              {item.status_from && item.status_to && (
                <div>
                  Changed status from {getStatusBadge(item.status_from)} to{' '}
                  {getStatusBadge(item.status_to)}
                </div>
              )}

              {item.priority_from && item.priority_to && (
                <div>
                  Changed priority from {getPriorityBadge(item.priority_from)}{' '}
                  to {getPriorityBadge(item.priority_to)}
                </div>
              )}

              {item.assigned_from || item.assigned_to ? (
                <div>
                  {item.assigned_from ? (
                    <>
                      Reassigned from{' '}
                      <span className="font-medium">
                        {item.old_assignee?.full_name}
                      </span>{' '}
                      to{' '}
                    </>
                  ) : (
                    'Assigned to '
                  )}
                  {item.assigned_to ? (
                    <span className="font-medium">
                      {item.new_assignee?.full_name}
                    </span>
                  ) : (
                    'no one'
                  )}
                </div>
              ) : null}

              {item.notes && (
                <div className="text-muted-foreground">{item.notes}</div>
              )}
            </div>
          </div>
        </div>
      ))}

      {task.history.length === 0 && (
        <p className="text-sm text-muted-foreground">No history available</p>
      )}
    </div>
  )
}
