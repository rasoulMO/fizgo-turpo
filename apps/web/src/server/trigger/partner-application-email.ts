// /server/trigger/partner-application-email.ts
import { PartnerApplicationEmail } from '@/server/emails/partner-application'
import { task } from '@trigger.dev/sdk/v3'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailPayload {
  businessName: string
  businessEmail: string
  applicationNumber: string
  status: string
  submittedAt: Date
}

export const sendPartnerApplicationEmail = task({
  id: 'send-partner-application-email',
  run: async (payload: EmailPayload) => {
    console.log('Sending partner application confirmation email', payload)

    const emailHtml = PartnerApplicationEmail({
      businessName: payload.businessName,
      applicationNumber: payload.applicationNumber,
      status: payload.status,
      submittedAt: payload.submittedAt
    })

    return await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@fizgo.ai',
      to: payload.businessEmail,
      subject: `Partner Application Confirmation - ${payload.businessName}`,
      react: emailHtml
    })
  },
  // Add retry configuration
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2
  },
  // Optional: Add lifecycle hooks
  onSuccess: async (payload, output, { ctx }) => {
    console.log(`Email sent successfully to ${payload.businessEmail}`)
  },
  onFailure: async (payload, error, { ctx }) => {
    console.error(`Failed to send email to ${payload.businessEmail}:`, error)
  }
})
