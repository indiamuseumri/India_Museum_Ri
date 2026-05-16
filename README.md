# India Museum and Heritage Society of Rhode Island — Official Website

The digital platform for the India Museum and Heritage Society of Rhode Island, a 501(c)(3) nonprofit organization dedicated to preserving Indian art, culture, music, literature, and heritage in Providence, RI. Built with React, TypeScript, and a Vercel serverless backend, the platform powers exhibition galleries, community events, Stripe-integrated donation processing, and a secure administrative dashboard — serving as the museum's primary digital presence for cultural engagement and institutional operations.


## Project Overview

The India Museum and Heritage Society of Rhode Island preserves and celebrates the rich cultural heritage of India within the American landscape. This platform extends that mission into the digital realm, providing visitors with an immersive gateway to the museum's exhibitions, events, and community programs. From exploring curated galleries organized by cultural themes — Faith & Philosophy, Art & Architecture, Music & Dance, Literature & Languages, and Ethnic Traditions — to registering for upcoming events and making tax-deductible donations, the website serves as a living bridge between Indian heritage and the Rhode Island community.

The platform is built as a production-grade, full-stack application. The frontend is a single-page React application compiled with Vite and styled with TailwindCSS, delivering a responsive, dark-mode-enabled experience across all devices. The backend consists of Vercel serverless functions that handle secure Stripe payment processing with webhook verification, transactional email delivery via Resend, and privileged database operations through Supabase. Clerk provides authentication and session management, ensuring that administrative capabilities — event creation, exhibition uploads, donation record management — are accessible only to authorized museum staff.

Content is managed through a dedicated data layer that separates editorial content from component logic, enabling maintainability across the museum's evolving needs. The architecture follows a strict separation of concerns: public data flows through Supabase's Row Level Security policies, sensitive operations are isolated to server-side functions, and the administrative dashboard operates behind Clerk's authentication boundary.


## Key Features

### Public-Facing Experience

- **Exhibition Galleries** — Category-based gallery pages (Faith, Art, Music, Literature, Ethnic Traditions) with responsive image grids, hover animations, and a fullscreen lightbox viewer, all powered by Supabase Storage
- **Cultural Events** — Dynamic event listings fetched from Supabase with status indicators (Open, Closed, Coming Soon), category-based color coding, and featured event highlighting
- **Event Registration** — Modal-based registration workflow with UUID validation, form data capture (name, phone, preferred time), and direct database insertion
- **Stripe Donations** — Preset and custom donation amounts ($25, $50, $100, $250, $500, or custom) with client-side validation ($1–$10,000 range), Stripe Checkout redirect, and dedicated success/cancel result pages
- **Cultural Heritage Showcase** — "The Many Indias" editorial grid exploring India's cultural dimensions across faith, art, music, literature, and ethnic heritage
- **India & America Section** — Editorial content exploring the intersection of Indian heritage and American culture
- **Leadership Profiles** — Museum founder, president, secretary, treasurer, and patron profiles with portrait photography
- **Visit Information** — Museum location (58 Tell Street, Providence, RI), appointment scheduling guidance, and visitor information
- **Dark Mode** — System-preference-aware dark mode with manual toggle and localStorage persistence
- **Scroll Enhancements** — Scroll progress indicator, back-to-top button, and IntersectionObserver-powered section fade-in animations
- **Responsive Design** — Fluid layouts with CSS `clamp()` functions and responsive grid systems adapting across mobile, tablet, and desktop viewports
- **SEO Optimization** — Open Graph tags, Twitter Cards, Google structured data (Schema.org Museum type), geo meta tags, and semantic HTML

### Administrative Dashboard

- **Authentication Gate** — Clerk-protected admin routes with automatic redirect to sign-in for unauthenticated users
- **Dashboard Overview** — Summary statistics panel displaying key operational metrics
- **Event Manager** — Full CRUD interface for museum events: create, edit, delete, and toggle status (Open/Closed/Coming Soon) with paginated table view
- **Exhibition Uploader** — Category-tabbed image upload interface with file type validation (JPEG, PNG, WebP, GIF), 10MB size limit, Supabase Storage upload, and image deletion with cascading storage cleanup
- **Donations Table** — Real-time donation records with summary statistics (total raised, success/pending/failed counts), status filter pills, email/name search, pagination, session ID copy, and CSV export
- **Registrations Table** — Event registration records with name search, event filter dropdown, paginated table, and CSV export
- **Sidebar Navigation** — Persistent admin sidebar with route-based navigation across all management sections

