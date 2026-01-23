"use server";

import { getUserSubscription } from "@/db/queries";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";

// URL to return to after Stripe checkout/portal
const returnUrl = absoluteUrl("/shop");

// Server action to create Stripe checkout or portal session
export const createStripeUrl = async () => {
  // Get authenticated user info
  const { userId } = await auth();
  const user = await currentUser();

  // Check if user is authenticated
  if (!userId || !user) {
    return new Error("User not authorized");
  }

  // Check if user already has a subscription
  const userSubscription = await getUserSubscription();

  // If user has existing subscription, create billing portal session
  if (userSubscription && userSubscription.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId, // Existing Stripe customer
      return_url: returnUrl, // Return to shop after portal
    });

    return { data: stripeSession.url }; // URL to Stripe billing portal
  }

  // If no existing subscription, create checkout session for new subscription
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription", // Recurring subscription
    payment_method_types: ["card"], // Accept card payments
    customer_email: user.emailAddresses[0]?.emailAddress, // Pre-fill email
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "NAD", // Namibian Dollars
          product_data: {
            name: "Jigitone Premium",
            description: "Unlimited Heats", // Premium feature
          },
          unit_amount: 2000, // 20.00 NAD (in cents)
          recurring: {
            interval: "month", // Monthly subscription
          },
        },
      },
    ],
    metadata: {
      userId, // Pass user ID for webhook processing
    },
    success_url: returnUrl, // Return URL after successful payment
    cancel_url: returnUrl, // Return URL if canceled
  });

  return { data: stripeSession.url }; // URL to Stripe checkout
};
