import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

const globalForStripe = globalThis as unknown as {
  stripeClient: Stripe | undefined;
};

/**
 * Returns a singleton Stripe client.
 *
 * Uses the same globalThis pattern as PrismaClient to survive
 * Next.js HMR in development without creating duplicate instances.
 */
export function getStripe(): Stripe {
  if (!globalForStripe.stripeClient) {
    globalForStripe.stripeClient = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  }

  return globalForStripe.stripeClient;
}
