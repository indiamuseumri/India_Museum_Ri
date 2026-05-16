# 🏛 India Museum System Architecture

---

## 1. System Overview

* **Project Purpose**: Digital platform for the India Museum and Heritage Society of Rhode Island to showcase exhibits, manage events, collect registrations, and process donations.
* **System Type**: Modern Full-Stack Web Application.
* **High-Level Architecture**: A decoupled architecture using a Vite-based React frontend, a Supabase backend-as-a-service (PostgreSQL, Storage, RLS), and Vercel Serverless Functions for secure third-party integrations (Stripe, Resend).

---

## 2. Tech Stack

* **Frontend**: Vite + React + TypeScript + TailwindCSS
* **Backend**: Vercel Serverless Functions (Node.js)
* **Database**: Supabase (PostgreSQL)
* **Storage**: Supabase Storage (S3-compatible)
* **Authentication**: Clerk (JWT-based integration with Supabase)
* **Payments**: Stripe (Checkout + Webhooks)
* **Email**: Resend (Transactional emails)

---

## 3. Project Structure

* **src/**: Core application logic and assets.
* **app/components/**: High-level layout and page-specific UI sections (Hero, Events, Visit).
* **components/admin/**: Protected administrative dashboard components (EventManager, DonationsTable).
* **hooks/**: Custom React hooks, notably `useAuthenticatedSupabase` for JWT-secured database access.
* **lib/**: Client initializations for Supabase (Public, Authenticated, and Admin variants).
* **api/**: Serverless backend routes handling payments, webhooks, and email logic.
* **public/**: Static assets including the museum logo and leadership portraits.

---

## 4. System Architecture Diagram

```text
[ Browser (React/Vite) ]
           │
           ├─(1) Auth Request ──> [ Clerk ]
           │                         │
           │                      (2) JWT
           │                         │
           ├─(3) Data Request ──> [ Supabase (DB/Storage) ] <──(4) RLS Verification
           │
           └─(5) API Call ──────> [ Vercel Serverless ]
                                     │
                                     ├─(6) Payments ──> [ Stripe ]
                                     └─(7) Emails ────> [ Resend ]
```

---

## 5. Authentication Flow

1. **Identity Management**: Clerk manages user sessions and administrative roles.
2. **JWT Generation**: Upon admin action, the frontend calls `getToken({ template: 'supabase' })`.
3. **Token Attachment**: The signed JWT is attached to the `Authorization: Bearer <token>` header.
4. **Client Injection**: The `getAuthenticatedSupabase` factory creates a temporary client with this header.
5. **RLS Validation**: Supabase verifies the JWT against Clerk's JWKS (RS256) to allow or deny the operation based on Row Level Security policies.

---

## 6. Data Flow

### Event Creation (Admin)
Admin fills form → `useAuthenticatedSupabase` retrieves Clerk JWT → Authenticated client performs `INSERT` on `events` table → RLS validates admin claim → UI refreshes.

### Image Upload (Admin)
File selected → `storage.upload()` called via authenticated client → Unique path generated in `exhibition-images` bucket → Public URL retrieved → Record inserted into `exhibition_images` table.

### Event Registration (Public)
Public user fills registration modal → Validation ensures valid UUID for `event_id` → Public (anon) client performs `INSERT` on `registrations` table → Success toast displayed.

### Donations Flow (Stripe)
User selects amount → Frontend calls `POST /api/create-checkout-session` → Serverless function creates `PENDING` donation record and returns Stripe URL → User completes payment → Stripe Webhook triggers `SUCCESS` update and Resend receipt email.

### Exhibition Gallery
User selects category → `ExhibitionGallery` fetches from `exhibition_images` filtered by category → Images rendered in responsive grid with lazy loading.

---

## 7. Database Design

* **events**: Master list of museum programs (ID, Title, Date, Status, Image).
* **registrations**: Captures attendee data linked via `event_id` (UUID).
* **donations**: Financial records tracking Stripe sessions, amounts, and donor PII.
* **exhibition_images**: Catalog of media assets for the virtual gallery, categorized by theme.
* **leadership_profiles**: (Planned) Board and staff details to replace current static data.

---

## 8. Supabase & RLS Model

* **Public Access**: Read-only access to `events` and `exhibition_images`; Write-only access to `registrations`.
* **Authenticated Access**: Full CRUD on all tables for users with a valid Clerk JWT.
* **RLS Enforcement**: All write operations (except registrations) are blocked at the database level unless a verified JWT is present in the request header.

---

## 9. API Architecture

* **create-checkout-session**: Orchestrates Stripe Checkout and pre-registers donations in Supabase.
* **stripe-webhook**: Critical endpoint for processing asynchronous payment results (Success/Failure).
* **send-donation-email**: Generates IRS-compliant receipts with EIN: 05-0505459.
* **send-registration-email**: Internal notification system for event sign-ups.

---

## 10. Environment Variables

### Supabase
* `VITE_SUPABASE_URL`
* `VITE_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` (Backend only)

### Clerk
* `VITE_CLERK_PUBLISHABLE_KEY`
* `CLERK_SECRET_KEY` (Backend only)

### Stripe
* `STRIPE_SECRET_KEY` (Backend only)
* `VITE_STRIPE_PUBLISHABLE_KEY`
* `STRIPE_WEBHOOK_SECRET` (Backend only)

### Resend
* `RESEND_API_KEY` (Backend only)
* `RESEND_FROM_EMAIL`

### App Config
* `VITE_APP_URL`

---

## 11. Key Issues Identified

* **JWT Misconfiguration**: Current instructions suggest HS256 manual secrets; system requires RS256 JWKS integration.
* **RLS Client Misuse**: Admin tables (Donations/Registrations) incorrectly using the public client.
* **Static Data Usage**: Leadership profiles are hardcoded instead of database-driven.
* **Config Gaps**: Stripe Webhook secret is currently a placeholder.

---

## 12. Recommended Improvements

* **Standardize JWT Flow**: Transition to Clerk RS256 JWKS for Supabase authentication.
* **Enforce Auth Client**: Refactor all admin data tables to use the authenticated Supabase client.
* **Database Migration**: Move all remaining static content (Leadership, Visit details) to Supabase tables.
* **Enhanced Error Handling**: Implement global error boundaries and detailed API response logging.

---

## 13. Deployment Architecture

* **Hosting**: Vercel (Production) for both frontend and serverless backend.
* **Domain**: Integrated with `indiamuseumri.org`.
* **Webhooks**: Stripe configured to target the Vercel `/api/stripe-webhook` endpoint.

---

## 14. Developer Notes

* **Local Dev**: Run `npm run dev` to start the Vite server.
* **Testing**: Use the Clerk test dashboard to simulate admin sign-ins.
* **Common Pitfall**: Ensure the Clerk JWT template is named exactly `supabase` (lowercase).

---

## 15. Conclusion

The architecture is modern, scalable, and follows industry standards for secure nonprofit platforms. While the structural foundation is sound, the identified security and configuration issues must be resolved before the system is considered production-ready.
