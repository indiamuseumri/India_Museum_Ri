import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Disable Vercel's body parser — needed for Stripe signature verification.
export const config = {
  api: {
    bodyParser: false,
  },
}

/**
 * Collect raw body from the request stream.
 * Handles both raw stream (bodyParser disabled) and
 * pre-parsed body (if Vercel ignores the config) scenarios.
 */
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      if (chunks.length > 0) {
        resolve(Buffer.concat(chunks))
      } else if (req.body) {
        // Vercel already consumed the stream — re-serialize
        resolve(Buffer.from(
          typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
        ))
      } else {
        reject(new Error('Empty request body'))
      }
    })
    req.on('error', reject)
  })
}

/**
 * Send IRS-compliant donation receipt email via Resend.
 * Errors are caught and logged — never crashes the webhook.
 */
async function sendDonationReceipt(params: {
  name: string
  email: string
  amount: number
  date: string
  stripePaymentId: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[EMAIL] RESEND_API_KEY not configured — skipping email')
    return
  }

  const resend = new Resend(apiKey)
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@indiamuseum.org'

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: params.email,
      subject: 'Donation Receipt — India Museum & Heritage Society of RI',
      html: `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">

  <h2 style="color: #1D3557;">
    Thank You for Your Donation
  </h2>

  <p>Dear ${params.name},</p>

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
        $${Number(params.amount).toFixed(2)}
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #555;">Date:</td>
      <td style="padding: 8px 0;">${params.date}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #555;">Confirmation:</td>
      <td style="padding: 8px 0; font-size: 12px; color: #888;">
        ${params.stripePaymentId}
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
      console.error('[EMAIL] Resend delivery error:', error)
    } else {
      console.log('[EMAIL] ✅ Receipt sent to:', params.email, '| ID:', data?.id)
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[EMAIL] ❌ Resend failed:', e.message)
    // Do not rethrow — email failure must not fail webhook
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('[WEBHOOK] Request received')

  // Use SDK default API version (2026-03-25.dahlia) — do NOT hardcode old version
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // --- Signature verification ---
  const sig = req.headers['stripe-signature'] as string
  if (!sig) {
    console.error('[WEBHOOK] Missing stripe-signature header')
    return res.status(400).json({ error: 'Missing stripe-signature header' })
  }

  let event: Stripe.Event

  try {
    const rawBody = await getRawBody(req)
    console.log('[WEBHOOK] Raw body length:', rawBody.length)
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('[WEBHOOK] ✅ Signature verified | Event:', event.type, '| ID:', event.id)
  } catch (err: unknown) {
    const verifyErr = err as { message?: string }
    console.error('[WEBHOOK] ❌ Signature verification failed:', verifyErr.message)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  // --- Process event BEFORE returning 200 ---
  // This ensures DB updates complete before Vercel shuts down the function.
  // If processing fails, we still return 200 to prevent infinite Stripe retries.
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const donorEmail =
        session.customer_details?.email
        || session.customer_email
        || session.metadata?.email
        || null

      const donorName = session.customer_details?.name || null
      const amount = (session.amount_total ?? 0) / 100
      const sessionId = session.id
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null

      console.log('[WEBHOOK] checkout.session.completed')
      console.log('[WEBHOOK] Session:', sessionId)
      console.log('[WEBHOOK] Donor:', donorName, donorEmail)
      console.log('[WEBHOOK] Amount: $' + amount)
      console.log('[WEBHOOK] PaymentIntent:', paymentIntentId)

      // Idempotency check: skip if already processed
      const { data: existingDonation } = await supabaseAdmin
        .from('donations')
        .select('status, email_sent')
        .eq('stripe_session_id', sessionId)
        .single()

      if (existingDonation?.status === 'SUCCESS') {
        console.log('[WEBHOOK] Donation already SUCCESS — skipping duplicate event:', sessionId)
        return res.status(200).json({ received: true, skipped: 'already_processed' })
      }

      // Try to update existing PENDING row → SUCCESS
      const { error: updateError, count } = await supabaseAdmin
        .from('donations')
        .update({
          status: 'SUCCESS',
          donor_email: donorEmail,
          donor_name: donorName,
          stripe_payment_id: paymentIntentId,
        })
        .eq('stripe_session_id', sessionId)
        .eq('status', 'PENDING') // Only update if still PENDING — race condition protection

      console.log('[WEBHOOK] Update result — error:', updateError, '| count:', count)

      if (updateError || count === 0) {
        // No PENDING row found or update failed — insert fresh SUCCESS row
        console.log('[WEBHOOK] No PENDING row matched — inserting new SUCCESS row')
        const { error: insertError } = await supabaseAdmin
          .from('donations')
          .insert({
            amount,
            stripe_session_id: sessionId,
            stripe_payment_id: paymentIntentId,
            donor_email: donorEmail,
            donor_name: donorName,
            status: 'SUCCESS',
            email_sent: false,
          })

        if (insertError) {
          console.error('[WEBHOOK] ❌ DB insert failed:', insertError)
        } else {
          console.log('[WEBHOOK] ✅ Donation inserted as SUCCESS')
        }
      } else {
        console.log('[WEBHOOK] ✅ Donation updated PENDING → SUCCESS')
      }

      // Send receipt email (non-blocking — errors caught internally)
      if (donorEmail && !existingDonation?.email_sent) {
        const date = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        try {
          await sendDonationReceipt({
            name: donorName || 'Valued Donor',
            email: donorEmail,
            amount,
            date,
            stripePaymentId: paymentIntentId || 'N/A',
          })

          // Mark email_sent = true after successful send
          await supabaseAdmin
            .from('donations')
            .update({ email_sent: true })
            .eq('stripe_session_id', sessionId)

          console.log('[WEBHOOK] ✅ Receipt sent to:', donorEmail)
        } catch (emailErr: unknown) {
          const e = emailErr as { message?: string }
          console.error('[WEBHOOK] Email send failed:', e.message)
          // Do not fail webhook — email is non-blocking
        }
      } else if (!donorEmail) {
        console.log('[WEBHOOK] No donor email — skipping receipt')
      } else {
        console.log('[WEBHOOK] Email already sent — skipping duplicate')
      }
    }

    // Handle expired checkout sessions → EXPIRED
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('[WEBHOOK] checkout.session.expired:', session.id)
      const { error: expireError } = await supabaseAdmin
        .from('donations')
        .update({ status: 'EXPIRED' })
        .eq('stripe_session_id', session.id)
        .eq('status', 'PENDING') // Only update if still PENDING

      if (expireError) {
        console.error('[WEBHOOK] ❌ Expire update error:', expireError)
      } else {
        console.log('[WEBHOOK] ✅ Session expired → EXPIRED')
      }
    }

    // Handle failed payment intents → FAILED
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('[WEBHOOK] payment_intent.payment_failed:', paymentIntent.id)
      const { error: failError } = await supabaseAdmin
        .from('donations')
        .update({ status: 'FAILED' })
        .eq('stripe_payment_id', paymentIntent.id)

      if (failError) {
        console.error('[WEBHOOK] ❌ Payment failed update error:', failError)
      } else {
        console.log('[WEBHOOK] ✅ Payment failed → FAILED')
      }
    }

    // Handle payment_intent.succeeded (for logging — DB already updated by checkout.session.completed)
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('[WEBHOOK] ✅ payment_intent.succeeded:', paymentIntent.id, '| Amount:', paymentIntent.amount)
    }

  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[WEBHOOK] ❌ Processing error:', e.message)
  }

  // Always return 200 to Stripe — even if processing failed
  // This prevents infinite retry loops
  console.log('[WEBHOOK] Returning 200 to Stripe')
  return res.status(200).json({ received: true })
}