### Technical Architecture

- **Vercel Serverless API** — Four API routes handling payment sessions, webhook processing, and email delivery
- **Supabase PostgreSQL** — Relational database with Row Level Security enforcing public read, authenticated write access patterns
- **Supabase Storage** — S3-compatible media storage for exhibition images with authenticated upload/delete operations
- **Stripe Checkout** — Server-side session creation with webhook signature verification for payment confirmation
- **Resend Email** — Transactional donation receipts and registration confirmation emails with HTML templates
- **Clerk JWT Integration** — Clerk-issued JWTs passed to Supabase for RLS policy evaluation on authenticated operations
- **TypeScript Throughout** — Strict type checking across frontend components, custom hooks, and serverless functions


## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | Component-based UI framework |
| TypeScript | Strict mode (ES2020 target) | Type-safe development with compile-time error prevention |
| Vite | 6.3.5 | Build tooling with HMR, tree shaking, and production optimization |
| TailwindCSS | 4.1.12 | Utility-first CSS framework with Vite plugin integration |
| React Router | 7.13.0 | Client-side routing for pages and admin panel |
| Motion | 12.23.24 | Animation library for UI transitions |
| Lucide React | 0.487.0 | Icon library |
| React Hot Toast | 2.6.0 | Toast notification system |
| Radix UI | Multiple primitives | Accessible, unstyled UI component primitives |

### Backend / Serverless API

| Technology | Purpose |
|---|---|
| Vercel Serverless Functions | Node.js runtime for API route execution |
| Stripe | Payment session creation and webhook signature verification |
| Supabase (server-side) | Privileged database writes using the service role client |
| Resend | Transactional email delivery for donation receipts and registration confirmations |

### Authentication

| Technology | Purpose |
|---|---|
| Clerk | User authentication, session management, JWT issuance for Supabase RLS |

### Database & Storage

| Technology | Purpose |
|---|---|
| Supabase PostgreSQL | Primary relational database for events, registrations, donations, and exhibition records |
| Supabase Storage | S3-compatible object storage for exhibition images, organized by category |

### Deployment

| Technology | Purpose |
|---|---|
| Vercel | Static frontend hosting, serverless function execution, and environment variable management |


## Frontend Architecture

The frontend follows a layered component architecture within a single-page application routed by React Router.

### Component Organization

- **Page-level components** (`src/pages/`) define top-level routes: `Admin.tsx` renders the authenticated admin dashboard, `ExhibitionGallery.tsx` renders category-specific gallery pages, and `DonationSuccess.tsx` / `DonationCancel.tsx` handle Stripe redirect results.
- **Feature components** (`src/app/components/`) compose the homepage layout in sequence: `Hero`, `CulturalGrid`, `IndiaAmerica`, `Events`, `DonationStrip`, `Visit`, `Leadership`, with `Navigation` and `Footer` framing the page. Each component accepts a `darkMode` prop for theme-aware rendering.
- **Admin components** (`src/components/admin/`) implement the management dashboard: `EventManager`, `ExhibitionUploader`, `DonationsTable`, `RegistrationsTable`, `AdminStats`, and `AdminSidebar`. These components consume the authenticated Supabase client for all data operations.
- **Data files** (`src/data/`) externalize editorial content (text, labels, descriptions) from component logic, enabling content updates without modifying component code.

### State Management

State is managed locally within components using React's `useState` and `useEffect` hooks. There is no global state management library — each component owns its data fetching, loading states, error states, and form state. Two custom hooks abstract shared concerns:

