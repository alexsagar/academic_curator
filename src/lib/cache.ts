/**
 * Cache utilities built on Next.js `revalidateTag`.
 *
 * Centralizes cache tag definitions so invalidation is type-safe
 * and easy to find across the codebase.
 *
 * Next.js 16 requires a second `profile` argument for revalidateTag.
 * We use "max" (stale-while-revalidate) as the default profile.
 */

import { revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  /** All template listings. */
  templates: "templates" as const,

  /** A specific public portfolio by slug. */
  portfolio: (slug: string) => `portfolio:${slug}` as const,
} as const;

/** Invalidate all cached template listings (stale-while-revalidate). */
export function revalidateTemplates(): void {
  revalidateTag(CACHE_TAGS.templates, "max");
}

/** Invalidate a cached public portfolio (stale-while-revalidate). */
export function revalidatePortfolio(slug: string): void {
  revalidateTag(CACHE_TAGS.portfolio(slug), "max");
}
