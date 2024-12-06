// src/server/emails/delivery-partner-application.tsx
import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components'

interface DeliveryPartnerApplicationEmailProps {
  fullName: string
  applicationNumber: string
  status: string
  submittedAt: Date
}

export const DeliveryPartnerApplicationEmail: React.FC<
  DeliveryPartnerApplicationEmailProps
> = ({ fullName, applicationNumber, status, submittedAt }) => {
  return (
    <Html>
      <Head />
      <Preview>Delivery Partner Application Confirmation - {fullName}</Preview>
      <Body
        style={{
          fontFamily: 'system-ui',
          margin: '0',
          padding: '0',
          backgroundColor: '#f6f9fc'
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '40px auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '40px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Heading
            style={{
              fontSize: '24px',
              color: '#333',
              marginBottom: '24px',
              textAlign: 'center'
            }}
          >
            Delivery Partner Application Received
          </Heading>

          <Section style={{ marginBottom: '24px' }}>
            <Text
              style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}
            >
              Thank you for applying to become a delivery partner.
            </Text>

            <Text
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#333',
                marginTop: '20px'
              }}
            >
              Application Details:
            </Text>

            <Text
              style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}
            >
              • Full Name: {fullName}
            </Text>
            <Text
              style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}
            >
              • Application Number: {applicationNumber}
            </Text>
            <Text
              style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}
            >
              • Status: {status}
            </Text>
            <Text
              style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}
            >
              • Submitted: {submittedAt.toLocaleDateString()}
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '4px',
              marginTop: '24px'
            }}
          >
            <Text
              style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}
            >
              Our team will review your application and contact you shortly. You
              can track your application status using your application number.
            </Text>

            <Text
              style={{
                fontSize: '16px',
                lineHeight: '24px',
                color: '#555',
                marginTop: '16px'
              }}
            >
              If you have any questions, please don't hesitate to contact our
              support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
