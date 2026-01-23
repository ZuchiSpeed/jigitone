import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// POST endpoint to handle Stripe webhook events
export async function POST(req: Request) {
  // Get the raw request body (Stripe sends raw text)
  const body = await req.text();

  // Get the Stripe signature header for verification
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    // Verify the webhook signature to ensure it's from Stripe
    // This prevents malicious requests
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Return error if signature verification fails
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Extract the checkout session from the event
  const session = event.data.object as Stripe.Checkout.Session;

  // Handle checkout completion (new subscription)
  if (event.type === "checkout.session.completed") {
    // Retrieve the full subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Ensure user ID exists in metadata (passed during checkout)
    if (!session.metadata?.userId) {
      return new NextResponse("No user ID in metadata", { status: 400 });
    }

    // Insert new subscription record into database
    await db.insert(userSubscription).values({
      userId: session.metadata.userId, // Link to app user
      stripeCustomerId: subscription.customer as string, // Stripe customer ID
      stripeSubscriptionId: subscription.id, // Stripe subscription ID
      stripePriceId: subscription.items.data[0].price.id, // Price/plan ID
      stripeCurrentPeriodEnd: new Date(subscription.start_date * 1000), // Convert Unix timestamp to Date
    });
  }

  // Handle successful recurring payment
  if (event.type === "invoice.payment_succeeded") {
    // Retrieve subscription details
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update existing subscription record with new billing period
    await db
      .update(userSubscription)
      .set({
        stripePriceId: subscription.items.data[0].price.id, // Update price ID (in case plan changed)
        stripeCurrentPeriodEnd: new Date(
          subscription.billing_cycle_anchor * 1000 // New billing cycle start
        ),
      })
      .where(eq(userSubscription.stripeCustomerId, subscription.id)); // Find by customer ID
  }

  // Return 200 to acknowledge receipt
  return new NextResponse(null, { status: 200 });
}
