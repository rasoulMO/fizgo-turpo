import { Metadata } from 'next'
import { api } from '@/trpc/server'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import CreateTaskDialog from './components/create-task-dialog'
import KanbanBoard from './components/kanban-board'
import RealtimeTasks from './components/realtime-tasks'

export const metadata: Metadata = {
  title: 'Task Management',
  description: 'Comprehensive task and issue management system.'
}

export default async function TaskPage() {
  const tasks = await api.task.getAll()

  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Task Management</h2>
          <p className="text-muted-foreground">
            Manage and track all tasks across the platform
          </p>
        </div>
        <CreateTaskDialog>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </CreateTaskDialog>
      </div>

      <Tabs defaultValue="backlog" className="w-full">
        <TabsList>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
        </TabsList>
        <TabsContent value="backlog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Backlog</CardTitle>
            </CardHeader>
            <CardContent>
              <RealtimeTasks tasks={tasks} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="board">
          <Card>
            <CardHeader>
              <CardTitle>Kanban Board</CardTitle>
            </CardHeader>
            <CardContent>
              <KanbanBoard tasks={tasks} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
