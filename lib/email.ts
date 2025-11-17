import nodemailer from "nodemailer";
import type { Ticket } from "@/types/ticket";

// Default to sidftww@gmail.com as sender
const emailFrom = process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? "sidftww@gmail.com";

function getTransport() {
  // Gmail SMTP settings as defaults
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : 587;
  const user = process.env.SMTP_USER ?? "sidftww@gmail.com";
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    console.warn("[email] SMTP_PASS (Gmail App Password) is required");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendTicketEmail(ticket: Ticket) {
  const transport = getTransport();
  if (!transport || !emailFrom) {
    console.warn(
      "[email] SMTP credentials missing. Ticket email skipped for",
      ticket.mail
    );
    return { success: false, skipped: true };
  }

  console.log(`[email] Sending ticket ${ticket.ticketNumber} to ${ticket.mail}`);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Ticket</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1e293b; margin: 0 0 8px; font-size: 24px; font-weight: 600;">Your Ticket is Ready!</h1>
          <p style="color: #64748b; margin: 0; font-size: 14px;">Hi ${ticket.name}, your ticket has been issued successfully.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px; color: white;">
          <div style="text-align: center; margin-bottom: 16px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Ticket Number</p>
            <p style="margin: 8px 0 0; font-size: 28px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 2px;">${ticket.ticketNumber}</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 500;">Name:</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; font-weight: 600;">${ticket.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 500;">Email:</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${ticket.mail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 500;">Issued:</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${new Date(ticket.createdAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 16px; color: #1e293b; font-size: 16px; font-weight: 600;">Scan at Entry</p>
          <div style="text-align: center;">
            <p style="margin: 0 0 12px; color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase;">QR Code</p>
            <div style="background-color: white; padding: 12px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <img src="cid:qrcode@ticket" alt="QR code" style="width: 180px; height: 180px; display: block;" />
            </div>
          </div>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
            <strong>Important:</strong> This ticket is for one-time use only. Once scanned, it cannot be used again.
          </p>
        </div>

        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 12px;">Present this ticket at the event entrance</p>
          <p style="margin: 8px 0 0; color: #94a3b8; font-size: 11px;">Event Operations Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Convert data URL to buffer for email attachment
  const qrCodeBuffer = Buffer.from(
    ticket.qrCodeDataUrl.split(",")[1],
    "base64"
  );

  await transport.sendMail({
    from: emailFrom,
    to: ticket.mail,
    subject: `Your mobile ticket (${ticket.ticketNumber})`,
    html,
    attachments: [
      {
        filename: "qr-code.png",
        content: qrCodeBuffer,
        cid: "qrcode@ticket",
      },
    ],
  });

  return { success: true };
}

