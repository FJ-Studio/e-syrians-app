import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "../../../../../auth";

/**
 * POST /api/donate/checkout
 *
 * Creates a Stripe Checkout session for one-time donations.
 * Accepts an amount (in USD cents) and redirects the donor to Stripe.
 *
 * - Tags every session with `source: "e-syrians-donate"` so donations can be
 *   queried later via the Stripe API.
 * - If the donor is logged in, attaches their user ID and email as metadata
 *   and pre-fills the Stripe customer email.
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

    // Attempt to read the session — donation is allowed for guests too
    const session = await auth();
    const user = session?.user;

    const metadata: Record<string, string> = {
      source: "e-syrians-donate",
    };
    if (user?.uuid) metadata.user_id = user.uuid;
    if (user?.email) metadata.user_email = user.email;
    if (user?.name) metadata.user_name = [user.name, user.surname].filter(Boolean).join(" ");

    const stripe = new Stripe(secretKey);

    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: "Server is misconfigured. Please try again later." }, { status: 503 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      metadata,
      payment_intent_data: { metadata },
      ...(user?.email ? { customer_email: user.email } : {}),
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

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ errorCode: "checkout_failed" }, { status: 500 });
  }
}
