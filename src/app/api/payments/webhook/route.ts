import { headers } from "next/headers";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma/client";
import { stripe } from "@/lib/stripe/client";
import { fail, ok } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return fail("Stripe is not configured", 503);
  }

  try {
    const rawBody = await request.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return fail("Missing stripe signature", 400);
    }

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = intent.metadata.orderId;

      if (orderId) {
        await prisma.$transaction([
          prisma.payment.updateMany({
            where: { stripePaymentIntentId: intent.id },
            data: {
              status: "SUCCEEDED",
              paidAt: new Date(),
            },
          }),
          prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "SUCCEEDED",
              status: "COMPLETED",
              completedAt: new Date(),
              events: {
                create: {
                  type: "payment.succeeded",
                  payloadJson: { paymentIntentId: intent.id },
                },
              },
            },
          }),
        ]);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = intent.metadata.orderId;

      if (orderId) {
        await prisma.$transaction([
          prisma.payment.updateMany({
            where: { stripePaymentIntentId: intent.id },
            data: { status: "FAILED" },
          }),
          prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "FAILED",
              events: {
                create: {
                  type: "payment.failed",
                  payloadJson: { paymentIntentId: intent.id },
                },
              },
            },
          }),
        ]);
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      if (charge.payment_intent && typeof charge.payment_intent === "string") {
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: charge.payment_intent },
          data: {
            status: "REFUNDED",
            refundAmountPaise: charge.amount_refunded,
          },
        });
      }
    }

    return ok({ received: true });
  } catch (error) {
    return fail("Webhook processing failed", 400, error);
  }
}
