// /server/trigger/order-confirmation-email.ts
import { OrderConfirmationEmail } from '@/server/emails/order-confirmation'
import { task } from '@trigger.dev/sdk/v3'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderEmailPayload {
  orderId: string
  customerEmail: string
  customerName: string
  orderNumber: string
  orderDate: Date
  deliveryAddress: {
    fullName: string
    addressLine1: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  subtotal: number
  deliveryFee: number
  total: number
}

export const sendOrderConfirmationEmail = task({
  id: 'send-order-confirmation-email',
  run: async (payload: OrderEmailPayload) => {
    console.log('Sending order confirmation email', payload)

    const emailHtml = OrderConfirmationEmail({
      customerName: payload.customerName,
      orderNumber: payload.orderNumber,
      orderDate: payload.orderDate,
      deliveryAddress: payload.deliveryAddress,
      items: payload.items,
      subtotal: payload.subtotal,
      deliveryFee: payload.deliveryFee,
      total: payload.total
    })

    return await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@fizgo.ai',
      to: payload.customerEmail,
      subject: `Order Confirmation - #${payload.orderNumber}`,
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
    console.log(
      `Order confirmation email sent successfully to ${payload.customerEmail}`
    )
  },
  onFailure: async (payload, error, { ctx }) => {
    console.error(
      `Failed to send order confirmation email to ${payload.customerEmail}:`,
      error
    )
  }
})
