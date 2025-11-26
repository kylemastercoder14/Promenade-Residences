import nodemailer from "nodemailer";

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  const userCredential = process.env.SMTP_EMAIL!;
  const passCredential = process.env.SMTP_PASSWORD!;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userCredential,
      pass: passCredential,
    },
  });

  try {
    await transporter.sendMail({
      from: userCredential,
      to,
      subject,
      text,
      html,
    });

    return { success: "Email has been sent." };
  } catch (error) {
    console.error("Error sending notification", error);
    return { message: "An error occurred. Please try again." };
  }
}
