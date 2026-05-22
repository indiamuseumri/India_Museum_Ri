# Architecture

Detailed technical architecture for the India Museum & Heritage Society of Rhode Island platform.

This document covers the complete system architecture, data flows, authentication model, and security boundaries. For setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md). For a project overview, see [README.md](README.md).

---

## Table of Contents

- [System Overview](#system-overview)
- [Complete System Architecture](#complete-system-architecture)
- [Stripe Payment Flow](#stripe-payment-flow)
- [Authentication Flow](#authentication-flow)
- [Admin Panel Data Flow](#admin-panel-data-flow)
- [Database RLS Model](#database-rls-model)
- [Supabase Client Strategy](#supabase-client-strategy)
- [Vercel Serverless Architecture](#vercel-serverless-architecture)
- [Donation Reconciliation System](#donation-reconciliation-system)
- [Environment Variable Security Model](#environment-variable-security-model)
- [Storage Architecture](#storage-architecture)

---

## System Overview

The platform is a single-page React application (SPA) served by Vercel, with serverless API functions handling payment processing, webhook verification, email delivery, and automated reconciliation. All persistent data is stored in Supabase (PostgreSQL), with file uploads going to Supabase Storage. Authentication is managed by Clerk, with JWT tokens bridging Clerk sessions to Supabase RLS policies.

---

## Complete System Architecture

```mermaid
graph TD
    subgraph Client["Browser — React SPA"]
        R["React 18 + Vite"]
        RR["React Router v7"]
        CS["Clerk Session"]
        VA["Vercel Analytics"]
        VS["Vercel Speed Insights"]
    end

    subgraph Vercel["Vercel Platform"]
        CDN["Vercel CDN — Static Assets"]
        API1["POST /api/create-checkout-session"]
        API2["POST /api/stripe-webhook"]
        API3["GET /api/reconcile-donations"]
        API4["POST /api/send-donation-email"]
        API5["POST /api/send-registration-email"]
        API6["POST /api/admin/reconcile-donation"]
        CRON["Vercel Cron — Every 5 Minutes"]
    end

    subgraph External["External Services"]
        CLERK["Clerk — Authentication"]
        STRIPE["Stripe — Payments"]
        RESEND["Resend — Transactional Email"]
    end

    subgraph Database["Supabase"]
        PG["PostgreSQL — RLS Enabled"]
        STORE["Storage — exhibition-images bucket"]
    end

    R --> CDN
    R --> CS
    CS --> CLERK
    R -->|Public reads| PG
    R -->|Auth writes| PG
    R --> API1

    API1 -->|Create session| STRIPE
    API1 -->|Insert PENDING| PG
    STRIPE -->|Webhook event| API2
    API2 -->|Verify signature| STRIPE
    API2 -->|Update SUCCESS| PG
    API2 -->|Send receipt| RESEND
    CRON --> API3
    API3 -->|Query stale PENDING| PG
    API3 -->|Verify payment| STRIPE
    API3 -->|Repair status| PG
    API3 -->|Recover emails| RESEND
    API4 --> RESEND
    API5 --> RESEND
    API6 -->|Manual reconcile| STRIPE
    API6 -->|Repair| PG

    R -->|Upload images| STORE
    VA -->|Pageview tracking| Vercel
    VS -->|Web Vitals| Vercel
```

---

## Stripe Payment Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as Frontend
    participant A as /api/create-checkout-session
    participant DB as Supabase
    participant S as Stripe
    participant W as /api/stripe-webhook
    participant E as Resend Email

    U->>F: Select donation amount
    F->>F: Validate amount ($1–$10,000)
    F->>A: POST {amount, email}
    A->>A: Validate Stripe key format
    A->>S: stripe.checkout.sessions.create()
    S-->>A: Session {id, url}
    A->>DB: INSERT donations (status: PENDING)
    A-->>F: {url: checkout_url}
    F->>U: Redirect to Stripe Checkout

    U->>S: Complete payment
    S->>W: POST checkout.session.completed
    W->>W: Verify HMAC signature
    W->>DB: Check idempotency (skip if SUCCESS)
    W->>DB: UPDATE PENDING → SUCCESS
    W->>E: Send IRS receipt email
    E-->>U: Tax-deductible receipt

    Note over W: Also handles checkout.session.expired → EXPIRED
    Note over W: Also handles payment_intent.payment_failed → FAILED
```

### Fault Tolerance

The payment pipeline handles several failure modes:

| Failure | Recovery |
|---|---|
| DB insert fails before checkout | Webhook creates a fresh `SUCCESS` row when no `PENDING` row is found |
| Webhook signature invalid | Returns 400 — Stripe retries with backoff |
| Webhook DB update fails | Reconciliation cron detects stale `PENDING` and repairs via Stripe API |
| Email delivery fails | Reconciliation cron recovers unsent emails for `SUCCESS` donations |
| Webhook processing error | Always returns 200 to prevent infinite Stripe retry loops |

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as Admin User
    participant C as Clerk
    participant F as Frontend (Admin Page)
    participant S as Supabase

    U->>C: Sign in (Google OAuth)
    C-->>F: Session with user object
    F->>F: Check isAdminEmail(user.primaryEmail)
    
    alt Not authorized
        F-->>U: "Access Denied" page
    end

    F->>C: getToken({template: "supabase"})
    C-->>F: JWT signed with Supabase secret (HS256)
    F->>S: Request with Authorization: Bearer <JWT>
    S->>S: Verify JWT signature
    S->>S: Evaluate RLS policy (role = authenticated)
    S-->>F: Data response
    F-->>U: Render admin table
```

### JWT Bridge: Clerk → Supabase

The Clerk-Supabase integration uses a JWT template named `supabase` that:

1. Signs tokens with Supabase's JWT secret using **HS256**
2. Includes the `sub` claim (Clerk user ID) and `role` claim (`authenticated`)
3. Is requested via `getToken({ template: 'supabase' })` in the `useAuthenticatedSupabase` hook
4. Is passed as a Bearer token in the `Authorization` header to Supabase
5. Supabase verifies the signature and sets the request's role to `authenticated`

---

## Admin Panel Data Flow

```mermaid
graph TD
    subgraph Auth["Authentication Layer"]
        CLERK["Clerk useUser()"]
        CHECK["isAdminEmail() Check"]
    end

    subgraph Guard["Access Control"]
        ALLOW["Authorized — Render Admin"]
        DENY["Denied — Access Denied Page"]
    end

    subgraph Hook["useAuthenticatedSupabase Hook"]
        TOKEN["getToken({template: supabase})"]
        CLIENT["createClient() with Bearer JWT"]
    end

    subgraph Admin["Admin Modules"]
        EVENTS["EventManager — CRUD"]
        EXHIBIT["ExhibitionUploader — Storage + DB"]
        DONATE["DonationsTable — Read + Export"]
        REGS["RegistrationsTable — Read + Export"]
    end

    subgraph Supabase["Supabase — RLS Enforced"]
        ET["events table"]
        EI["exhibition_images table"]
        DT["donations table"]
        RT["registrations table"]
        SB["exhibition-images bucket"]
    end

    CLERK --> CHECK
    CHECK -->|Authorized| ALLOW
    CHECK -->|Not authorized| DENY
    ALLOW --> TOKEN
    TOKEN --> CLIENT
    CLIENT --> EVENTS
    CLIENT --> EXHIBIT
    CLIENT --> DONATE
    CLIENT --> REGS
    EVENTS -->|INSERT/UPDATE/DELETE| ET
    EXHIBIT -->|INSERT/DELETE| EI
    EXHIBIT -->|Upload/Remove| SB
    DONATE -->|SELECT| DT
    REGS -->|SELECT + JOIN| RT
```

---

## Database RLS Model

```mermaid
graph LR
    subgraph Roles["PostgreSQL Roles"]
        ANON["anon (public)"]
        AUTH["authenticated (Clerk JWT)"]
        SERVICE["service_role (API only)"]
    end

    subgraph Tables["Tables"]
        E["events"]
        R["registrations"]
        D["donations"]
        EI["exhibition_images"]
    end

    ANON -->|SELECT| E
    ANON -->|SELECT| EI
    ANON -->|INSERT| R

    AUTH -->|SELECT, INSERT, UPDATE, DELETE| E
    AUTH -->|SELECT| R
    AUTH -->|SELECT, INSERT, UPDATE| D
    AUTH -->|SELECT, INSERT, DELETE| EI

    SERVICE -->|ALL operations — bypasses RLS| E
    SERVICE -->|ALL operations — bypasses RLS| R
    SERVICE -->|ALL operations — bypasses RLS| D
    SERVICE -->|ALL operations — bypasses RLS| EI
```

### Policy Details

| Table | `anon` (Public) | `authenticated` (Admin) | `service_role` (API) |
|---|---|---|---|
| `events` | SELECT | SELECT, INSERT, UPDATE, DELETE | All (RLS bypassed) |
| `registrations` | INSERT only | SELECT | All (RLS bypassed) |
| `donations` | None | SELECT, INSERT, UPDATE | All (RLS bypassed) |
| `exhibition_images` | SELECT | SELECT, INSERT, DELETE | All (RLS bypassed) |

> The `service_role` key is used exclusively in Vercel serverless functions (`api/` directory) and bypasses all RLS policies. It is never exposed to the frontend.

---

## Supabase Client Strategy

The application uses three distinct Supabase client configurations, each with different access levels:

### 1. Public Client (`supabase`)

```typescript
// src/lib/supabaseClient.ts
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

- **Role:** `anon`
- **Used for:** Reading events, reading exhibition images, inserting registrations
- **Access:** Governed by RLS policies for the `anon` role
- **Created:** Once, at module initialization

### 2. Authenticated Client Factory (`getAuthenticatedSupabase`)

```typescript
// src/lib/supabaseClient.ts
export const getAuthenticatedSupabase = async (getToken) => {
  const token = await getToken({ template: 'supabase' })
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
```

- **Role:** `authenticated`
- **Used for:** All admin write operations (events CRUD, exhibition uploads, viewing donations/registrations)
- **Access:** Governed by RLS policies for the `authenticated` role
- **Created:** On-demand per operation via the `useAuthenticatedSupabase` hook

### 3. Service Role Client (API Routes)

```typescript
// api/*.ts
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

- **Role:** `service_role` (bypasses RLS)
- **Used for:** Webhook processing, donation record updates, reconciliation, email tracking
- **Access:** Full database access — no RLS restrictions
- **Created:** In each API function handler, server-side only

---

## Vercel Serverless Architecture

All backend logic runs as Vercel serverless functions, defined in the `api/` directory:

| Function | Method | Purpose | Auth |
|---|---|---|---|
| `create-checkout-session` | POST | Create Stripe session + insert PENDING donation | Public (amount validated) |
| `stripe-webhook` | POST | Process Stripe events → update DB → send emails | Stripe signature (HMAC) |
| `reconcile-donations` | GET | Cron: detect stale PENDING → verify Stripe → repair | `CRON_SECRET` header |
| `send-donation-email` | POST | Standalone IRS receipt email endpoint | None (internal use) |
| `send-registration-email` | POST | Event registration confirmation email | None (internal use) |
| `admin/reconcile-donation` | POST | Manual single-donation reconciliation | `CRON_SECRET` header |

### Webhook Body Parsing

The Stripe webhook handler disables Vercel's automatic body parser to access the raw request body for signature verification:

```typescript
export const config = { api: { bodyParser: false } }
```

A custom `getRawBody()` function handles both raw stream parsing (when `bodyParser` is correctly disabled) and re-serialization (when Vercel's body parser pre-consumes the stream).

### Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/reconcile-donations",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

The reconciliation cron runs every 5 minutes, detecting donations stuck in `PENDING` status beyond a configurable threshold (default: 5 minutes). It queries Stripe for each session's true payment status and repairs the database accordingly.

---

## Donation Reconciliation System

The reconciliation system is a multi-component fault-tolerance mechanism:

```mermaid
graph TD
    CRON["Vercel Cron — Every 5 min"] --> QUERY["Query stale PENDING donations"]
    QUERY --> LOOP["For each donation"]
    LOOP --> STRIPE["Retrieve session from Stripe"]
    
    STRIPE -->|payment_status: paid| SUCCESS["Update → SUCCESS"]
    STRIPE -->|status: expired| FAILED["Update → FAILED"]
    STRIPE -->|status: open| SKIP["Skip — still in progress"]
    STRIPE -->|404 Not Found| FAIL2["Update → FAILED"]

    SUCCESS --> EMAIL{"Email sent?"}
    EMAIL -->|No| SEND["Send recovery receipt"]
    EMAIL -->|Yes| DONE["Done"]
    SEND --> DONE

    subgraph Recovery["Email Recovery Pass"]
        R1["Find SUCCESS rows with email_sent = false"]
        R2["Optimistic lock: set email_sent = true"]
        R3["Send receipt via Resend"]
        R4{"Sent OK?"}
        R4 -->|Yes| R5["Keep email_sent = true"]
        R4 -->|No| R6["Revert email_sent = false"]
    end

    DONE --> R1
```

### Operating Modes

| Mode | Trigger | Behavior |
|---|---|---|
| **Standard** | `GET /api/reconcile-donations` | Process PENDING donations older than 5 minutes |
| **Historical** | `GET /api/reconcile-donations?mode=historical` | Process all PENDING donations regardless of age |

---

## Environment Variable Security Model

```mermaid
graph LR
    subgraph Frontend["Frontend Bundle (Browser)"]
        V1["VITE_SUPABASE_URL"]
        V2["VITE_SUPABASE_ANON_KEY"]
        V3["VITE_CLERK_PUBLISHABLE_KEY"]
        V4["VITE_STRIPE_PUBLISHABLE_KEY"]
        V5["VITE_APP_URL"]
    end

    subgraph Backend["Server-Only (Vercel Functions)"]
        S1["SUPABASE_SERVICE_ROLE_KEY"]
        S2["CLERK_SECRET_KEY"]
        S3["STRIPE_SECRET_KEY"]
        S4["STRIPE_WEBHOOK_SECRET"]
        S5["RESEND_API_KEY"]
        S6["RESEND_FROM_EMAIL"]
        S7["CRON_SECRET"]
    end

    Frontend -.-|"Exposed via import.meta.env"| V1
    Backend -.-|"Accessed via process.env"| S1
```

**Key security boundary:** Vite only bundles environment variables prefixed with `VITE_` into the client bundle (via `import.meta.env`). All server-only secrets use `process.env` and are exclusively available in Vercel serverless functions — they are never part of the static frontend build.

---

## Storage Architecture

### Supabase Storage — `exhibition-images` Bucket

```
exhibition-images/
├── faith/          # Faith & Philosophy category
│   ├── 1716000000-abc123.jpg
│   └── ...
├── art/            # Art & Architecture category
├── music/          # Music & Dance category
├── literature/     # Literature & Languages category
└── ethnic/         # Ethnic Traditions category
```

- **Bucket visibility:** Public read (images served directly via Supabase CDN URLs)
- **Upload method:** Authenticated Supabase client via the admin ExhibitionUploader component
- **File naming:** `{timestamp}-{random}.{ext}` to prevent collisions
- **Max file size:** 10 MB (enforced client-side)
- **Accepted types:** JPEG, PNG, WebP, GIF
- **Deletion:** Both the storage file and the `exhibition_images` database row are deleted together

### Static Assets — `public/images/`

```
public/images/
├── logo.png                 # Museum logo
├── museum-hero.png          # Homepage hero background
├── leadership/              # Board member portraits
│   ├── president.jpeg
│   ├── founder.jpeg
│   ├── patron.jpeg
│   ├── treasurer.jpeg
│   ├── secretary.jpeg
│   ├── mahinder-paul.png
│   └── santosh-paul.png
└── museum-building/         # Museum building photos
```

Static assets are served directly by Vercel's CDN, compiled into the production build by Vite, and cached at the edge.
