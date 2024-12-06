// src/server/emails/chat-notification.tsx
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

interface ChatMessageEmailProps {
  recipientName: string
  senderName: string
  itemName: string
  messagePreview: string
  conversationUrl: string
}

export const ChatMessageEmail: React.FC<ChatMessageEmailProps> = ({
  recipientName,
  senderName,
  itemName,
  messagePreview,
  conversationUrl
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        New message from {senderName} about {itemName}
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
            New Message Received
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
              You have received a new message from {senderName} regarding{' '}
              {itemName}.
            </Text>
            <Text
              style={{
                fontSize: '16px',
                lineHeight: '24px',
                color: '#555',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '4px',
                margin: '16px 0'
              }}
            >
              "{messagePreview}"
            </Text>
          </Section>
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '16px', color: '#555' }}>
              <a
                href={conversationUrl}
                style={{ color: '#0070f3', textDecoration: 'none' }}
              >
                View Conversation
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
