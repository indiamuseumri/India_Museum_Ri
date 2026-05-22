# Deployment Guide

Step-by-step production deployment runbook for the India Museum & Heritage Society of Rhode Island platform.

This guide assumes you are deploying a fresh instance. If you are updating an existing deployment, skip to [Post-Deployment Verification](#post-deployment-verification).

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Service Setup Order](#service-setup-order)
- [Step 1 — Supabase](#step-1--supabase)
- [Step 2 — Clerk](#step-2--clerk)
- [Step 3 — Resend](#step-3--resend)
- [Step 4 — Stripe](#step-4--stripe)
- [Step 5 — Vercel](#step-5--vercel)
- [Environment Variables Checklist](#environment-variables-checklist)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Procedure](#rollback-procedure)
- [Monitoring Checklist](#monitoring-checklist)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed locally
- [ ] npm 9+ installed
- [ ] Git configured with access to the repository
- [ ] A GitHub account with push access to `indiamuseumri/India_Museum_Ri`
- [ ] A credit card for service accounts (most have free tiers)
- [ ] A verified custom domain (for production email delivery)

### Account Requirements

| Service | URL | Free Tier |
|---|---|---|
| Supabase | [supabase.com](https://supabase.com) | Yes — 500 MB database, 1 GB storage |
| Clerk | [clerk.com](https://clerk.com) | Yes — 10,000 MAU |
| Stripe | [stripe.com](https://stripe.com) | Yes — pay-per-transaction |
| Resend | [resend.com](https://resend.com) | Yes — 3,000 emails/month |
| Vercel | [vercel.com](https://vercel.com) | Yes — 100 GB bandwidth |

---

## Service Setup Order

Services must be configured in this order due to cross-dependencies:

```
1. Supabase  →  Database, storage, JWT secret
2. Clerk     →  Auth, JWT template (needs Supabase JWT secret)
3. Resend    →  Email delivery (independent)
4. Stripe    →  Payments (needs production URL for webhook)
5. Vercel    →  Hosting (needs all environment variables)
```

---

## Step 1 — Supabase

### 1.1 Create Project

- [ ] Go to [supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] Click **New Project**
- [ ] Select your organization
- [ ] Set project name (e.g., `india-museum-prod`)
- [ ] Choose a strong database password — save it securely
- [ ] Select the **US East** region (closest to Providence, RI)
- [ ] Click **Create new project**

### 1.2 Create Tables

- [ ] Open the **SQL Editor** in the Supabase Dashboard
- [ ] Run the following SQL:

```sql
-- Events
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'COMING_SOON',
  image_url TEXT
);

-- Registrations
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations
CREATE TABLE donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  status TEXT DEFAULT 'PENDING',
  stripe_session_id TEXT,
  stripe_payment_id TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reconciled_at TIMESTAMPTZ,
  reconciliation_count INTEGER DEFAULT 0
);

-- Exhibition Images
CREATE TABLE exhibition_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Enable Row Level Security

- [ ] Run the following SQL:

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_images ENABLE ROW LEVEL SECURITY;
```

### 1.4 Create RLS Policies

- [ ] Run the following SQL:

```sql
-- Events: public read, authenticated write
CREATE POLICY "Public can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert events" ON events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update events" ON events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete events" ON events FOR DELETE TO authenticated USING (true);

-- Registrations: public insert, authenticated read
CREATE POLICY "Public can insert registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can read registrations" ON registrations FOR SELECT TO authenticated USING (true);

-- Donations: authenticated only
CREATE POLICY "Authenticated can read donations" ON donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert donations" ON donations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update donations" ON donations FOR UPDATE TO authenticated USING (true);

-- Exhibition Images: public read, authenticated write
CREATE POLICY "Public can read exhibition images" ON exhibition_images FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert exhibition images" ON exhibition_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete exhibition images" ON exhibition_images FOR DELETE TO authenticated USING (true);
```

### 1.5 Create Storage Bucket

- [ ] Go to **Storage** in the Supabase Dashboard
- [ ] Click **New bucket**
- [ ] Name: `exhibition-images`
- [ ] Check **Public bucket** (images need to be publicly accessible)
- [ ] Click **Create bucket**
- [ ] Create storage policies allowing authenticated users to upload and delete

### 1.6 Collect Credentials

- [ ] Go to **Settings → API**
- [ ] Copy **Project URL** → `VITE_SUPABASE_URL`
- [ ] Copy **anon public** key → `VITE_SUPABASE_ANON_KEY`
- [ ] Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Go to **Settings → API → JWT Settings**
- [ ] Copy **JWT Secret** — you will need this for Clerk setup

---

## Step 2 — Clerk

### 2.1 Create Application

- [ ] Go to [dashboard.clerk.com](https://dashboard.clerk.com)
- [ ] Click **Create application**
- [ ] Name: `India Museum RI`
- [ ] Enable **Google** as a social sign-in provider

### 2.2 Create JWT Template

This is the critical step that bridges Clerk authentication with Supabase RLS.

- [ ] Go to **Configure → JWT Templates**
- [ ] Click **New template**
- [ ] Select **Supabase** from the template list
- [ ] **Template name:** `supabase` (case-sensitive — must be lowercase)
- [ ] **Signing algorithm:** HS256
- [ ] **Signing key:** Paste the **JWT Secret** from Supabase (Step 1.6)
- [ ] Click **Save**

> ⚠️ If this template is not named exactly `supabase`, the `getToken({ template: 'supabase' })` call in the application will return `null` and all admin operations will fail.

### 2.3 Collect Credentials

- [ ] Go to **API Keys**
- [ ] Copy **Publishable key** → `VITE_CLERK_PUBLISHABLE_KEY`
- [ ] Copy **Secret key** → `CLERK_SECRET_KEY`

### 2.4 Configure Admin Access

The admin email whitelist is defined in `src/lib/adminAuth.ts`. Update the `ADMIN_EMAIL` constant to your authorized admin email address.

---

## Step 3 — Resend

### 3.1 Create Account

- [ ] Go to [resend.com](https://resend.com)
- [ ] Create an account

### 3.2 Add Domain

- [ ] Go to **Domains**
- [ ] Click **Add Domain**
- [ ] Enter your domain (e.g., `indiamuseumri.org`)
- [ ] Add the required DNS records (MX, TXT, CNAME) to your domain registrar
- [ ] Wait for domain verification (usually minutes, sometimes hours)

### 3.3 Create API Key

- [ ] Go to **API Keys**
- [ ] Click **Create API Key**
- [ ] Copy the key → `RESEND_API_KEY`

### 3.4 Set Sender Email

- [ ] Set `RESEND_FROM_EMAIL` to a verified address on your domain
- [ ] Example: `donations@indiamuseumri.org`

---

## Step 4 — Stripe

### 4.1 Create Account

- [ ] Go to [stripe.com](https://stripe.com)
- [ ] Create an account
- [ ] Complete business verification for live mode

### 4.2 Get API Keys

- [ ] Go to **Developers → API Keys** ([dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys))
- [ ] Copy **Publishable key** (`pk_live_...`) → `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Copy **Secret key** (`sk_live_...`) → `STRIPE_SECRET_KEY`

> 💡 Use `pk_test_` and `sk_test_` keys for development/testing.

### 4.3 Create Webhook Endpoint

- [ ] Go to **Developers → Webhooks** ([dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks))
- [ ] Click **Add endpoint**
- [ ] **Endpoint URL:** `https://indiamuseumri.org/api/stripe-webhook`
- [ ] **Events to subscribe:**
  - [x] `checkout.session.completed`
  - [x] `checkout.session.expired`
  - [x] `payment_intent.payment_failed`
  - [x] `payment_intent.succeeded`
- [ ] Click **Add endpoint**

### 4.4 Get Webhook Secret

- [ ] Click on the created webhook endpoint
- [ ] Click **Reveal** under **Signing secret**
- [ ] Copy the signing secret (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

---

## Step 5 — Vercel

### 5.1 Connect Repository

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click **Import Project**
- [ ] Connect your GitHub account
- [ ] Select the `indiamuseumri/India_Museum_Ri` repository
- [ ] Vercel will auto-detect the Vite framework

### 5.2 Add Environment Variables

- [ ] Go to **Settings → Environment Variables**
- [ ] Add each variable from the [Environment Variables Checklist](#environment-variables-checklist) below
- [ ] Ensure all variables are set for the **Production** environment

### 5.3 Deploy

- [ ] Click **Deploy** or push to the `main` branch
- [ ] Monitor the build logs for errors
- [ ] Wait for deployment status to reach **Ready**

### 5.4 Configure Domain

- [ ] Go to **Settings → Domains**
- [ ] Add your custom domain (e.g., `indiamuseumri.org`)
- [ ] Configure DNS records as instructed by Vercel
- [ ] Wait for SSL certificate provisioning

### 5.5 Enable Analytics

- [ ] Go to the **Analytics** tab in the Vercel Dashboard
- [ ] Click **Enable Analytics** if prompted
- [ ] Go to the **Speed Insights** tab
- [ ] Verify Speed Insights are active

---

## Environment Variables Checklist

Verify every variable is set in the Vercel Dashboard before deployment.

### Frontend Variables (VITE_ prefix — included in browser bundle)

| Variable | Format | Example Value Pattern |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | ✅ Set |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (JWT) | ✅ Set |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` | ✅ Set |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` | ✅ Set |
| `VITE_APP_URL` | `https://indiamuseumri.org` | ✅ Set |

### Backend Variables (server-only — never in browser bundle)

| Variable | Format | Example Value Pattern |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (JWT) | ✅ Set |
| `CLERK_SECRET_KEY` | `sk_live_...` or `sk_test_...` | ✅ Set |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | ✅ Set |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ✅ Set |
| `RESEND_API_KEY` | `re_...` | ✅ Set |
| `RESEND_FROM_EMAIL` | `email@yourdomain.org` | ✅ Set |

---

## Post-Deployment Verification

Run through every check after deployment to confirm the system is fully operational.

### Frontend Verification

- [ ] Homepage loads at production URL
- [ ] Navigation bar renders correctly
- [ ] Hero section displays with background image
- [ ] Cultural grid cards display and link to exhibition galleries
- [ ] Events section loads event data from Supabase
- [ ] Donation section displays preset amounts
- [ ] Visit section renders museum information
- [ ] Leadership section displays board members
- [ ] Footer renders with contact information
- [ ] Mobile responsive layout works at 375px width
- [ ] Scroll animations trigger on section entry
- [ ] Back-to-top button appears on scroll

### Exhibition Gallery Verification

- [ ] Navigate to `/exhibitions/faith` — gallery loads images from Supabase Storage
- [ ] Verify all 5 categories render correctly (faith, art, music, literature, ethnic)
- [ ] Image lightbox opens on click

### Donation Flow (End-to-End)

- [ ] Select a donation amount on the homepage
- [ ] Click "Donate" button
- [ ] Verify redirect to Stripe Checkout page
- [ ] Complete a test payment (use Stripe test card `4242 4242 4242 4242`)
- [ ] Verify redirect to success page (`/donation/success`)
- [ ] Verify payment popup appears on homepage
- [ ] Check Stripe Dashboard → Payments → verify payment appears
- [ ] Check Supabase → donations table → verify `SUCCESS` row with correct amount
- [ ] Check email inbox → verify IRS receipt email received

### Webhook Verification

- [ ] Go to Stripe Dashboard → Webhooks → select your endpoint
- [ ] Check recent events — verify `checkout.session.completed` was delivered
- [ ] Verify response status is **200**
- [ ] If webhook failed, check Vercel Function Logs for error details

### Admin Panel Verification

- [ ] Navigate to `/admin`
- [ ] Verify unauthenticated users see "Access Denied"
- [ ] Sign in with the authorized admin email
- [ ] Verify Dashboard statistics load
- [ ] Navigate to **Events** — verify event list loads, test create/edit/delete
- [ ] Navigate to **Exhibitions** — verify image grid loads per category, test upload
- [ ] Navigate to **Donations** — verify donation records display with status filters
- [ ] Navigate to **Registrations** — verify registration records display with event join
- [ ] Test CSV export on both Donations and Registrations

### Reconciliation Verification

- [ ] Check Vercel Cron tab — verify the reconciliation job is scheduled (`*/5 * * * *`)
- [ ] Check Vercel Function Logs for `[RECONCILIATION]` entries
- [ ] Verify stale PENDING donations (if any) are being processed

### Analytics Verification

- [ ] Open browser DevTools → Network tab
- [ ] Navigate through several pages
- [ ] Verify requests to `va.vercel-scripts.com` appear (Vercel Analytics)
- [ ] Check Vercel Dashboard → Analytics tab → verify data is flowing
- [ ] Check Vercel Dashboard → Speed Insights tab → verify Web Vitals data

---

## Rollback Procedure

If a deployment introduces issues:

### Immediate Rollback via Vercel

1. Go to Vercel Dashboard → **Deployments**
2. Find the last known-good deployment
3. Click the `...` menu → **Promote to Production**
4. This instantly reverts to the previous build without a new deploy

### Git Rollback

```bash
# Identify the last good commit
git log --oneline -10

# Revert to a specific commit
git revert <bad-commit-hash>
git push origin main

# Or hard reset (destructive — only if no other collaborators)
git reset --hard <good-commit-hash>
git push --force origin main
```

### Database Rollback

Supabase does not have built-in rollback. If a schema change causes issues:

1. Connect to the SQL editor
2. Manually revert the schema change with `ALTER TABLE` or `DROP POLICY`
3. Data changes may require manual correction

### Environment Variable Rollback

If a misconfigured environment variable causes issues:

1. Go to Vercel Dashboard → **Settings → Environment Variables**
2. Update the variable to its correct value
3. Trigger a **redeploy** (Vercel caches env vars at build time for frontend variables)

---

## Monitoring Checklist

Regularly monitor the following dashboards:

### Daily

- [ ] **Vercel Function Logs** — Check for runtime errors in API routes
- [ ] **Stripe Dashboard** — Verify payments are processing, check for failed charges

### Weekly

- [ ] **Vercel Analytics** — Review pageview trends and top pages
- [ ] **Vercel Speed Insights** — Monitor Core Web Vitals (target: all green)
- [ ] **Supabase Dashboard** — Check database size, connection count, and API request volume
- [ ] **Stripe Webhooks** — Verify webhook delivery success rate (target: 100%)

### Monthly

- [ ] **Resend Dashboard** — Review email delivery rates and bounces
- [ ] **Vercel Bandwidth** — Check usage against free tier limits
- [ ] **Supabase Storage** — Monitor storage usage for exhibition images
- [ ] **Stripe Payouts** — Confirm funds are being disbursed correctly

### Alert-Worthy Events

| Event | Where to Check | Action |
|---|---|---|
| Webhook delivery failures | Stripe Dashboard → Webhooks | Check Vercel logs, verify `STRIPE_WEBHOOK_SECRET` |
| RLS policy violations (42501) | Vercel Function Logs | Verify Clerk JWT template + Supabase policies |
| Email bounces | Resend Dashboard | Verify domain DNS, check sender reputation |
| Build failures | Vercel Dashboard → Deployments | Check build logs, verify dependencies |
| Stale PENDING donations | Supabase → donations table | Run manual reconciliation or check cron logs |
