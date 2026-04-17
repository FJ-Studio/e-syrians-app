import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * POST /api/donate/checkout
 *
 * Creates a Stripe Checkout session for one-time donations.
 * Accepts an amount (in USD cents) and redirects the donor to Stripe.
 *
 * On error the response includes an `errorCode` key so the client can
 * resolve a translated message via next-intl.
 */
export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ errorCode: "stripe_not_configured" }, { status: 503 });
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (!amount || amount < 100) {
      return NextResponse.json({ errorCode: "min_amount" }, { status: 400 });
    }

    if (amount > 999900) {
      return NextResponse.json({ errorCode: "max_amount" }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);

    const origin = req.headers.get("origin") ?? req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to E-Syrians",
              description: "Thank you for supporting the Syrian community!",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/account/donate?status=success`,
      cancel_url: `${origin}/account/donate?status=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ errorCode: "checkout_failed" }, { status: 500 });
  }
}
