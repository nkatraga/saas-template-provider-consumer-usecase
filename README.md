# SaaS Template: Provider-Consumer Use Case

A production-ready, fully generic SaaS template for any business where a **provider** serves **consumers** — tutoring, coaching, consulting, fitness, therapy, and more.

Fork this repo, rename the models to match your vertical, and ship your SaaS in days instead of months.

---

## What This Template Is

This is a complete, working Next.js application with:

- **Multi-role authentication** (Provider, Consumer, Parent, Admin)
- **Provider dashboard** with tab-based navigation (Schedule, Consumers, Past Bookings, Exchanges, Workflows, Settings)
- **Consumer dashboard** with tab-based navigation (My Bookings, Past Bookings, Find Exchange, My Exchanges, My Providers, Profile)
- **Admin panel** for managing providers, consumers, and app-wide settings
- **Booking exchange system** where consumers can swap time slots with provider approval
- **Stripe subscription billing** for providers (monthly/yearly plans with free tier)
- **Email system** with branded templates (invites, reminders, invoices, password resets)
- **Landing page, blog, tools, and comparison pages** for SEO and marketing

Everything is wired up end-to-end. The dashboards are shell placeholders — you fill in the domain-specific UI for your vertical.

---

## What You Get Out of the Box

### Authentication & Authorization
- Email/password auth with NextAuth v5 (JWT strategy)
- Email verification flow
- Password reset flow
- Role-based routing (Provider → `/dashboard/provider`, Consumer → `/dashboard/consumer`, Admin → `/admin`)
- Invite system (providers invite consumers via email link)

### Provider Features
- Consumer roster management (add, edit, remove)
- Configurable settings: exchange rules, reminder preferences, business policies
- Branding: custom logo, accent color, footer text (applied to emails)
- Subscription management via Stripe (monthly/yearly, free tier with consumer limit)
- Workflow tools: invoice generation, bulk email sending (rich text editor with TipTap)
- Profile management with image upload (Cloudinary)

### Consumer Features
- View upcoming and past bookings
- Browse and request booking exchanges with other consumers
- Profile management with image upload
- Parent role support (one parent can manage multiple consumers)

### Admin Panel
- View all providers and consumers
- Edit any user's details
- Configure app-wide settings (pricing, free tier limit, payment toggle)
- View provider settings and policies

### Infrastructure
- PostHog analytics integration
- SEO: sitemap, robots.txt, JSON-LD structured data
- Blog system (MDX with gray-matter frontmatter)
- Cloudinary image upload API
- Responsive design with Tailwind CSS v4
- Custom UI component library (Button, Card, Input, Select, Badge, Alert, Toggle, Skeleton, etc.)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Database | PostgreSQL via Prisma | Prisma 5.x |
| Auth | NextAuth.js v5 | 5.0-beta |
| Styling | Tailwind CSS | 4.x |
| Payments | Stripe | 20.x |
| Email | Nodemailer (SMTP) | 7.x |
| Rich Text | TipTap | 3.x |
| Analytics | PostHog | 1.x |
| Image Upload | Cloudinary | 2.x |
| Icons | Lucide React | 0.5x |
| Deployment | Vercel | — |

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database models (Provider, Consumer, Booking, Exchange, etc.)
│   └── seed.ts                # Seed data script
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── admin/             # Admin dashboard
│   │   ├── auth/              # Auth pages (signin, signup, verify, reset, invite)
│   │   ├── blog/              # Blog listing and post pages
│   │   ├── compare/           # Comparison page
│   │   ├── tools/             # Free tools page
│   │   ├── dashboard/
│   │   │   ├── provider/      # Provider dashboard (shell — customize this)
│   │   │   └── consumer/      # Consumer dashboard (shell — customize this)
│   │   └── api/
│   │       ├── auth/          # Auth API routes
│   │       ├── bookings/      # Booking CRUD + cancel + notes
│   │       ├── exchanges/     # Exchange request + approval flow
│   │       ├── consumers/     # Consumer roster management
│   │       ├── provider/      # Provider profile, settings, branding, invites
│   │       ├── consumer/      # Consumer profile
│   │       ├── admin/         # Admin API routes
│   │       ├── stripe/        # Stripe checkout, portal, webhook
│   │       ├── subscription/  # Subscription status check
│   │       ├── workflows/     # Invoice + bulk email
│   │       ├── reminders/     # Booking reminder cron
│   │       ├── upload/        # Cloudinary image upload
│   │       └── settings/      # Public settings
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── Navbar.tsx         # Authenticated nav bar
│   │   ├── AuthLayout.tsx     # Auth page layout
│   │   └── ...
│   └── lib/
│       ├── auth.ts            # NextAuth config
│       ├── prisma.ts          # Prisma client singleton
│       ├── email.ts           # Email templates (branded)
│       ├── stripe.ts          # Stripe client
│       ├── subscription.ts    # Subscription helpers
│       ├── types.ts           # TypeScript interfaces
│       └── ...
├── content/blog/              # MDX blog posts
├── .env.example               # Environment variable template
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local, Neon, Supabase, or Railway)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/nkatraga/saas-template-provider-consumer-usecase.git
cd saas-template-provider-consumer-usecase

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database URL, SMTP credentials, Stripe keys, etc.

# 4. Push the database schema
npx prisma db push

# 5. (Optional) Seed test data
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

---

## Customization Guide

### 1. Rename the app
- Search for `AppName` across the codebase and replace with your app name
- Update `package.json` name field
- Update `.env` values and meta descriptions

### 2. Customize the domain model
The Prisma schema uses generic names. Rename to match your vertical:

| Generic | Example: Tutoring | Example: Fitness |
|---------|------------------|-----------------|
| Provider | Tutor | Trainer |
| Consumer | Student | Client |
| Booking | Lesson | Session |
| Exchange | Swap | Reschedule |
| serviceType | Subject | WorkoutType |
| bookingDuration | lessonLength | sessionLength |

### 3. Build out the dashboards
The provider and consumer dashboards (`src/app/dashboard/provider/page.tsx` and `consumer/page.tsx`) are shell templates with tab navigation and placeholder content. Each tab renders a dashed-border card saying "Your [tab name] content here". Replace these with your domain-specific UI.

### 4. Customize the landing page
Edit `src/app/page.tsx` — the structure (hero, features, how-it-works, CTA) is ready. Just update the copy and optionally add screenshots.

### 5. Configure Stripe
Set up your Stripe products/prices and update the price IDs in `.env`. The webhook handler (`src/app/api/stripe/webhook/route.ts`) handles subscription lifecycle events automatically.

### 6. Set up email
Configure SMTP credentials in `.env`. The email system (`src/lib/email.ts`) includes branded templates for: invites, reminders, invoices, password resets, and email verification.

### 7. Deploy
```bash
# Deploy to Vercel
vercel
```

Set your environment variables in the Vercel dashboard. The build command in `package.json` handles Prisma generation and schema push automatically.

---

## License

MIT — use this template for any commercial or personal project.
