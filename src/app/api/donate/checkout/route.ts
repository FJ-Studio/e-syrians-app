import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * POST /api/donate/checkout
 *
 * Creates a Stripe Checkout session for one-time donations.
 * Accepts an amount (in USD cents) and redirects the donor to Stripe.
 */
export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe is not configured. Please try again later." }, { status: 503 });
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum donation is $1.00" }, { status: 400 });
    }

    if (amount > 999900) {
      return NextResponse.json({ error: "Maximum donation is $9,999.00" }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to create checkout session. Please try again." }, { status: 500 });
  }
}
