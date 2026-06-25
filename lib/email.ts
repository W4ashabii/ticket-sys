import nodemailer from "nodemailer";
import type { Ticket } from "@/types/ticket";
import fs from "fs";
import path from "path";

const emailFrom = process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? "sidftww@gmail.com";

function getTransport() {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
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
    auth: { user, pass },
  });
}

export async function sendTicketEmail(ticket: Ticket) {
  const transport = getTransport();
  if (!transport || !emailFrom) {
    console.warn("[email] SMTP credentials missing. Ticket email skipped for", ticket.mail);
    return { success: false, skipped: true };
  }

  console.log(`[email] Sending invitation to ${ticket.mail}`);

  // Define your two images (place them in the public folder)
  const imageFiles = [
    { name: "invitation.jpg", cid: "invitation@flyer" },
    { name: "invitation2.jpg", cid: "logo@event" }, // rename as needed
  ];

  // Inline attachment type
  const attachments: Array<{
    filename: string;
    content: Buffer;
    cid: string;
  }> = [];

  const imageHtmlParts: string[] = [];

  for (const img of imageFiles) {
    try {
      const imagePath = path.resolve(process.cwd(), "public", img.name);
      const buffer = fs.readFileSync(imagePath);
      attachments.push({
        filename: img.name,
        content: buffer,
        cid: img.cid,
      });
      imageHtmlParts.push(
        `<img src="cid:${img.cid}" alt="${img.name}" style="width:100%; max-width:600px; display:block; margin:0 auto 16px; border-radius:8px;" />`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[email] Image ${img.name} not found: ${errorMessage}`);
    }
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PyTorch Meetup Nepal - Invitation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 24px;">

        ${imageHtmlParts.join("")}

        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1e293b; margin: 0 0 8px; font-size: 24px; font-weight: 600;">You're Invited!</h1>
          <p style="color: #64748b; margin: 0; font-size: 16px;">Dear <strong>${ticket.name}</strong>,</p>
          <p style="color: #64748b; margin: 12px 0 0; font-size: 15px; line-height: 1.5;">
            Thank you for registering for <strong>PyTorch Meetup Nepal</strong> – the second edition of the PyTorch community event in Nepal!<br>
            We are excited to welcome you to a full day of learning, collaboration, networking, and hands‑on workshops.
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #6a3093 0%, #a044ff 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px; color: white; text-align: center;">
          <p style="margin: 0 0 4px; font-size: 18px; font-weight: 600;">📅 Saturday, 27th June 2026</p>
          <p style="margin: 0 0 4px; font-size: 18px; font-weight: 600;">⏰ 11:00 AM – 5:00 PM</p>
          <p style="margin: 0; font-size: 16px;">📍 Herald College Kathmandu, Naxal</p>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">
            <a href="https://maps.app.goo.gl/9a8JDAsF5fZ1vnHK9" target="_blank" style="color: #fff; text-decoration: underline;">View on Google Maps</a>
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 24px; background: #f8fafc; padding: 12px; border-radius: 8px;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #64748b; font-weight: 500;">Tech Partner</p>
          <p style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #1e293b;">bintech</p>
          <p style="margin: 0 0 6px; font-size: 13px; color: #64748b; font-weight: 500;">Supported By</p>
          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1e293b;">
            HERALD COLLEGE &nbsp;|&nbsp; HimalayaAI &nbsp;|&nbsp; TARKA
          </p>
        </div>

        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #1e293b;">Workshop Requirements</h3>
          <ul style="margin: 0; padding-left: 20px; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <li><strong>Google Colab:</strong> Ensure you have access to your Google account and can use Colab.</li>
            <li>Bring your laptop and charger.</li>
            <li>Arrive on time to avoid missing the opening session.</li>
          </ul>
          <p style="margin: 12px 0 0; font-size: 13px; color: #64748b;">
            If you share your experience on social media, tag us:<br>
            <strong>#pytorchcommunitynepal</strong> &nbsp; <strong>#himalayaai</strong>
          </p>
        </div>

        <div style="text-align: center; padding: 16px 0; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px; color: #1e293b; font-size: 16px; font-weight: 500;">
            We look forward to having you join us as we continue building and strengthening Nepal’s AI and PyTorch community.
          </p>
          <p style="margin: 8px 0 0; color: #64748b; font-size: 15px;">
            See you at the event!
          </p>
        </div>

        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0; margin-top: 8px;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            <strong>PyTorch Community Nepal</strong>
          </p>
          <p style="margin: 4px 0; color: #94a3b8; font-size: 13px;">
            📧 pytorchnepal@gmail.com &nbsp;|&nbsp; 📞 +977 9865609055
          </p>
          <p style="margin: 8px 0 0; color: #94a3b8; font-size: 12px;">
            <a href="https://maps.app.goo.gl/9a8JDAsF5fZ1vnHK9" target="_blank" style="color: #667eea; text-decoration: underline;">Herald College Kathmandu, Naxal</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transport.sendMail({
    from: emailFrom,
    to: ticket.mail,
    subject: `🎟️ Your invitation to PyTorch Meetup Nepal`,
    html,
    attachments,
  });

  return { success: true };
}