- **`useAuthenticatedSupabase`** — Wraps Clerk's `useAuth` hook to provide a `getClient()` function that returns a Supabase client with the user's Clerk JWT attached. All admin components use this hook for authenticated database operations.
- **`useIntersection`** — Provides a ref and visibility boolean using `IntersectionObserver`, used across section components to trigger scroll-reveal animations.

### Styling

The application uses TailwindCSS integrated via the `@tailwindcss/vite` plugin alongside a custom CSS design system defined in `src/styles/`. Theme tokens (colors, fonts, spacing) are established in `theme.css` with CSS custom properties, and `museum.css` provides component-specific styles including section animations and responsive utilities. Components use a mix of TailwindCSS utility classes and inline style objects with CSS `clamp()` functions for fluid responsive behavior.

### Routing

Routes are defined in `src/app/App.tsx`:

| Route | Component | Access |
|---|---|---|
| `/` | Homepage (all sections) | Public |
| `/exhibitions/:category` | ExhibitionGallery | Public |
| `/donation/success` | DonationSuccess | Public |
| `/donation/cancel` | DonationCancel | Public |
| `/admin/*` | Admin (nested routes) | Clerk-authenticated |

The admin route uses Clerk's `<SignedIn>` and `<SignedOut>` components to enforce authentication at the component level, redirecting unauthenticated visitors to the sign-in flow.


## Backend Architecture

