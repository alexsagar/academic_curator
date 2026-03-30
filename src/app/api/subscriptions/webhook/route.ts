import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { getTierFromStripeSubscription } from "@/lib/subscriptions";
import { requireEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe signature";
    logger.error("Webhook signature verification failed:", { error: message });
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.metadata?.userId) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const tier = getTierFromStripeSubscription(subscription);

          if (!tier) {
            throw new Error(`Unknown Stripe price for subscription ${subscription.id}`);
          }
          
          await prisma.subscription.update({
            where: { userId: session.metadata.userId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : null,
              status: "ACTIVE",
              tier,
              currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
            },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: subscription.status === "active" ? "ACTIVE" : subscription.status === "past_due" ? "PAST_DUE" : "CANCELLED",
            tier: getTierFromStripeSubscription(subscription) ?? "FREE",
            currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: "CANCELLED",
            tier: "FREE",
          },
        });
        break;
      }
      default:
        logger.info("Unhandled event type", { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
