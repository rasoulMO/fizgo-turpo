// src/server/emails/application-status-change.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface StatusChangeEmailProps {
  businessName: string;
  applicationNumber: string;
  newStatus: string;
  rejectionReason?: string;
  notes?: string[];
}

export const PartnerApplicationStatusChangeEmail: React.FC<
  StatusChangeEmailProps
> = ({
  businessName,
  applicationNumber,
  newStatus,
  rejectionReason,
  notes,
}) => {
  const getStatusMessage = () => {
    switch (newStatus) {
      case "APPROVED":
        return "Congratulations! Your application has been approved. 🎉";
      case "REJECTED":
        return "We regret to inform you that your application has been rejected. 😔";
      case "UNDER_REVIEW":
        return "Your application is currently under review.";
      default:
        return `Your application status has been updated to ${newStatus}.`;
    }
  };

  const getStatusColor = () => {
    switch (newStatus) {
      case "APPROVED":
        return "#22c55e"; // green
      case "REJECTED":
        return "#ef4444"; // red
      case "UNDER_REVIEW":
        return "#f59e0b"; // amber
      default:
        return "#3b82f6"; // blue
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Application Status Update - {businessName}</Preview>
      <Body
        style={{
          fontFamily: "system-ui",
          margin: "0",
          padding: "0",
          backgroundColor: "#f6f9fc",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "40px auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "40px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Heading
            style={{
              fontSize: "24px",
              color: "#333",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            Application Status Update
          </Heading>

          <Section style={{ marginBottom: "24px" }}>
            <Text
              style={{ fontSize: "16px", lineHeight: "24px", color: "#555" }}
            >
              {getStatusMessage()}
            </Text>

            <Text
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#333",
                marginTop: "20px",
              }}
            >
              Application Details:
            </Text>

            <Text
              style={{ fontSize: "16px", lineHeight: "24px", color: "#555" }}
            >
              • Business Name: {businessName}
            </Text>
            <Text
              style={{ fontSize: "16px", lineHeight: "24px", color: "#555" }}
            >
              • Application Number: {applicationNumber}
            </Text>
            <Text
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                color: getStatusColor(),
                fontWeight: "bold",
              }}
            >
              • New Status: {newStatus}
            </Text>
          </Section>

          {rejectionReason && (
            <Section
              style={{
                backgroundColor: "#fee2e2",
                padding: "20px",
                borderRadius: "4px",
                marginTop: "24px",
              }}
            >
              <Text
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#991b1b",
                }}
              >
                Reason for Rejection: {rejectionReason}
              </Text>
            </Section>
          )}

          {notes && notes.length > 0 && (
            <Section
              style={{
                backgroundColor: "#f8fafc",
                padding: "20px",
                borderRadius: "4px",
                marginTop: "24px",
              }}
            >
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Additional Notes:
              </Text>
              {notes.map((note, index) => (
                <Text
                  key={index}
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#555",
                  }}
                >
                  • {note}
                </Text>
              ))}
            </Section>
          )}

          <Section
            style={{
              backgroundColor: "#f8fafc",
              padding: "20px",
              borderRadius: "4px",
              marginTop: "24px",
            }}
          >
            <Text
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                color: "#555",
                marginTop: "16px",
              }}
            >
              If you have any questions, please don't hesitate to contact our
              support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
