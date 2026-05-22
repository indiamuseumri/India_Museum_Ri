import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

/**
 * Production-grade Stripe donation reconciliation service.
 *
 * Detects stale PENDING donations, verifies their true state in Stripe,
 * repairs the database, and recovers missed confirmation emails.
 *
 * Trigger modes:
 *   GET /api/reconcile-donations                — standard (stale > 5 min)
 *   GET /api/reconcile-donations?mode=historical — all PENDING rows regardless of age
 *
 * Security: Protected via CRON_SECRET header or Vercel cron system.
 */

interface DonationRow {
  id: string
  amount: number
  stripe_session_id: string
  stripe_payment_id: string | null
  donor_email: string | null
  donor_name: string | null
  status: string
  created_at: string
  email_sent: boolean | null
  reconciled_at: string | null
  reconciliation_count: number | null
}

interface ReconciliationResult {
  donationId: string
  sessionId: string
  action: string
  stripeState: string
  emailSent: boolean
  error?: string
}

/**
 * Send IRS-compliant donation receipt email via Resend.
 * Returns true if sent, false if failed or skipped.
 */
async function sendRecoveryEmail(params: {
  name: string
  email: string
  amount: number
  stripePaymentId: string
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('[RECONCILIATION] RESEND_API_KEY not configured — skipping email')
    return false
  }

  const resend = new Resend(apiKey)
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@indiamuseum.org'

  try {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: params.email,
      subject: 'Donation Receipt — India Museum & Heritage Society of RI',
      html: `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <h2 style="color: #1D3557;">Thank You for Your Donation</h2>
  <p>Dear ${params.name},</p>
  <p>We sincerely thank you for your generous contribution
  to the India Museum and Heritage Society of Rhode Island.</p>
  <hr style="border: 1px solid #eee; margin: 24px 0;" />
  <h3 style="color: #F7931E;">Official Donation Receipt</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; color: #555;">Organization:</td>
      <td style="padding: 8px 0; font-weight: bold;">India Museum and Heritage Society of Rhode Island</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #555;">EIN:</td>
      <td style="padding: 8px 0; font-weight: bold;">05-0505459</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #555;">Amount:</td>
      <td style="padding: 8px 0; font-weight: bold;">$${Number(params.amount).toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #555;">Date:</td>
      <td style="padding: 8px 0;">${date}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #555;">Confirmation:</td>
      <td style="padding: 8px 0; font-size: 12px; color: #888;">${params.stripePaymentId}</td>
    </tr>
  </table>
  <hr style="border: 1px solid #eee; margin: 24px 0;" />
  <p style="font-size: 14px; color: #444;">
    The India Museum and Heritage Society of Rhode Island is a
    registered <strong>501(c)(3) nonprofit organization (EIN: 05-0505459)</strong>.
    Your contribution is <strong>tax-deductible to the extent allowed by law</strong>.
  </p>
  <p style="font-size: 14px; color: #444;">
    <strong>No goods or services were provided in exchange for this contribution.</strong>
  </p>
  <hr style="border: 1px solid #eee; margin: 24px 0;" />
  <p style="font-size: 13px; color: #888;">
    India Museum and Heritage Society of Rhode Island<br/>
    58 Tell Street, Providence, RI<br/>
    EIN: 05-0505459 | 501(c)(3) Nonprofit Organization
  </p>
  <p>With gratitude,<br/><strong>India Museum and Heritage Society of Rhode Island</strong></p>
</div>
      `,
    })

    if (error) {
      console.error('[RECONCILIATION] Email delivery error:', error)
      return false
    }
    console.log('[RECONCILIATION] ✅ Recovery email sent | ID:', data?.id)
    return true
  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[RECONCILIATION] ❌ Email send failed:', e.message)
    return false
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // --- Security: Verify CRON_SECRET or Authorization header ---
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers['authorization']
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[RECONCILIATION] Unauthorized — invalid CRON_SECRET')
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const startTime = Date.now()
  const mode = (req.query?.mode as string) || 'standard'
  const isHistorical = mode === 'historical'

  console.log('[RECONCILIATION] ========================================')
  console.log('[RECONCILIATION] Starting reconciliation run')
  console.log('[RECONCILIATION] Mode:', isHistorical ? 'HISTORICAL (all PENDING)' : 'STANDARD')
  console.log('[RECONCILIATION] Timestamp:', new Date().toISOString())

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const results: ReconciliationResult[] = []
  let successCount = 0
  let expiredCount = 0
  let failedCount = 0
  let skippedCount = 0
  let emailsRecoveredCount = 0
  let errorCount = 0

  try {
    // ─── COMPONENT 1: Detect stale PENDING donations ───
    const STALE_THRESHOLD_MINUTES = isHistorical
      ? 525600 // 365 days for historical mode
      : parseInt(process.env.RECONCILIATION_THRESHOLD_MINUTES || '5')

    const staleThreshold = new Date(
      Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000
    ).toISOString()

    const { data: staleDonations, error: queryError } = await supabaseAdmin
      .from('donations')
      .select('*')
      .eq('status', 'PENDING')
      .lt('created_at', staleThreshold)
      .order('created_at', { ascending: true })

    if (queryError) {
      console.error('[RECONCILIATION] ❌ Query error:', queryError)
      return res.status(500).json({ error: 'Failed to query stale donations' })
    }

    const pendingRows = (staleDonations || []) as DonationRow[]
    console.log('[RECONCILIATION] Stale PENDING donations found:', pendingRows.length)

    // ─── COMPONENT 2 + 3: Verify & repair each donation ───
    for (const donation of pendingRows) {
      const sessionId = donation.stripe_session_id

      try {
        console.log('[RECONCILIATION] Verifying session:', sessionId.slice(0, 30) + '...')

        // Query Stripe for the true session state
        let session: Stripe.Checkout.Session
        try {
          session = await stripe.checkout.sessions.retrieve(sessionId)
        } catch (stripeErr: unknown) {
          const sErr = stripeErr as { statusCode?: number; message?: string }
          if (sErr.statusCode === 404) {
            // Session not found in Stripe — mark as FAILED
            console.log('[RECONCILIATION] Session not found in Stripe — marking FAILED')
            await supabaseAdmin
              .from('donations')
              .update({
                status: 'FAILED',
                reconciled_at: new Date().toISOString(),
                reconciliation_count: (donation.reconciliation_count || 0) + 1,
              })
              .eq('id', donation.id)
              .eq('status', 'PENDING')

            failedCount++
            results.push({
              donationId: donation.id,
              sessionId,
              action: 'marked_failed',
              stripeState: 'not_found',
              emailSent: false,
            })
            continue
          }
          throw stripeErr // re-throw non-404 errors
        }

        // Extract donor information from Stripe
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

        // Map Stripe state → action
        if (session.payment_status === 'paid') {
          // ─── PAYMENT SUCCEEDED — repair to SUCCESS ───
          console.log('[RECONCILIATION] Stripe confirms PAID — repairing to SUCCESS')

          const { error: updateError, count } = await supabaseAdmin
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
            .eq('status', 'PENDING') // Idempotency: only if still PENDING

          if (updateError) {
            console.error('[RECONCILIATION] ❌ DB update error:', updateError)
            errorCount++
            results.push({
              donationId: donation.id,
              sessionId,
              action: 'error',
              stripeState: 'paid',
              emailSent: false,
              error: updateError.message,
            })
            continue
          }

          if (count === 0) {
            // Another process already updated this row — skip
            console.log('[RECONCILIATION] Row already updated by webhook — skipping')
            skippedCount++
            results.push({
              donationId: donation.id,
              sessionId,
              action: 'skipped_already_processed',
              stripeState: 'paid',
              emailSent: false,
            })
            continue
          }

          successCount++

          // ─── COMPONENT 4: Email recovery ───
          let emailSent = false
          if (donorEmail && !donation.email_sent) {
            // Optimistic lock: mark email_sent BEFORE sending
            const { count: lockCount } = await supabaseAdmin
              .from('donations')
              .update({ email_sent: true })
              .eq('id', donation.id)
              .eq('email_sent', false)

            if (lockCount && lockCount > 0) {
              const sent = await sendRecoveryEmail({
                name: donorName || 'Valued Donor',
                email: donorEmail,
                amount: amount || Number(donation.amount),
                stripePaymentId: paymentIntentId || 'N/A',
              })

              if (sent) {
                emailSent = true
                emailsRecoveredCount++
              } else {
                // Revert so next run can retry
                await supabaseAdmin
                  .from('donations')
                  .update({ email_sent: false })
                  .eq('id', donation.id)
              }
            }
          }

          results.push({
            donationId: donation.id,
            sessionId,
            action: 'marked_success',
            stripeState: 'paid',
            emailSent,
          })

        } else if (session.status === 'expired') {
          // ─── SESSION EXPIRED — mark as FAILED ───
          console.log('[RECONCILIATION] Session expired — marking FAILED')
          await supabaseAdmin
            .from('donations')
            .update({
              status: 'FAILED',
              reconciled_at: new Date().toISOString(),
              reconciliation_count: (donation.reconciliation_count || 0) + 1,
            })
            .eq('id', donation.id)
            .eq('status', 'PENDING')

          expiredCount++
          results.push({
            donationId: donation.id,
            sessionId,
            action: 'marked_expired',
            stripeState: 'expired',
            emailSent: false,
          })

        } else if (session.status === 'open' && session.payment_status === 'unpaid') {
          // Still in progress — user may still be on checkout page
          console.log('[RECONCILIATION] Session still open/unpaid — skipping')
          skippedCount++
          results.push({
            donationId: donation.id,
            sessionId,
            action: 'skipped_still_open',
            stripeState: 'open',
            emailSent: false,
          })

        } else {
          // Unknown state
          console.log('[RECONCILIATION] Unknown session state:', session.status, session.payment_status)
          skippedCount++
          results.push({
            donationId: donation.id,
            sessionId,
            action: 'skipped_unknown_state',
            stripeState: `${session.status}/${session.payment_status}`,
            emailSent: false,
          })
        }

      } catch (err: unknown) {
        const e = err as { message?: string }
        console.error('[RECONCILIATION] ❌ Error processing donation:', donation.id, e.message)
        errorCount++
        results.push({
          donationId: donation.id,
          sessionId,
          action: 'error',
          stripeState: 'unknown',
          emailSent: false,
          error: e.message,
        })
      }
    }

    // ─── COMPONENT 4b: Recovery pass for SUCCESS rows with unsent emails ───
    const { data: emailRecoveryCandidates } = await supabaseAdmin
      .from('donations')
      .select('*')
      .eq('status', 'SUCCESS')
      .eq('email_sent', false)
      .not('donor_email', 'is', null)

    const emailCandidates = (emailRecoveryCandidates || []) as DonationRow[]
    if (emailCandidates.length > 0) {
      console.log('[RECONCILIATION] SUCCESS rows needing email recovery:', emailCandidates.length)

      for (const donation of emailCandidates) {
        if (!donation.donor_email) continue

        // Optimistic lock
        const { count: lockCount } = await supabaseAdmin
          .from('donations')
          .update({ email_sent: true })
          .eq('id', donation.id)
          .eq('email_sent', false)

        if (lockCount && lockCount > 0) {
          const sent = await sendRecoveryEmail({
            name: donation.donor_name || 'Valued Donor',
            email: donation.donor_email,
            amount: Number(donation.amount),
            stripePaymentId: donation.stripe_payment_id || 'N/A',
          })

          if (sent) {
            emailsRecoveredCount++
          } else {
            await supabaseAdmin
              .from('donations')
              .update({ email_sent: false })
              .eq('id', donation.id)
          }
        }
      }
    }

  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[RECONCILIATION] ❌ Fatal error:', e.message)
    return res.status(500).json({ error: 'Reconciliation failed', detail: e.message })
  }

  const durationMs = Date.now() - startTime

  const summary = {
    mode,
    timestamp: new Date().toISOString(),
    totalProcessed: results.length,
    markedSuccess: successCount,
    markedExpired: expiredCount,
    markedFailed: failedCount,
    skipped: skippedCount,
    emailsRecovered: emailsRecoveredCount,
    errors: errorCount,
    durationMs,
  }

  console.log('[RECONCILIATION] ========================================')
  console.log('[RECONCILIATION] Run complete:', JSON.stringify(summary))
  console.log('[RECONCILIATION] ========================================')

  return res.status(200).json({
    success: true,
    summary,
    results,
  })
}
