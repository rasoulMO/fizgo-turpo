// src/server/trigger/application-status-change.ts
import { PartnerApplicationStatusChangeEmail } from '@/server/emails/partner-application-status-change'
import { task } from '@trigger.dev/sdk/v3'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface StatusChangePayload {
  businessName: string
  businessEmail: string
  applicationNumber: string
  newStatus: string
  rejectionReason?: string
  notes?: string[]
}

export const sendStatusChangeEmail = task({
  id: 'send-status-change-email',
  run: async (payload: StatusChangePayload) => {
    console.log('Sending status change email', payload)

    const emailComponent = PartnerApplicationStatusChangeEmail({
      businessName: payload.businessName,
      applicationNumber: payload.applicationNumber,
      newStatus: payload.newStatus,
      rejectionReason: payload.rejectionReason,
      notes: payload.notes
    })

    return await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@fizgo.ai',
      to: payload.businessEmail,
      subject: `Application Status Update - ${payload.businessName}`,
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
    console.log(
      `Status change email sent successfully to ${payload.businessEmail}`
    )
  },
  onFailure: async (payload, error, { ctx }) => {
    console.error(
      `Failed to send status change email to ${payload.businessEmail}:`,
      error
    )
  }
})
