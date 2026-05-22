import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

/**
 * Admin manual reconciliation endpoint for a single donation session.
 *
 * POST /api/admin/reconcile-donation
 * Body: { "sessionId": "cs_live_..." }
 *
 * Protected: Requires CRON_SECRET or admin authorization.
 * Returns detailed JSON showing what was found and what was changed.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // --- Security: Verify CRON_SECRET ---
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers['authorization']
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const { sessionId } = req.body || {}

  if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return res.status(400).json({ error: 'Invalid sessionId — must be a Stripe checkout session ID' })
  }

  console.log('[ADMIN-RECONCILE] Manual reconciliation for session:', sessionId.slice(0, 30) + '...')

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Look up the donation row in Supabase
    const { data: donation, error: dbError } = await supabaseAdmin
      .from('donations')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single()

    if (dbError || !donation) {
      return res.status(404).json({
        success: false,
        sessionId,
        error: 'No donation row found for this session ID',
      })
    }

    console.log('[ADMIN-RECONCILE] Found donation:', donation.id, '| Status:', donation.status)

    // 2. Query Stripe for the true session state
    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch (stripeErr: unknown) {
      const sErr = stripeErr as { statusCode?: number; message?: string }
      return res.status(404).json({
        success: false,
        sessionId,
        donationId: donation.id,
        currentStatus: donation.status,
        error: sErr.statusCode === 404
          ? 'Session not found in Stripe'
          : `Stripe error: ${sErr.message}`,
      })
    }

    // 3. Extract donor info
    const donorEmail =
      session.customer_details?.email
      || session.customer_email
      || session.metadata?.email
      || null

    const donorName = session.customer_details?.name || null
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null
    const amount = (session.amount_total ?? 0) / 100

    // 4. Determine action based on Stripe state
    let actionTaken = 'none'
    let emailSent = false

    if (session.payment_status === 'paid') {
      if (donation.status === 'SUCCESS') {
        actionTaken = 'already_success'
        console.log('[ADMIN-RECONCILE] Already SUCCESS — no update needed')
      } else {
        const { error: updateError } = await supabaseAdmin
          .from('donations')
          .update({
            status: 'SUCCESS',
            donor_email: donorEmail,
            donor_name: donorName,
            stripe_payment_id: paymentIntentId,
            reconciled_at: new Date().toISOString(),
            reconciliation_count: (donation.reconciliation_count || 0) + 1,
          })
          .eq('id', donation.id)

        if (updateError) {
          return res.status(500).json({
            success: false,
            sessionId,
            donationId: donation.id,
            error: `DB update failed: ${updateError.message}`,
          })
        }

        actionTaken = 'marked_success'
        console.log('[ADMIN-RECONCILE] ✅ Donation repaired to SUCCESS')

        // Send recovery email if not already sent
        if (donorEmail && !donation.email_sent) {
          // Optimistic lock
          const { count: lockCount } = await supabaseAdmin
            .from('donations')
            .update({ email_sent: true })
            .eq('id', donation.id)
            .eq('email_sent', false)

          if (lockCount && lockCount > 0) {
            const apiKey = process.env.RESEND_API_KEY
            if (apiKey) {
              const resend = new Resend(apiKey)
              const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@indiamuseum.org'
              const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })

              try {
                const { error: emailError } = await resend.emails.send({
                  from: fromEmail,
                  to: donorEmail,
                  subject: 'Donation Receipt — India Museum & Heritage Society of RI',
                  html: `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <h2 style="color: #1D3557;">Thank You for Your Donation</h2>
                    <p>Dear ${donorName || 'Valued Donor'},</p>
                    <p>We sincerely thank you for your generous contribution to the India Museum and Heritage Society of Rhode Island.</p>
                    <hr style="border: 1px solid #eee; margin: 24px 0;" />
                    <p><strong>Amount:</strong> $${Number(amount).toFixed(2)}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>EIN:</strong> 05-0505459 | 501(c)(3) Nonprofit Organization</p>
                    <p style="font-size: 14px; color: #444;">Your contribution is <strong>tax-deductible to the extent allowed by law</strong>. No goods or services were provided in exchange for this contribution.</p>
                    <hr style="border: 1px solid #eee; margin: 24px 0;" />
                    <p>With gratitude,<br/><strong>India Museum and Heritage Society of Rhode Island</strong></p>
                  </div>`,
                })

                if (!emailError) {
                  emailSent = true
                  console.log('[ADMIN-RECONCILE] ✅ Recovery email sent')
                } else {
                  // Revert
                  await supabaseAdmin
                    .from('donations')
                    .update({ email_sent: false })
                    .eq('id', donation.id)
                }
              } catch {
                await supabaseAdmin
                  .from('donations')
                  .update({ email_sent: false })
                  .eq('id', donation.id)
              }
            }
          }
        }
      }
    } else if (session.status === 'expired') {
      if (donation.status === 'FAILED') {
        actionTaken = 'already_failed'
      } else {
        await supabaseAdmin
          .from('donations')
          .update({
            status: 'FAILED',
            reconciled_at: new Date().toISOString(),
            reconciliation_count: (donation.reconciliation_count || 0) + 1,
          })
          .eq('id', donation.id)

        actionTaken = 'marked_expired'
      }
    } else {
      actionTaken = `no_action_state_${session.status}_${session.payment_status}`
    }

    return res.status(200).json({
      success: true,
      sessionId,
      donationId: donation.id,
      previousStatus: donation.status,
      stripeState: `${session.status}/${session.payment_status}`,
      actionTaken,
      emailSent,
      donorEmail: donorEmail ? '[present]' : null,
      donorName: donorName ? '[present]' : null,
      amount,
    })

  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[ADMIN-RECONCILE] ❌ Error:', e.message)
    return res.status(500).json({
      success: false,
      sessionId,
      error: e.message,
    })
  }
}
