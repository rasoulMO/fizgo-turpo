// src/server/emails/partner-application.tsx
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

interface PartnerApplicationEmailProps {
  businessName: string;
  applicationNumber: string;
  status: string;
  submittedAt: Date;
}

export const PartnerApplicationEmail: React.FC<
  PartnerApplicationEmailProps
> = ({ businessName, applicationNumber, status, submittedAt }) => {
  return (
    <Html>
      <Head />
      <Preview>Partner Application Confirmation - {businessName}</Preview>
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
            Partner Application Received
          </Heading>

          <Section style={{ marginBottom: "24px" }}>
            <Text
              style={{ fontSize: "16px", lineHeight: "24px", color: "#555" }}
            >
              Thank you for submitting your partner application.
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
              style={{ fontSize: "16px", lineHeight: "24px", color: "#555" }}
            >
              • Status: {status}
            </Text>
            <Text
              style={{ fontSize: "16px", lineHeight: "24px", color: "#555" }}
            >
              • Submitted: {submittedAt.toLocaleDateString()}
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: "#f8fafc",
              padding: "20px",
              borderRadius: "4px",
              marginTop: "24px",
            }}
          >
            <Text
              style={{ fontSize: "16px", lineHeight: "24px", color: "#555" }}
            >
              We will review your application and get back to you shortly. You
              can check your application status using your application number.
            </Text>

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
