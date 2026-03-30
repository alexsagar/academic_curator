import type Stripe from "stripe";

export const PRICE_ID_TO_TIER = {
  [process.env.STRIPE_PRICE_PROFESSIONAL ?? ""]: "PROFESSIONAL",
  [process.env.STRIPE_PRICE_INSTITUTIONAL ?? ""]: "INSTITUTIONAL",
} as const;

export type SubscriptionTier = "FREE" | "PROFESSIONAL" | "INSTITUTIONAL";

export function getTierForPriceId(priceId: string | null | undefined): SubscriptionTier | null {
  if (!priceId) {
    return null;
  }

  const tier = PRICE_ID_TO_TIER[priceId as keyof typeof PRICE_ID_TO_TIER];
  return tier ?? null;
}

export function getPriceIdForTier(tier: Exclude<SubscriptionTier, "FREE">): string | null {
  if (tier === "PROFESSIONAL") {
    return process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL ?? process.env.STRIPE_PRICE_PROFESSIONAL ?? null;
  }

  if (tier === "INSTITUTIONAL") {
    return process.env.NEXT_PUBLIC_STRIPE_PRICE_INSTITUTIONAL ?? process.env.STRIPE_PRICE_INSTITUTIONAL ?? null;
  }

  return null;
}

export function getTierFromStripeSubscription(
  subscription: Pick<Stripe.Subscription, "items">
): SubscriptionTier | null {
  const priceId = subscription.items.data[0]?.price?.id;
  return getTierForPriceId(priceId);
}
