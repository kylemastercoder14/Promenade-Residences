import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  render,
  Section,
  Text,
} from '@react-email/components';

interface ForgotPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

export const ForgotPasswordEmail = ({
  userFirstname,
  resetPasswordLink,
}: ForgotPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Preview>Reset your password</Preview>
        <Container style={styles.container}>
          <Img
            src={`https://utqpspeicywesqihyelg.supabase.co/storage/v1/object/public/assets/logo.png`}
            width="60"
            height="60"
            alt="Company Logo"
            style={styles.logo}
          />
          <Section>
            <Text style={styles.text}>
              Hi {userFirstname},
            </Text>
            <Text style={styles.text}>
              Someone recently requested a password reset for your account.
              If this was you, you can set a new password by clicking the button below:
            </Text>
            <Button
              style={styles.button}
              href={resetPasswordLink}
            >
              Reset password
            </Button>
            <Text style={styles.text}>
              If you don&apos;t want to change your password or didn&apos;t
              request this, just ignore and delete this message.
            </Text>
            <Text style={styles.text}>
              To keep your account secure, please don&apos;t forward this
              email to anyone. See our Help Center for{' '}
              <Link style={styles.link} href="https://support.promenade-residences.com/security-tips">
                more security tips.
              </Link>
            </Text>
            <Text style={styles.text}>
              Best regards,
              <br />
              Promenade Residences Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const ForgotPasswordEmailHTML = (props: ForgotPasswordEmailProps) =>
  render(<ForgotPasswordEmail {...props} />, {
    pretty: true,
  });

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    padding: '10px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
    padding: '45px',
    margin: '0 auto',
    maxWidth: '600px',
  },
  logo: {
    marginBottom: '20px',
  },
  text: {
    fontSize: '16px',
    fontWeight: '300',
    color: '#404040',
    lineHeight: '26px',
    margin: '16px 0',
  },
  button: {
    backgroundColor: '#327248',
    borderRadius: '5px',
    color: '#ffffff',
    fontSize: '15px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '210px',
    padding: '14px 7px',
    margin: '24px 0',
  },
  link: {
    color: '#327248',
    textDecoration: 'underline',
  },
};

ForgotPasswordEmail.PreviewProps = {
  userFirstname: 'Alan',
  resetPasswordLink: 'https://example.com/reset-password',
} as ForgotPasswordEmailProps;

export default ForgotPasswordEmail;
