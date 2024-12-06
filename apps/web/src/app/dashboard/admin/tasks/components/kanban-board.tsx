'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { TaskStatus } from '@prisma/client'
import { format } from 'date-fns'

import { cn } from '@/utils/cn'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

import { Task } from '../data/schema'

const columns = {
  [TaskStatus.TODO]: { name: 'To Do' },
  [TaskStatus.IN_PROGRESS]: { name: 'In Progress' },
  [TaskStatus.BLOCKED]: { name: 'Blocked' },
  [TaskStatus.COMPLETED]: { name: 'Completed' },
  [TaskStatus.CANCELLED]: { name: 'Cancelled' }
}

interface KanbanBoardProps {
  tasks: Task[]
}

export default function KanbanBoard({ tasks: initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const updateTask = api.task.update.useMutation()
  const router = useRouter()

  const onDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return

      const { source, destination, draggableId } = result

      if (source.droppableId === destination.droppableId) {
        // Reorder within the same column
        const newTasks = Array.from(tasks)
        const [removed] = newTasks.splice(source.index, 1)
        if (!removed) return
        newTasks.splice(destination.index, 0, removed)
        setTasks(newTasks)
      } else {
        // Move to different column (status change)
        const task = tasks.find((t) => t.id === draggableId)
        if (!task) return

        const newStatus = destination.droppableId as TaskStatus
        updateTask.mutate({
          taskId: task.id,
          status: newStatus
        })

        const newTasks = tasks.map((t) =>
          t.id === draggableId ? { ...t, status: newStatus } : t
        )
        setTasks(newTasks)
      }
    },
    [tasks, updateTask]
  )

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-[calc(100vh-300px)] gap-6 overflow-x-auto pb-6">
        {Object.entries(columns).map(([status, column]) => (
          <div
            key={status}
            className="flex h-full w-[350px] min-w-[350px] flex-col rounded-lg border bg-muted/30"
          >
            <div className="flex items-center justify-between border-b bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">{column.name}</h3>
                <Badge variant="secondary" className="rounded-sm">
                  {getTasksByStatus(status).length}
                </Badge>
              </div>
            </div>

            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    'flex-1 overflow-y-auto p-4',
                    snapshot.isDraggingOver && 'bg-muted/50'
                  )}
                >
                  <div className="space-y-3">
                    {getTasksByStatus(status).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              'border-none bg-background shadow-none transition-all hover:shadow-md',
                              snapshot.isDragging && 'rotate-2 shadow-lg'
                            )}
                            onClick={() =>
                              router.push(`/dashboard/admin/tasks/${task.id}`)
                            }
                          >
                            <div className="space-y-4 p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant={
                                      task.priority === 'HIGH' ||
                                      task.priority === 'URGENT'
                                        ? 'destructive'
                                        : task.priority === 'MEDIUM'
                                          ? 'default'
                                          : 'secondary'
                                    }
                                    className="rounded-sm"
                                  >
                                    {task.priority}
                                  </Badge>
                                  {task.assignee && (
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={task.assignee.avatar_url || ''}
                                        alt={task.assignee.full_name || ''}
                                      />
                                      <AvatarFallback>
                                        {task.assignee.full_name?.[0] || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                                <h4 className="line-clamp-2 text-sm font-medium">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="line-clamp-2 text-xs text-muted-foreground">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="max-w-[180px] truncate rounded-sm text-xs"
                                >
                                  {task.label}
                                </Badge>
                                {task.due_date && (
                                  <Badge
                                    variant="secondary"
                                    className="rounded-sm text-xs"
                                  >
                                    Due{' '}
                                    {format(new Date(task.due_date), 'MMM d')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
