import Stripe from "stripe";

// Initialize and export a Stripe client instance for the entire application
// This instance will be used to interact with Stripe API
export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
     // Specifies the Stripe API version to ensure compatibility
    apiVersion: "2025-12-15.clover",

    // Enables TypeScript type checking for Stripe responses
    typescript: true,
});