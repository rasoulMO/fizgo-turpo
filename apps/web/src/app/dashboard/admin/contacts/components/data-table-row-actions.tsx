'use client'

import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import ReactQuill from 'react-quill'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import 'react-quill/dist/quill.snow.css'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row
}: DataTableRowActionsProps<TData>) {
  const [value, setValue] = useState('')
  const contactSchema = z.object({
    created_at: z.string(),
    email: z.string().nullable(),
    full_name: z.string().nullable(),
    id: z.string(),
    phone_number: z.number().nullable()
  })
  const user = contactSchema.parse(row.original)

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem>
            <DialogTrigger asChild>
              <span>Send Email</span>
            </DialogTrigger>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="w-screen">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Sending email to {user.full_name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="w-full">
          <ReactQuill theme="snow" value={value} onChange={setValue} />
        </div>
        <DialogFooter>
          <Button onClick={() => console.log(value)}>Send Email</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
