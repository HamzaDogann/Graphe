import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  resetLink: string;
  userEmail?: string;
}

export const ResetPasswordEmail = ({
  resetLink,
  userEmail,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Graphe - Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo Kısmı (URL'i kendi domainine göre güncellemelisin) */}
          <Section style={logoContainer}>
            {/* Eğer logon online bir yerdeyse buraya URL'ini koy */}
            {/* <Img
              src="https://graphe.app/logo.png"
              width="42"
              height="42"
              alt="Graphe"
            /> */}
            <Heading style={logoText}>Graphe</Heading>
          </Section>

          <Heading style={h1}>Reset your password</Heading>

          <Text style={text}>Hello,</Text>

          <Text style={text}>
            Someone requested a password reset for your account associated with{" "}
            <span style={{ fontWeight: "bold" }}>{userEmail}</span>. If this was
            you, click the button below to set a new password.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Reset Password
            </Button>
          </Section>

          <Text style={text}>
            If you didn't request this, you can safely ignore this email. Your
            password will remain unchanged.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Graphe AI Chart Generator <br />
            Istanbul, Turkey
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

// --- STYLES (Inline CSS) ---
// E-postalar için CSS class yerine JS objeleri kullanıyoruz

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  marginBottom: "64px",
  borderRadius: "12px",
  maxWidth: "600px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
};

const logoContainer = {
  marginBottom: "24px",
  textAlign: "center" as const,
};

const logoText = {
  color: "#5C85FF",
  fontSize: "24px",
  fontWeight: "400",
  textAlign: "center" as const,
  margin: "0",
};

const h1 = {
  color: "#323039",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  marginBottom: "20px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#5C85FF", // Senin ana rengin
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 34px",
  boxShadow: "0 4px 12px rgba(92, 133, 255, 0.3)",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};
