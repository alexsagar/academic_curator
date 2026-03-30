import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { getTierForPriceId } from "@/lib/subscriptions";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const session = await getActiveSession();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = (await request.json()) as { priceId?: string };

  if (!priceId) {
    return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
  }

  const tier = getTierForPriceId(priceId);
  if (!tier) {
    return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;

      if (!subscription) {
        await prisma.subscription.create({
          data: {
            userId: session.user.id,
            stripeCustomerId: customerId,
            tier: "FREE",
          }
        });
      } else {
        await prisma.subscription.update({
          where: { userId: session.user.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        tier,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected Stripe checkout error";
    logger.error("Stripe Checkout Error", { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
