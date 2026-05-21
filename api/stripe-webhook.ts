import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Stripe webhook requires raw body — disable Vercel's body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    })

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const rawBody = await getRawBody(req)
    const sig = req.headers['stripe-signature'] as string

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: unknown) {
      const verifyErr = err as { message?: string }
      console.error('[WEBHOOK] Signature verification failed:', verifyErr?.message)
      return res.status(400).json({ error: 'Webhook signature verification failed' })
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const donorEmail = session.customer_details?.email ?? ''
      const donorName = session.customer_details?.name ?? ''
      const stripePaymentId = (session.payment_intent as string) || ''
      const amount = (session.amount_total ?? 0) / 100
      const stripeSessionId = session.id

      console.log('[WEBHOOK] Event received:', event.type)
      console.log('[WEBHOOK] Session ID:', stripeSessionId)
      console.log('[WEBHOOK] Amount:', amount)

      // Update existing PENDING record to SUCCESS
      const { data: existing } = await supabaseAdmin
        .from('donations')
        .select('id')
        .eq('stripe_session_id', stripeSessionId)
        .single()

      if (existing) {
        await supabaseAdmin
          .from('donations')
          .update({
            status: 'SUCCESS',
            donor_email: donorEmail,
            donor_name: donorName,
            stripe_payment_id: stripePaymentId,
          })
          .eq('stripe_session_id', stripeSessionId)
        console.log('[WEBHOOK] Status update: PENDING → SUCCESS')
        console.log('[WEBHOOK] Donation updated to SUCCESS:', stripeSessionId)
      } else {
        // Fallback: insert if PENDING record was not created
        await supabaseAdmin.from('donations').insert({
          amount,
          stripe_session_id: stripeSessionId,
          stripe_payment_id: stripePaymentId,
          donor_email: donorEmail,
          donor_name: donorName,
          status: 'SUCCESS',
        })
        console.log('[WEBHOOK] Donation inserted as SUCCESS:', stripeSessionId)
      }

      // Send IRS-compliant donation receipt email
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })

      try {
        const emailResponse = await fetch(`${process.env.VITE_APP_URL}/api/send-donation-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: donorName,
            email: donorEmail,
            amount,
            date,
            stripePaymentId,
          }),
        })

        if (!emailResponse.ok) {
          const errorBody = await emailResponse.text()
          console.error('[WEBHOOK] Email API returned non-200:', emailResponse.status, errorBody)
        } else {
          console.log('[WEBHOOK] Donation email sent successfully for:', donorEmail)
        }
      } catch (emailError) {
        console.error('[WEBHOOK] Email trigger failed:', emailError)
        // Do not fail webhook — email is non-blocking
      }
    }

    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await supabaseAdmin
        .from('donations')
        .update({ status: 'FAILED' })
        .eq('stripe_payment_id', paymentIntent.id)
      console.log('[WEBHOOK] Donation marked FAILED:', paymentIntent.id)
    }

    // Always return 200 to Stripe immediately
    return res.status(200).json({ received: true })

  } catch (error) {
    console.error('[WEBHOOK] Processing error:', error)
    // Still return 200 to prevent Stripe retries for app errors
    return res.status(200).json({ received: true })
  }
}
