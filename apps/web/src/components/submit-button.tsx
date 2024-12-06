'use client'

import { type ComponentProps } from 'react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'

type ServerAction = (formData: FormData) => Promise<void | { error: string }>

type Props = Omit<ComponentProps<typeof Button>, 'formAction'> & {
  pendingText?: string
  formAction: ServerAction
}

export function SubmitButton({
  children,
  pendingText = 'Submitting...',
  formAction,
  ...props
}: Props) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      formAction={formAction as unknown as string}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  )
}
