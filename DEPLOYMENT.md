# Academic Curator Deployment Guide

This document outlines the architectural requirements and considerations for running the Academic Curator application in a production environment. The codebase has been updated to support horizontal scaling, stateless operation, and improved performance.

## Prerequisites

Before deploying, ensure you have the following infrastructure components prepared:

1.  **PostgreSQL Database (v15+ recommended)**
    *   The application requires a robust PostgreSQL database.
    *   **Crucial:** For multi-instance deployments (e.g., K8s, Vercel, Railway), you *must* use a connection pooler like **PgBouncer** or **Supavisor**. Set the pooled connection URL in the `DATABASE_URL_POOLED` environment variable. The worker/migration runtime still uses `DATABASE_URL`.

2.  **S3-Compatible Object Storage**
    *   User uploads (avatars, portfolio images) are no longer stored on the local filesystem to enable stateless, multi-node scaling.
    *   Supported providers: AWS S3, Cloudflare R2 (recommended for edge performance/cost), DigitalOcean Spaces, MinIO.
    *   Set `STORAGE_PROVIDER="s3"` in production.

3.  **Redis (Future-Proofing / Optional)**
    *   The application currently utilizes an in-process, memory-backed job queue for background tasks (e.g., activity logging).
    *   As traffic grows, you will need to replace `src/lib/jobs/queue.ts` with a BullMQ/Redis implementation to ensure jobs survive container restarts and scale across workers.

## Important Environment Variables

The application behavior is heavily controlled by environment variables. See `.env.example` for a complete list, but pay special attention to:

*   `STORAGE_PROVIDER`: Must be `"s3"` in production. `"local"` is strictly for development.
*   `DATABASE_URL_POOLED`: The connection URL used by the application runtime (points to your PgBouncer/Supavisor instance).
*   `LOG_LEVEL`: Set to `"info"` or `"warn"` to reduce log noise. The application now uses structured JSON logging in production environments for better interaction with log aggregators (Datadog, AWS CloudWatch).

## Deployment Steps (Generic Node.js / Docker)

The application is configured to build as a Next.js `standalone` application, which significantly reduces the final Docker image size and cold start time.

1.  **Build the application:**
    ```bash
    npm run build
    ```
    This generates an optimized production build in the `.next/standalone` directory.

2.  **Run Database Migrations:**
    *   Run migrations *before* starting the new application version.
    *   Use the direct connection URL (not the pooled one) for migrations:
    ```bash
    DATABASE_URL="postgresql://user:password@host:port/db?schema=public" npx prisma migrate deploy
    ```

3.  **Start the Server:**
    *   The standalone build entry point is `server.js`.
    ```bash
    node .next/standalone/server.js
    ```

## Observability & Health

*   **Health Check:** A lightweight health check endpoint is available at `/api/health`. Use this for load balancer probes.
*   **Logging:** All application logs are standardized. When `NODE_ENV === "production"`, logs are emitted as single-line JSON strings containing a timestamp, level, message, and `x-request-id` for correlation.

## Caching Strategy

The application makes heavy use of Next.js's native data cache (`unstable_cache` / Data Cache) to minimize database load for read-heavy operations:

*   **Templates:** The `/api/templates` endpoint is cached. It is automatically invalidated using `revalidateTag('templates')` whenever an admin modifies template settings.
*   **Portfolios:** Public portfolio pages (`/p/[slug]`) are cached. They are invalidated dynamically using `revalidateTag(portfolio:[slug])` when a user publishes/unpublishes their portfolio.

Ensure your deployment platform supports the Next.js Cache API (e.g., Vercel automatically manages this; self-hosted setups require shared cache configuration if running multiple instances).