The backend consists of four Vercel serverless functions in the `api/` directory, each handling a specific integration concern.

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/create-checkout-session` | POST | Creates a Stripe Checkout session and inserts a PENDING donation record |
| `/api/stripe-webhook` | POST | Verifies Stripe webhook signatures and updates donation records to SUCCESS |
| `/api/send-donation-email` | POST | Sends an IRS-compliant donation receipt via Resend |
| `/api/send-registration-email` | POST | Sends a registration confirmation notification via Resend |

### Donation Flow

The complete lifecycle of a donation:

1. **User selects amount** — The `DonationStrip` component validates the amount client-side ($1–$10,000) and sends a POST request to `/api/create-checkout-session`.
2. **Server validates and creates session** — The serverless function validates the amount server-side (type check, range check, format validation for the Stripe key), creates a Supabase admin client inline, inserts a `PENDING` donation record, and calls `stripe.checkout.sessions.create()` to generate a Checkout session URL.
3. **User completes payment** — The browser redirects to Stripe's hosted Checkout page. On completion, Stripe redirects to `/donation/success` or `/donation/cancel`.
4. **Webhook confirms payment** — Stripe sends a `checkout.session.completed` event to `/api/stripe-webhook`. The function reads the raw request body, verifies the signature using `STRIPE_WEBHOOK_SECRET`, extracts payment details, and updates the donation record from `PENDING` to `SUCCESS` with donor email and name.
5. **Receipt email sent** — The webhook triggers a call to `/api/send-donation-email`, which sends an HTML-formatted receipt to the donor via Resend, including the museum's tax-exempt information for IRS documentation purposes.

### Server-Side Data Access

API routes that require privileged database access create a Supabase client inline using `process.env.SUPABASE_SERVICE_ROLE_KEY`. This service role key bypasses Row Level Security, enabling the webhook to write donation records without an authenticated user session. This key exists exclusively in the serverless runtime environment — it is never present in any file that Vite processes for the browser bundle.


## Security Architecture

The platform implements a defense-in-depth security model across its frontend, backend, and data layers.

### Environment Variable Isolation

Environment variables follow a strict scoping convention:

- **`VITE_`-prefixed variables** (Supabase URL, Supabase anon key, Stripe publishable key, Clerk publishable key, App URL) are bundled into the browser application by Vite. These contain only non-sensitive, public-facing identifiers.
- **Server-only variables** (Stripe secret key, Stripe webhook secret, Supabase service role key, Clerk secret key, Resend API key) exist exclusively in the Vercel serverless runtime. They are never referenced in any file within the `src/` directory and are never included in the browser bundle.

### Payment Security

- Donation amounts are validated server-side before Stripe session creation — client-supplied values are type-checked, range-verified ($1–$10,000), and format-validated.
- Stripe webhook events are verified using `stripe.webhooks.constructEvent()` with the `STRIPE_WEBHOOK_SECRET`, ensuring that payment confirmations originate from Stripe and have not been tampered with.
- The Stripe secret key is used exclusively in serverless functions and is validated for correct format (`sk_live_` or `sk_test_` prefix) before use.

### Database Security

- The Supabase service role key, which bypasses all Row Level Security policies, is used exclusively within the `api/` serverless functions for privileged operations such as donation record creation from webhooks.
- Frontend components access Supabase through either the public anon client (for reading events and exhibitions) or an authenticated client carrying a Clerk-issued JWT (for admin write operations). Row Level Security policies at the database level enforce these access boundaries.

### Authentication Boundary

- The admin dashboard (`/admin/*`) is protected by Clerk's `<SignedIn>` and `<SignedOut>` components, which prevent rendering of administrative interfaces until the user's authentication state is confirmed.
- All admin data mutations use the `useAuthenticatedSupabase` hook, which retrieves a Clerk JWT via `getToken({ template: 'supabase' })` and injects it into the Supabase client's `Authorization` header. Supabase then validates this JWT against Clerk's JWKS endpoint before allowing the operation.

### Production Logging

Production builds contain no debug logging in the browser console — all development `console.log` statements have been removed from frontend code. Server-side API routes log only non-sensitive operational data (event types, session IDs, amounts) and never log credentials, tokens, or personally identifiable information.

### Version Control Safety

The `.gitignore` is configured to exclude all environment file variants (`.env`, `.env.local`, `.env.*`), build output, log files, cache directories, and backup files. An `.env.example` template documents all required variables with placeholder values only.


## Project Structure

```
museum-website/
├── api/                              # Vercel serverless API routes
│   ├── create-checkout-session.ts    #   Stripe Checkout session creation + PENDING record
│   ├── stripe-webhook.ts            #   Stripe webhook signature verification + SUCCESS update
│   ├── send-donation-email.ts       #   Donation receipt email via Resend
│   └── send-registration-email.ts   #   Registration confirmation email via Resend
├── public/
│   └── images/                       # Static assets
│       ├── leadership/               #   Board member and founder portraits
│       ├── museum-building/          #   Museum building photography
│       ├── logo.png                  #   Museum logo
│       └── museum-hero.png           #   Homepage hero image
├── src/
│   ├── app/
│   │   ├── App.tsx                   # Root application component with routing
│   │   └── components/              # Homepage section components
│   │       ├── Hero.tsx              #   Hero banner with museum branding
│   │       ├── CulturalGrid.tsx      #   "The Many Indias" exhibition grid
│   │       ├── IndiaAmerica.tsx      #   India & America editorial section
│   │       ├── Events.tsx            #   Event listings + registration modal
│   │       ├── DonationStrip.tsx     #   Stripe donation interface
│   │       ├── Visit.tsx             #   Visitor information and scheduling
│   │       ├── Leadership.tsx        #   Board and founder profiles
│   │       ├── Navigation.tsx        #   Header navigation with dark mode toggle
│   │       └── Footer.tsx            #   Footer with museum contact information
│   ├── components/
│   │   └── admin/                    # Admin dashboard components
│   │       ├── AdminSidebar.tsx      #   Dashboard navigation sidebar
│   │       ├── AdminStats.tsx        #   Overview statistics panel
│   │       ├── EventManager.tsx      #   Event CRUD management interface
│   │       ├── ExhibitionUploader.tsx #  Exhibition image upload + management
│   │       ├── DonationsTable.tsx    #   Donation records with filtering + export
│   │       └── RegistrationsTable.tsx #  Registration records with filtering + export
│   ├── data/                         # Externalized content data files
│   │   ├── heroContent.ts
│   │   ├── culturalGridContent.ts
│   │   ├── eventsContent.ts
│   │   ├── donationContent.ts
│   │   ├── visitContent.ts
│   │   ├── leadershipContent.ts
│   │   ├── indiaAmericaContent.ts
│   │   ├── navigationContent.ts
│   │   └── footerContent.ts
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuthenticatedSupabase.ts  # Clerk JWT → Supabase authenticated client
│   │   └── useIntersection.ts           # IntersectionObserver scroll-reveal
│   ├── lib/                          # Client initializers
│   │   └── supabaseClient.ts         #   Public + authenticated Supabase client factory
│   ├── pages/                        # Route-level page components
│   │   ├── Admin.tsx                 #   Clerk-protected admin dashboard
│   │   ├── ExhibitionGallery.tsx     #   Category gallery with lightbox
│   │   ├── DonationSuccess.tsx       #   Post-donation success page
│   │   └── DonationCancel.tsx        #   Donation cancellation page
│   ├── styles/                       # Global stylesheets
│   │   ├── index.css                 #   Entry stylesheet
│   │   ├── tailwind.css              #   TailwindCSS import
│   │   ├── theme.css                 #   Design tokens and CSS custom properties
│   │   ├── museum.css                #   Component styles and animations
│   │   └── fonts.css                 #   Font declarations
│   └── main.tsx                      # Application entry point (Clerk + Router providers)
├── .env.example                      # Environment variable template (safe to commit)
├── .gitignore                        # Version control exclusions
├── index.html                        # HTML entry with SEO meta tags and structured data
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration (strict mode, path aliases)
├── vite.config.ts                    # Vite build config (React plugin, TailwindCSS, @ alias)
└── README-ARCHITECTURE.md            # Detailed system architecture documentation
```


## Installation and Development Setup

### Prerequisites

- **Node.js** 18.x or later
- **npm** (included with Node.js)
- Active accounts on [Supabase](https://supabase.com), [Stripe](https://stripe.com), [Clerk](https://clerk.com), and [Resend](https://resend.com)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd museum-website
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the environment template and populate it with your credentials:

```bash
cp .env.example .env
```

See the [Environment Variables](#environment-variables) section below for where to find each credential.

### 4. Configure Clerk JWT Template

For Supabase authentication to function, a Clerk JWT template must be configured:

1. Navigate to the [Clerk Dashboard](https://dashboard.clerk.com) → Configure → JWT Templates
2. Create a new template using the **Supabase** preset
3. Name the template exactly `supabase` (lowercase, case-sensitive)
4. Copy the JWT Secret from Supabase Dashboard → Settings → API → JWT Settings
5. Paste it as the Signing Key in Clerk

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 6. Build for Production

```bash
npm run build
```

This produces an optimized production bundle in the `dist/` directory.

> **Note:** Vercel serverless functions in the `api/` directory are not executed by the Vite dev server. To test API routes locally, use the [Vercel CLI](https://vercel.com/docs/cli): `npx vercel dev`.


## Environment Variables

All required environment variables are documented in `.env.example`. Copy this file to `.env` and populate each value from the corresponding service dashboard.

| Variable | Required | Scope | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Frontend (public) | Supabase project URL — found in Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Yes | Frontend (public) | Supabase anonymous public key — found in Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only (secret) | Supabase service role key — bypasses RLS, used only in API routes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | Frontend (public) | Stripe publishable key — found in Stripe Dashboard → Developers → API Keys |
| `STRIPE_SECRET_KEY` | Yes | Server-only (secret) | Stripe secret key — found in Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Yes | Server-only (secret) | Stripe webhook signing secret — found in Stripe Dashboard → Developers → Webhooks |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Frontend (public) | Clerk publishable key — found in Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Yes | Server-only (secret) | Clerk secret key — found in Clerk Dashboard → API Keys |
| `RESEND_API_KEY` | Yes | Server-only (secret) | Resend API key — found in Resend Dashboard → API Keys |
| `RESEND_FROM_EMAIL` | Yes | Server-only | Verified sender email address configured in Resend |
| `VITE_APP_URL` | Yes | Frontend (public) | Production deployment URL (e.g., `https://your-domain.com`) |

> **Important:** Variables prefixed with `VITE_` are bundled into the browser application and are visible to end users. Only non-sensitive, public-facing identifiers should use this prefix. Server-only variables must never be added to a `VITE_`-prefixed variable name.


## Deployment

### Vercel Deployment

The application is designed for deployment on Vercel, which serves as both the static frontend host and the serverless function runtime.

**Initial Setup:**

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Vercel will automatically detect the Vite framework configuration
3. Configure all 11 environment variables in the Vercel Dashboard → Settings → Environment Variables
4. Deploy — subsequent pushes to the main branch will trigger automatic deployments

**Build Configuration:**

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Stripe Configuration

**Development (Test Mode):**
- Use Stripe test mode keys (`sk_test_`, `pk_test_`)
- Test payments with Stripe's [test card numbers](https://stripe.com/docs/testing)
- Configure a webhook endpoint pointing to your Vercel preview URL: `https://your-preview-url.vercel.app/api/stripe-webhook`

**Production (Live Mode):**
- Switch to Stripe live mode keys (`sk_live_`, `pk_live_`) in Vercel environment variables
- Configure a production webhook endpoint: `https://your-domain.com/api/stripe-webhook`
- Select the `checkout.session.completed` event type for the webhook
- Copy the webhook signing secret to the `STRIPE_WEBHOOK_SECRET` environment variable

> **Important:** Ensure all environment variables are configured in Vercel before the first production deployment. Missing variables will cause API route failures at runtime.


## Performance and Optimization

- **Vite Production Build** — Tree shaking, code splitting, and minification produce optimized bundles. The application compiles to approximately 114 KB CSS and 593 KB JS (gzipped: 19 KB CSS, 164 KB JS).
- **TypeScript Strict Mode** — Compile-time type checking with `strict: true` eliminates categories of runtime errors before deployment.
- **TailwindCSS Purging** — The Vite plugin automatically removes unused CSS utilities from the production bundle, delivering only the styles actually referenced in components.
- **Lazy Image Loading** — Exhibition gallery images use the `loading="lazy"` attribute for deferred loading of off-screen content.
- **Content Externalization** — Editorial content is separated into dedicated data files (`src/data/`), enabling content updates without modifying component logic and facilitating future CMS integration.
- **Clean Production Bundle** — No debug logging, development artifacts, or unnecessary console output in the production build.
- **Efficient Data Fetching** — Supabase queries select only required columns and apply server-side ordering and filtering to minimize data transfer.
- **Responsive Fluid Layouts** — CSS `clamp()` functions provide smooth scaling without discrete breakpoint jumps, reducing layout shift across viewport sizes.
- **SEO Foundation** — Comprehensive meta tags, Open Graph protocol, Twitter Cards, JSON-LD structured data (Schema.org Museum type), and geo meta tags for local search optimization.


## Future Improvements

Potential future enhancements to expand the platform's capabilities include:

- **Multilingual Support** — Hindi, Tamil, Bengali, and other Indian language translations to serve the museum's diverse community
- **Content Management System** — Integration with a headless CMS to enable non-technical staff to manage website content without code changes
- **Analytics Dashboard** — Visitor engagement metrics, donation trends, and event attendance analytics within the admin panel
- **Digital Archival System** — Digitized historical documents, photographs, and oral histories with searchable metadata
- **Online Ticketing** — Event-specific ticket sales with capacity management and QR code validation
- **Virtual Exhibitions** — 360° virtual gallery tours and remote cultural engagement experiences
- **Membership Program** — Tiered membership levels with recurring Stripe subscription payments and member-exclusive content
- **Newsletter System** — Subscriber management with automated cultural programming and exhibition announcements
- **Social Media Integration** — Event promotion, exhibition highlights, and community engagement across social platforms
- **Database-Driven Leadership Profiles** — Migration of board member and staff profiles from static data files to Supabase-managed records


## License and Copyright

© 2026 India Museum and Heritage Society of Rhode Island. All rights reserved.

This codebase was developed to support the museum's mission of preserving Indian cultural heritage in America. The India Museum and Heritage Society of Rhode Island is a 501(c)(3) nonprofit organization (EIN: 05-0505459) located at 58 Tell Street, Providence, Rhode Island.

This project incorporates open-source software libraries, each governed by their respective licenses. See `package.json` for a complete list of dependencies and `ATTRIBUTIONS.md` for additional attribution information.