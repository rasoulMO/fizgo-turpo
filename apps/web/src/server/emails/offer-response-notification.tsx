// src/server/emails/offer-response-notification.tsx
import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components'

interface OfferResponseEmailProps {
  recipientName: string
  sellerName: string
  itemName: string
  offerAmount: number
  status: 'ACCEPTED' | 'REJECTED'
  conversationUrl: string
}

export const OfferResponseEmail: React.FC<OfferResponseEmailProps> = ({
  recipientName,
  sellerName,
  itemName,
  offerAmount,
  status,
  conversationUrl
}) => {
  const isAccepted = status === 'ACCEPTED'

  return (
    <Html>
      <Head />
      <Preview>
        Your offer for {itemName} has been {status.toLowerCase()}
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
            style={{
              fontSize: '24px',
              color: '#333',
              marginBottom: '24px',
              textAlign: 'center'
            }}
          >
            Offer {status.toLowerCase()}
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
              {sellerName} has {status.toLowerCase()} your offer for {itemName}.
            </Text>
            <Text
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: isAccepted ? '#16a34a' : '#333',
                margin: '16px 0',
                textAlign: 'center'
              }}
            >
              Offer Amount: ${offerAmount}
            </Text>
            {isAccepted && (
              <Text
                style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#555',
                  padding: '12px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '4px',
                  marginTop: '16px'
                }}
              >
                Great news! Please proceed with the payment to complete your
                purchase.
              </Text>
            )}
          </Section>
          <Section style={{ textAlign: 'center' }}>
            <Button
              href={conversationUrl}
              style={{
                backgroundColor: isAccepted ? '#16a34a' : '#4f46e5',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {isAccepted ? 'Complete Purchase' : 'View Details'}
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
