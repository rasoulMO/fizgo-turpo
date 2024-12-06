// src/server/emails/delivery-partner-status-change.tsx
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

interface DeliveryStatusChangeEmailProps {
  fullName: string
  applicationNumber: string
  newStatus: string
  rejectionReason?: string
  notes?: string[]
}

export const DeliveryPartnerStatusChangeEmail: React.FC<
  DeliveryStatusChangeEmailProps
> = ({ fullName, applicationNumber, newStatus, rejectionReason, notes }) => {
  const getStatusMessage = () => {
    switch (newStatus) {
      case 'APPROVED':
        return 'Congratulations! You have been approved as a delivery partner. 🎉'
      case 'REJECTED':
        return 'We regret to inform you that your delivery partner application has been rejected. 😔'
      case 'UNDER_REVIEW':
        return 'Your application is currently under review by our team.'
      default:
        return `Your application status has been updated to ${newStatus}.`
    }
  }

  const getStatusColor = () => {
    switch (newStatus) {
      case 'APPROVED':
        return '#22c55e' // green
      case 'REJECTED':
        return '#ef4444' // red
      case 'UNDER_REVIEW':
        return '#f59e0b' // amber
      default:
        return '#3b82f6' // blue
    }
  }

  return (
    <Html>
      <Head />
      <Preview>Delivery Partner Application Status Update - {fullName}</Preview>
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
            Application Status Update
          </Heading>

          <Section style={{ marginBottom: '24px' }}>
            <Text
              style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}
            >
              {getStatusMessage()}
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
              style={{
                fontSize: '16px',
                lineHeight: '24px',
                color: getStatusColor(),
                fontWeight: 'bold'
              }}
            >
              • New Status: {newStatus}
            </Text>
          </Section>

          {rejectionReason && (
            <Section
              style={{
                backgroundColor: '#fee2e2',
                padding: '20px',
                borderRadius: '4px',
                marginTop: '24px'
              }}
            >
              <Text
                style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#991b1b'
                }}
              >
                Reason for Rejection: {rejectionReason}
              </Text>
            </Section>
          )}

          {notes && notes.length > 0 && (
            <Section
              style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '4px',
                marginTop: '24px'
              }}
            >
              <Text
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                Additional Notes:
              </Text>
              {notes.map((note, index) => (
                <Text
                  key={index}
                  style={{
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#555'
                  }}
                >
                  • {note}
                </Text>
              ))}
            </Section>
          )}

          {newStatus === 'APPROVED' && (
            <Section
              style={{
                backgroundColor: '#dcfce7',
                padding: '20px',
                borderRadius: '4px',
                marginTop: '24px'
              }}
            >
              <Text
                style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#166534'
                }}
              >
                Next Steps: Our team will contact you shortly with information
                about onboarding and getting started as a delivery partner.
              </Text>
            </Section>
          )}

          <Section
            style={{
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '4px',
              marginTop: '24px'
            }}
          >
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
