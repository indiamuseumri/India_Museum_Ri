import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, phone, eventTitle, eventDate, eventTime } = req.body

    if (!name || !eventTitle) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const resend = new Resend(process.env.RESEND_API_KEY!)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@indiamuseum.org'

    // NOTE: Add email field to registration form in future
    // to enable actual email delivery to attendee

    await resend.emails.send({
      from: fromEmail,
      to: fromEmail, // Sending to museum admin for now (attendee email not collected yet)
      subject: `Registration Confirmed — ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#0D1433;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;margin-top:32px;margin-bottom:32px;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#1B2A6B,#0D1B42);padding:32px 24px;text-align:center;">
              <h1 style="color:#F5F0E8;margin:0;font-size:20px;font-weight:700;">India Museum & Heritage Society of RI</h1>
              <p style="color:#C9A84C;margin:8px 0 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Registration Confirmation</p>
            </div>
            <!-- Body -->
            <div style="padding:32px 24px;">
              <p style="font-size:16px;color:#1C1C1E;margin:0 0 16px;">Dear ${name},</p>
              <p style="font-size:15px;color:#48484A;line-height:1.7;margin:0 0 24px;">
                You are successfully registered for <strong style="color:#1C1C1E;">${eventTitle}</strong>.
              </p>
              <div style="background:#F5F0E8;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:14px;color:#48484A;">
                  📅 <strong>Date:</strong> ${eventDate || 'TBD'}
                </p>
                <p style="margin:0 0 8px;font-size:14px;color:#48484A;">
                  🕐 <strong>Time:</strong> ${eventTime || 'TBD'}
                </p>
                <p style="margin:0;font-size:14px;color:#48484A;">
                  📞 <strong>Phone:</strong> ${phone}
                </p>
              </div>
              <p style="font-size:15px;color:#48484A;line-height:1.7;margin:0;">
                We look forward to seeing you!
              </p>
            </div>
            <!-- Footer -->
            <div style="background:#F5F0E8;padding:20px 24px;text-align:center;border-top:1px solid #E8E0D0;">
              <p style="font-size:12px;color:#8E8E93;margin:0;">
                India Museum & Heritage Society of Rhode Island<br>
                58 Tell Street, Providence, RI 02909<br>
                <a href="https://indiamuseumri.org" style="color:#1B2A6B;">indiamuseumri.org</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('[API ERROR]:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
