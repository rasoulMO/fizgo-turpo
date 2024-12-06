'use client'

import { useState } from 'react'
import ReactQuill from 'react-quill'

import 'react-quill/dist/quill.snow.css'

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

type WriteEmailDialogProps = {
  created_at: string
  email: string | null
  full_name: string | null
  id: string
  phone_number: number | null
}
export default function WriteEmailDialog({
  user
}: {
  user: WriteEmailDialogProps
}) {
  const [value, setValue] = useState('')
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span>Send Email</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Sending email to {user.full_name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div>
          <ReactQuill theme="snow" value={value} onChange={setValue} />
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
