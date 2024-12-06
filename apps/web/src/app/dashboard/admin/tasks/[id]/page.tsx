import { notFound } from 'next/navigation'
import { api } from '@/trpc/server'
import { format } from 'date-fns'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { labels, priorities, statuses } from '../data/task-data'
import { TaskHistory } from './components/task-history'
import { UpdateTaskForm } from './components/update-task-form'

interface TaskPageProps {
  params: {
    id: string
  }
}

export default async function TaskPage({ params }: TaskPageProps) {
  const task = await api.task.getById({ taskId: params.id }).catch(() => null)

  if (!task) {
    notFound()
  }

  const status = statuses.find((s) => s.value === task.status)
  const priority = priorities.find((p) => p.value === task.priority)
  const label = labels.find((l) => l.value === task.label)

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{task.title}</h2>
          <p className="text-muted-foreground">Task Details and History</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Delete</Button>
          <Button>Edit Task</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Description
                </h4>
                <p className="text-sm">
                  {task.description || 'No description provided'}
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Status and Priority
                </h4>
                <div className="flex gap-2">
                  {status && (
                    <Badge
                      variant={
                        status.value === 'COMPLETED'
                          ? 'success'
                          : status.value === 'BLOCKED'
                            ? 'destructive'
                            : status.value === 'IN_PROGRESS'
                              ? 'default'
                              : 'secondary'
                      }
                    >
                      {status.label}
                    </Badge>
                  )}
                  {priority && (
                    <Badge
                      variant={
                        priority.value === 'URGENT'
                          ? 'destructive'
                          : priority.value === 'HIGH'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {priority.label}
                    </Badge>
                  )}
                  {label && <Badge variant="outline">{label.label}</Badge>}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Assignee
                </h4>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={task.assignee.avatar_url || ''}
                        alt={task.assignee.full_name || ''}
                      />
                      <AvatarFallback>
                        {task.assignee.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assignee.full_name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No assignee
                  </span>
                )}
              </div>

              {task.due_date && (
                <div>
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                    Due Date
                  </h4>
                  <p className="text-sm">
                    {format(new Date(task.due_date), 'PPP')}
                  </p>
                </div>
              )}

              {(task.order || task.shop) && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">Related Items</h4>
                    {task.order && (
                      <div>
                        <h5 className="mb-1 text-sm font-medium text-muted-foreground">
                          Related Order
                        </h5>
                        <p className="text-sm">
                          Order #{task.order.id} - {task.order.status}
                        </p>
                      </div>
                    )}
                    {task.shop && (
                      <div>
                        <h5 className="mb-1 text-sm font-medium text-muted-foreground">
                          Related Shop
                        </h5>
                        <p className="text-sm">{task.shop.name}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskHistory taskId={task.id} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Update Task</CardTitle>
            </CardHeader>
            <CardContent>
              <UpdateTaskForm task={task} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
