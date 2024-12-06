'use client'

// import React, { useState } from 'react'
import { z } from 'zod'

// import { createClient } from '@/utils/supabase/client'
import { DataTable } from '@/components/data-table'

import { taskSchema } from '../data/schema'
import { filterableColumns, searchableColumns, tasksColumns } from './columns'

type Task = z.infer<typeof taskSchema>

interface RealtimeTasksProps {
  tasks: Task[]
}

const RealtimeTasks = ({ tasks }: RealtimeTasksProps) => {
  // const supabase = createClient()
  // const [tasksData, setTasksData] = useState<Task[]>(tasks)

  // useEffect(() => {
  //   const subscription = supabase
  //     .channel('tasks')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'tasks'
  //       },
  //       (payload) => {
  //         if (payload.errors) {
  //           console.error('Subscription error:', payload.errors)
  //           return
  //         }

  //         const newTask = payload.new as Task
  //         setTasksData((prevTasks) => {
  //           switch (payload.eventType) {
  //             case 'INSERT':
  //               return [...prevTasks, newTask]
  //             case 'UPDATE':
  //               return prevTasks.map((task) =>
  //                 task.id === newTask.id ? newTask : task
  //               )
  //             case 'DELETE':
  //               const deletedTaskId = payload.old.id
  //               return prevTasks.filter((task) => task.id !== deletedTaskId)
  //             default:
  //               return prevTasks
  //           }
  //         })
  //       }
  //     )
  //     .subscribe()

  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [tasks])

  return (
    <div>
      <DataTable
        data={tasks}
        columns={tasksColumns}
        filterableColumns={filterableColumns}
        searchableColumns={searchableColumns}
      />
    </div>
  )
}

export default RealtimeTasks
