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
    if (!Number.isInteger(amount)) {
      return NextResponse.json({ error: "Donation amount must be a whole number of cents." }, { status: 400 });
    }
    if (!amount || amount < 100) {
      return NextResponse.json({ errorCode: "min_amount" }, { status: 400 });
    }

    if (amount > 999900) {
      return NextResponse.json({ errorCode: "max_amount" }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);

    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: "Server is misconfigured. Please try again later." }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to E-Syrians",
              description: "Thank you for supporting E-SYRIAN Network!",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/account/donate?status=success`,
      cancel_url: `${baseUrl}/account/donate?status=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ errorCode: "checkout_failed" }, { status: 500 });
  }
}
