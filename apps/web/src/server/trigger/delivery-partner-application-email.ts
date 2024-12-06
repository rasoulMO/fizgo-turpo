// src/server/trigger/delivery-partner-application-email.ts
import { DeliveryPartnerApplicationEmail } from '@/server/emails/delivery-partner-application'
import { task } from '@trigger.dev/sdk/v3'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailPayload {
  fullName: string
  email: string
  applicationNumber: string
  status: string
  submittedAt: Date
}

export const sendDeliveryPartnerApplicationEmail = task({
  id: 'send-delivery-partner-application-email',
  run: async (payload: EmailPayload) => {
    console.log(
      'Sending delivery partner application confirmation email',
      payload
    )

    const emailHtml = DeliveryPartnerApplicationEmail({
      fullName: payload.fullName,
      applicationNumber: payload.applicationNumber,
      status: payload.status,
      submittedAt: payload.submittedAt
    })

    return await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@fizgo.ai',
      to: payload.email,
      subject: `Delivery Partner Application Confirmation - ${payload.fullName}`,
      react: emailHtml
    })
  },
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2
  },
  onSuccess: async (payload, output, { ctx }) => {
    console.log(`Email sent successfully to ${payload.email}`)
  },
  onFailure: async (payload, error, { ctx }) => {
    console.error(`Failed to send email to ${payload.email}:`, error)
  }
})
