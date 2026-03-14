import Stripe from "stripe";

const apiVersion: Stripe.LatestApiVersion = "2026-02-25.clover";

export const stripe =
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.length > 0
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion })
    : null;
