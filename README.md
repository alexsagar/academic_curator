# Academic Curator

Academic Curator is a Next.js 16 platform for students and academic professionals to build, customize, and publish portfolio websites. It combines account management, template-driven portfolio creation, version history, moderation workflows, localized UI, subscription billing, and production-oriented storage support.

## Core Capabilities

- Email/password authentication with optional Google sign-in via NextAuth
- Portfolio creation, editing, publishing, export, and version restore flows
- Admin surfaces for templates, users, moderation, analytics, and platform settings
- Stripe-based subscription checkout, billing portal access, and webhook handling
- Storage abstraction for local development and S3-compatible object storage in production
- Internationalization using `next-intl` with English and Arabic message bundles
- Prisma and PostgreSQL persistence with production deployment guidance

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma
- PostgreSQL
- NextAuth
- Stripe
- Tailwind CSS 4

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the sample environment file and fill in local values:
   ```powershell
   Copy-Item .env.example .env.local
   ```
3. Start PostgreSQL and update `DATABASE_URL` in `.env.local`.
4. Apply Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

The app runs at `http://localhost:3000` by default.

## Environment Variables

The main variables are documented in `.env.example`. Important ones:

- `DATABASE_URL` for Prisma migrations and direct database access
- `DATABASE_URL_POOLED` for pooled runtime connections in multi-instance production setups
- `NEXTAUTH_SECRET`, `AUTH_SECRET`, and `NEXTAUTH_URL` for authentication
- `STORAGE_PROVIDER` with `local` for development or `s3` for production
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and Stripe price IDs for billing
- `NEXT_PUBLIC_APP_URL` for public redirects and callback URLs
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if enabling Google sign-in

## Scripts

- `npm run dev` starts the local development server
- `npm run build` creates the production build
- `npm run start` starts the production server
- `npm run lint` runs ESLint

## Deployment

Production deployment notes, storage expectations, caching behavior, and health check details are documented in `DEPLOYMENT.md`.

For horizontally scaled deployments:

- Use PostgreSQL with a connection pooler
- Use `STORAGE_PROVIDER="s3"` and an S3-compatible bucket
- Run Prisma migrations before starting the new app version

## Project Structure

- `src/app` application routes, pages, and API handlers
- `src/components` UI, dashboard, admin, and builder components
- `src/lib` auth, storage, subscriptions, jobs, Prisma, logging, and utility modules
- `prisma` schema and migrations
- `messages` translation files
- `public` static assets
