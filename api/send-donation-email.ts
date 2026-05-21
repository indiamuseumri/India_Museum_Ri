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
    const { name, email, amount, date, stripePaymentId } = req.body

    if (!email || !amount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const resend = new Resend(process.env.RESEND_API_KEY!)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@indiamuseum.org'

    const donorName = name || 'Generous Donor'
    const donationDate = date || new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
    const paymentId = stripePaymentId || 'N/A'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Donation Receipt — India Museum & Heritage Society of RI',
      html: `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">

  <h2 style="color: #1D3557;">
    Thank You for Your Donation
  </h2>

  <p>Dear ${donorName},</p>

  <p>We sincerely thank you for your generous contribution
  to the India Museum and Heritage Society of Rhode Island.</p>

  <hr style="border: 1px solid #eee; margin: 24px 0;" />

  <h3 style="color: #F7931E;">Official Donation Receipt</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; color: #555;">Organization:</td>
      <td style="padding: 8px 0; font-weight: bold;">
        India Museum and Heritage Society of Rhode Island
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #555;">EIN:</td>
      <td style="padding: 8px 0; font-weight: bold;">
        05-0505459
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #555;">Amount:</td>
      <td style="padding: 8px 0; font-weight: bold;">
        $${Number(amount).toFixed(2)}
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #555;">Date:</td>
      <td style="padding: 8px 0;">${donationDate}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #555;">Confirmation:</td>
      <td style="padding: 8px 0; font-size: 12px; color: #888;">
        ${paymentId}
      </td>
    </tr>
  </table>

  <hr style="border: 1px solid #eee; margin: 24px 0;" />

  <p style="font-size: 14px; color: #444;">
    The India Museum and Heritage Society of Rhode Island is a
    registered <strong>501(c)(3) nonprofit organization
    (EIN: 05-0505459)</strong>. Your contribution is
    <strong>tax-deductible to the extent allowed by law</strong>.
  </p>

  <p style="font-size: 14px; color: #444;">
    <strong>No goods or services were provided in exchange
    for this contribution.</strong>
  </p>

  <p style="font-size: 14px; color: #555;">
    Your support helps us preserve cultural heritage, organize
    exhibitions, and educate future generations about India's
    rich civilization in America.
  </p>

  <hr style="border: 1px solid #eee; margin: 24px 0;" />

  <p style="font-size: 13px; color: #888;">
    India Museum and Heritage Society of Rhode Island<br/>
    58 Tell Street, Providence, RI<br/>
    EIN: 05-0505459<br/>
    501(c)(3) Nonprofit Organization
  </p>

  <p>With gratitude,<br/>
  <strong>India Museum and Heritage Society
  of Rhode Island</strong></p>

</div>
      `,
    })

    if (error) {
      console.error('[DONATION EMAIL] Resend delivery error:', error)
      return res.status(500).json({ error: error.message || 'Email delivery failed' })
    }

    console.log('[DONATION EMAIL] Receipt sent to:', email, '| ID:', data?.id)
    return res.status(200).json({ success: true, id: data?.id })
  } catch (err) {
    console.error('[DONATION EMAIL] Exception:', err)
    return res.status(500).json({ error: 'Email send failed' })
  }
}
