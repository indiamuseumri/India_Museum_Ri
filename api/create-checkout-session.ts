import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate Stripe key exists and is correct format
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[STRIPE] Missing STRIPE_SECRET_KEY')
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  if (
    !process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') &&
    !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')
  ) {
    console.error('[STRIPE] Invalid key format')
    return res.status(500).json({ error: 'Invalid Stripe key format' })
  }

  console.log('[STRIPE] Mode:',
    process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')
      ? 'LIVE' : 'TEST'
  )

  console.log('[STRIPE] Request received')

  try {
    const { amount, email: donorEmail } = req.body

    console.log('[STRIPE] Amount received:', amount)

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < 1) {
      console.error('[STRIPE] Invalid amount:', amount)
      return res.status(400).json({ error: 'Invalid donation amount' })
    }
    if (amount > 10000) {
      return res.status(400).json({
        error: 'Amount exceeds maximum allowed ($10,000)'
      })
    }

    console.log('[STRIPE] Creating session for amount: $' + amount)

    // Create Stripe Checkout Session
    // NOTE: Do NOT pass payment_method_types — let Stripe dynamically select
    // payment methods from Dashboard settings (required for SDK v22 / dahlia API)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      ...(donorEmail ? { customer_email: donorEmail } : {}),
      metadata: {
        email: donorEmail || '',
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation — India Museum & Heritage Society of RI',
              description:
                'Supporting Indian cultural heritage in America. ' +
                'EIN: 05-0505459 | 501(c)(3) Nonprofit Organization',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url:
        `${APP_URL}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/donation/cancel`,
    })

    console.log('[STRIPE] Session created ID:', session.id)

    // CRITICAL VALIDATION: Ensure session.url exists
    if (!session.url) {
      console.error('[STRIPE] CRITICAL: session.url is null')
      throw new Error('Stripe session URL is null')
    }

    // Insert PENDING record BEFORE returning URL
    // Enables payment tracking before webhook fires
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await supabaseAdmin.from('donations').insert({
        amount: amount,
        stripe_session_id: session.id,
        status: 'PENDING',
        donor_email: donorEmail || null,
      })
      console.log('[SUPABASE] Pending donation inserted:', session.id)
    } catch (dbError) {
      // Do not block checkout if DB insert fails
      // Webhook will handle record creation as fallback
      console.error('[SUPABASE] Pending insert failed:', dbError)
    }

    return res.status(200).json({ url: session.url })

  } catch (error: unknown) {
    const err = error as { message?: string; type?: string; code?: string }
    console.error('[STRIPE] Session creation error:', err?.message)
    console.error('[STRIPE] Error type:', err?.type)
    console.error('[STRIPE] Error code:', err?.code)

    const isDev = process.env.NODE_ENV === 'development'
    return res.status(500).json({
      error: 'Failed to create checkout session',
      detail: isDev ? err?.message : undefined,
    })
  }
}
