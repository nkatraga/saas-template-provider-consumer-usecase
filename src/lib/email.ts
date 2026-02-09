import nodemailer from "nodemailer";

// [Template:Integration] — SMTP email service with branded HTML templates. Exchange provider (SendGrid, Resend, etc.) as needed.

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "AppName <noreply@example.com>",
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

interface BrandingOptions {
  logoUrl?: string | null;
  accentColor?: string;
  footerText?: string | null;
}

export function buildBrandedEmail(
  branding: BrandingOptions,
  innerHtml: string
): string {
  const accent = branding.accentColor || "#e8913a";
  const footer = branding.footerText || "Sent by AppName";

  const logoBlock = branding.logoUrl
    ? `<div style="text-align: center; margin-bottom: 16px;">
        <img src="${branding.logoUrl}" alt="Business Logo" style="max-height: 60px; max-width: 200px;" />
      </div>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${accent}; height: 4px; border-radius: 4px 4px 0 0;"></div>
      <div style="padding: 24px 20px;">
        ${logoBlock}
        ${innerHtml}
      </div>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 0 20px;" />
      <div style="padding: 16px 20px;">
        <p style="color: #999; font-size: 12px; margin: 0;">${footer}</p>
      </div>
    </div>
  `;
}

export function buildInvoiceEmail(
  branding: BrandingOptions,
  data: {
    providerName: string;
    businessName: string;
    consumerName: string;
    bookings: { startTime: string | Date; endTime: string | Date; status: string }[];
    pricePerUnit: number;
    bookingDuration: number;
    totalBookings: number;
    totalAmount: number;
    timeZone?: string;
  }
): string {
  const tz = data.timeZone || "America/Chicago";
  const bookingRows = data.bookings
    .map((l) => {
      const start = new Date(l.startTime);
      const end = new Date(l.endTime);
      const dateStr = start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: tz,
      });
      const timeStr = `${start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: tz,
      })} - ${end.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: tz,
      })}`;
      return `<tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0;">${dateStr}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0;">${timeStr}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">$${data.pricePerUnit.toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  const innerHtml = `
    <h2 style="color: #1a237e; margin: 0 0 4px 0;">Invoice</h2>
    <p style="color: #666; margin: 0 0 20px 0;">From ${data.businessName}</p>
    <p style="margin: 0 0 16px 0;">Hi ${data.consumerName},</p>
    <p style="margin: 0 0 20px 0;">Here is a summary of your bookings:</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 8px 12px; text-align: left; font-size: 13px; color: #666;">Date</th>
          <th style="padding: 8px 12px; text-align: left; font-size: 13px; color: #666;">Time</th>
          <th style="padding: 8px 12px; text-align: right; font-size: 13px; color: #666;">Rate</th>
        </tr>
      </thead>
      <tbody>
        ${bookingRows}
      </tbody>
    </table>
    <div style="background: #f9fafb; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="color: #666;">Total Bookings:</span>
        <span style="font-weight: bold;">${data.totalBookings}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #666;">Total Amount:</span>
        <span style="font-weight: bold; font-size: 18px;">$${data.totalAmount.toFixed(2)}</span>
      </div>
    </div>
    <p style="color: #666; font-size: 13px; margin: 0;">${data.providerName} &middot; ${data.businessName}</p>
  `;

  return buildBrandedEmail(branding, innerHtml);
}

export function buildReminderEmail(
  consumerName: string,
  bookingDate: string,
  bookingTime: string,
  providerName: string,
  isExchangeped: boolean
) {
  const exchangeNotice = isExchangeped
    ? `<p style="color: #e65100; font-weight: bold;">⚠ Note: This booking time was changed from your regular schedule due to a exchange.</p>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a237e;">Booking Reminder</h2>
      <p>Hi ${consumerName},</p>
      <p>This is a reminder about your upcoming booking:</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${bookingTime}</p>
        <p><strong>Provider:</strong> ${providerName}</p>
      </div>
      ${exchangeNotice}
      <p>See you there!</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Sent by AppName</p>
    </div>
  `;
}

export function buildPasswordResetEmail(resetUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a237e;">Reset Your Password</h2>
      <p>We received a request to reset your password for your AppName account.</p>
      <p>Click the button below to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; background: #1a237e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Sent by AppName</p>
    </div>
  `;
}

export function buildVerificationEmail(name: string, verifyUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a237e;">Verify Your Email</h2>
      <p>Hi ${name},</p>
      <p>Thanks for signing up for AppName! Please verify your email address by clicking the button below:</p>
      <a href="${verifyUrl}" style="display: inline-block; background: #1a237e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
      <p style="color: #666; font-size: 14px;">If you didn't create a AppName account, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Sent by AppName</p>
    </div>
  `;
}

export function buildInviteEmail(
  providerName: string,
  businessName: string,
  inviteUrl: string,
  role: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a237e;">You're Invited!</h2>
      <p>${providerName} from <strong>${businessName}</strong> has invited you to join their business as a ${role.toLowerCase()}.</p>
      <p>With AppName, you can:</p>
      <ul>
        <li>View your booking schedule</li>
        <li>Exchange booking times with other consumers</li>
        <li>Get reminders before your bookings</li>
      </ul>
      <a href="${inviteUrl}" style="display: inline-block; background: #1a237e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
        Accept Invitation
      </a>
      <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Sent by AppName</p>
    </div>
  `;
}
