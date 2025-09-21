import nodemailer from "nodemailer";
import { absoluteUrl } from "@/lib/utils";

function createTransport() {
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    secure: Number(process.env.EMAIL_SERVER_PORT ?? 587) === 465,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const transport = createTransport();
  const verificationUrl = absoluteUrl(`/verify/${token}`);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1c86ff;">Confirm your email</h2>
      <p>Thanks for creating a Resume Tailor account. Confirm your email to activate your dashboard.</p>
      <p><a href="${verificationUrl}" style="display: inline-block; padding: 10px 18px; background: #1c86ff; color: #ffffff; border-radius: 6px; text-decoration: none;">Verify email</a></p>
      <p style="font-size: 12px; color: #64748b;">This link will expire in 24 hours.</p>
    </div>
  `;

  if (!transport) {
    console.warn("[email] Transport not configured. Verification link:", verificationUrl);
    return;
  }

  await transport.sendMail({
    to,
    from: process.env.EMAIL_FROM ?? "no-reply@resume-tailor.ai",
    subject: "Verify your Resume Tailor email",
    html,
  });
}
