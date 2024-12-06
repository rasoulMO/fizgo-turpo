// src/server/emails/offer-notification.tsx
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

interface OfferEmailProps {
  recipientName: string
  senderName: string
  itemName: string
  offerAmount: number
  message?: string
  conversationUrl: string
}

export const OfferNotificationEmail: React.FC<OfferEmailProps> = ({
  recipientName,
  senderName,
  itemName,
  offerAmount,
  message,
  conversationUrl
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        New offer from {senderName} for {itemName}
      </Preview>
      <Body style={{ fontFamily: 'system-ui', backgroundColor: '#f6f9fc' }}>
        <Container
          style={{
            maxWidth: '600px',
            margin: '40px auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '40px'
          }}
        >
          <Heading
            style={{ fontSize: '24px', color: '#333', marginBottom: '24px' }}
          >
            New Offer Received
          </Heading>
          <Section style={{ marginBottom: '24px' }}>
            <Text
              style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}
            >
              Hi {recipientName},
            </Text>
            <Text
              style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}
            >
              {senderName} has made an offer on your item {itemName}.
            </Text>
            <Text
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333',
                margin: '16px 0'
              }}
            >
              Offer Amount: ${offerAmount}
            </Text>
            {message && (
              <Text
                style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#555',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '4px'
                }}
              >
                Message: "{message}"
              </Text>
            )}
          </Section>
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '16px', color: '#555' }}>
              <a
                href={conversationUrl}
                style={{ color: '#0070f3', textDecoration: 'none' }}
              >
                View and Respond to Offer
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
