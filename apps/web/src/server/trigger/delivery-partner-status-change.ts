// src/server/trigger/delivery-partner-status-change.ts
import { DeliveryPartnerStatusChangeEmail } from '@/server/emails/delivery-partner-status-change'
import { task } from '@trigger.dev/sdk/v3'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface StatusChangePayload {
  fullName: string
  email: string
  applicationNumber: string
  newStatus: string
  rejectionReason?: string
  notes?: string[]
}

export const sendDeliveryStatusChangeEmail = task({
  id: 'send-delivery-status-change-email',
  run: async (payload: StatusChangePayload) => {
    console.log('Sending delivery partner status change email', payload)

    const emailComponent = DeliveryPartnerStatusChangeEmail({
      fullName: payload.fullName,
      applicationNumber: payload.applicationNumber,
      newStatus: payload.newStatus,
      rejectionReason: payload.rejectionReason,
      notes: payload.notes
    })

    return await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@fizgo.ai',
      to: payload.email,
      subject: `Delivery Partner Application Status Update - ${payload.fullName}`,
      react: emailComponent
    })
  },
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2
  },
  onSuccess: async (payload, output, { ctx }) => {
    console.log(`Status change email sent successfully to ${payload.email}`)
  },
  onFailure: async (payload, error, { ctx }) => {
    console.error(
      `Failed to send status change email to ${payload.email}:`,
      error
    )
  }
})
