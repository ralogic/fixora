import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { stripe } from "@/lib/stripe/client";
import { fail, ok } from "@/lib/utils/response";
import { createPaymentIntentSchema } from "@/lib/validation/booking";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createPaymentIntentSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid payload", 422, parsed.error.flatten());
    }

    const { orderId, amountPaise, currency } = parsed.data;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return fail("Order not found", 404);
    }

    if (!stripe) {
      const devIntentId = `dev_intent_${orderId}`;
      await prisma.payment.upsert({
        where: { orderId },
        create: {
          orderId,
          stripePaymentIntentId: devIntentId,
          amountPaise,
          currency,
          status: "REQUIRES_ACTION",
        },
        update: {
          amountPaise,
          currency,
          status: "REQUIRES_ACTION",
        },
      });

      return ok({
        clientSecret: "dev_client_secret",
        paymentIntentId: devIntentId,
        mode: "development",
      });
    }

    const intent = await stripe.paymentIntents.create({
      amount: amountPaise,
      currency,
      metadata: { orderId },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        stripePaymentIntentId: intent.id,
        amountPaise,
        currency,
        status: "REQUIRES_ACTION",
      },
      update: {
        stripePaymentIntentId: intent.id,
        amountPaise,
        currency,
        status: "REQUIRES_ACTION",
      },
    });

    return ok({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (error) {
    return fail("Unable to create payment intent", 500, error);
  }
}
