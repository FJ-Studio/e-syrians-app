import { withApiRoute, withAuthGet } from "@/lib/api-route";
import { liveVerificationEnabled, verificationEnabled } from "@/lib/identity-verification-mode";
import { NextRequest, NextResponse } from "next/server";

const endpoint = liveVerificationEnabled() ? "/users/identity-verification" : "/users/identity-sandbox";
const noStore = { "Cache-Control": "private, no-store" };
const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const missing = () => NextResponse.json({ success: false }, { status: 404, headers: noStore });

async function forward(path: string, token: string, body?: Record<string, unknown>) {
  const upstream = await fetch(`${process.env.API_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    redirect: "error",
  });
  return NextResponse.json(await upstream.json(), { status: upstream.status, headers: noStore });
}

export const GET = withAuthGet(async ({ req, routeParams, session }) => {
  if (!verificationEnabled()) return missing();
  const segments = routeParams?.segments;
  if (!segments?.length) return forward(endpoint, session.user.accessToken!);
  if (
    liveVerificationEnabled() &&
    Array.isArray(segments) &&
    segments.length === 2 &&
    segments[0] === "checkout" &&
    uuid.test(segments[1])
  ) {
    return forward(`${endpoint}/checkout/${segments[1]}`, session.user.accessToken!);
  }
  if (!Array.isArray(segments) || segments.length !== 1 || segments[0] !== "history") return missing();

  const page = req.nextUrl.searchParams.get("page") ?? "1";
  if (!/^[1-9]\d{0,4}$/.test(page) || Number(page) > 10000) {
    return NextResponse.json({ success: false }, { status: 422, headers: noStore });
  }
  return forward(`${endpoint}/history?page=${page}`, session.user.accessToken!);
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ segments?: string[] }> }) {
  if (!verificationEnabled()) return missing();
  if (
    req.headers.get("sec-fetch-site") === "cross-site" ||
    (req.headers.get("origin") && req.headers.get("origin") !== req.nextUrl.origin) ||
    req.headers.get("content-type")?.split(";")[0] !== "application/json"
  ) {
    return NextResponse.json({ success: false }, { status: 403, headers: noStore });
  }

  const { segments = [] } = await params;
  const [first, second] = segments;
  const single =
    segments.length === 1 && ["gift-code", liveVerificationEnabled() ? "checkout" : "claim"].includes(first);
  const creditAction = segments.length === 2 && ["gift", "start", "refresh"].includes(second) && uuid.test(first);
  if (!single && !creditAction) return missing();

  return withApiRoute(({ session, body }) =>
    forward(`${endpoint}/${segments.join("/")}`, session!.user.accessToken!, body),
  )(req);
}
