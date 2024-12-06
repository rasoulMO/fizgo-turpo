// /server/emails/order-confirmation.tsx
import * as React from 'react'
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text
} from '@react-email/components'

interface OrderConfirmationEmailProps {
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

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  customerName,
  orderNumber,
  orderDate,
  deliveryAddress,
  items,
  subtotal,
  deliveryFee,
  total
}) => {
  return (
    <Html>
      <Head />
      <Preview>Order Confirmation - #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmation</Heading>

          <Text style={text}>Dear {customerName},</Text>

          <Text style={text}>
            Thank you for your order! We're excited to confirm that your order
            has been received and is being processed.
          </Text>

          <Section style={orderDetails}>
            <Heading as="h2" style={h2}>
              Order Details
            </Heading>
            <Text style={text}>
              Order Number: #{orderNumber}
              <br />
              Order Date: {orderDate.toLocaleDateString()}
              <br />
            </Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              Delivery Address
            </Heading>
            <Text style={text}>
              {deliveryAddress.fullName}
              <br />
              {deliveryAddress.addressLine1}
              <br />
              {/* {deliveryAddress.addressLine2 &&
                `${deliveryAddress.addressLine2}<br />`} */}
              {deliveryAddress.city}, {deliveryAddress.state}{' '}
              {deliveryAddress.postalCode}
              <br />
              {deliveryAddress.country}
            </Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              Order Summary
            </Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column>
                  <Text style={itemText}>
                    {item.name} x {item.quantity}
                  </Text>
                </Column>
                <Column>
                  <Text style={itemPrice}>${item.subtotal.toFixed(2)}</Text>
                </Column>
              </Row>
            ))}

            <Row style={totalRow}>
              <Column>
                <Text style={text}>Subtotal</Text>
                <Text style={text}>Delivery Fee</Text>
                <Text style={totalText}>Total</Text>
              </Column>
              <Column>
                <Text style={text}>${subtotal.toFixed(2)}</Text>
                <Text style={text}>${deliveryFee.toFixed(2)}</Text>
                <Text style={totalText}>${total.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          <Text style={footer}>
            If you have any questions about your order, please contact our
            customer support team. We'll notify you when your order is out for
            delivery.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px'
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const
}

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '20px 0'
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0'
}

const section = {
  padding: '24px',
  border: '1px solid #dedede',
  borderRadius: '5px',
  margin: '20px 0'
}

const orderDetails = {
  ...section,
  backgroundColor: '#f7f7f7'
}

const itemRow = {
  margin: '8px 0'
}

const itemText = {
  ...text,
  margin: '0'
}

const itemPrice = {
  ...text,
  margin: '0',
  textAlign: 'right' as const
}

const totalRow = {
  margin: '24px 0 0',
  borderTop: '2px solid #dedede',
  paddingTop: '16px'
}

const totalText = {
  ...text,
  fontWeight: 'bold'
}

const footer = {
  ...text,
  color: '#666',
  fontSize: '14px',
  textAlign: 'center' as const
}
