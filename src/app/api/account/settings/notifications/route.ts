import { NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS } from "@/lib/notification-preferences";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../../auth";

const changeSchema = z
  .object({
    user_uuid: z.uuid(),
    category: z.enum(NOTIFICATION_CATEGORIES),
    channel: z.enum(NOTIFICATION_CHANNELS),
    enabled: z.boolean(),
  })
  .strict()
  .refine((value) => value.channel !== "email" || ["verifications", "account_status"].includes(value.category), {
    path: ["channel"],
  });
const headers = { "Cache-Control": "no-store, private" };

async function proxy(req: NextRequest, method: "GET" | "PATCH") {
  try {
    const session = await auth();
    if (!session?.user?.accessToken || !session.user.uuid) {
      return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401, headers });
    }
    // Another tab can replace the cookie without updating this tab's React session.
    if (req.headers.get("X-Account-UUID") !== session.user.uuid) {
      return NextResponse.json({ success: false, messages: ["account_changed"] }, { status: 409, headers });
    }
    let payload;
    if (method === "PATCH") {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ success: false, messages: ["Invalid JSON"] }, { status: 400, headers });
      }
      const parsed = changeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, messages: ["Invalid notification preference"] },
          { status: 422, headers },
        );
      }
      if (parsed.data.user_uuid !== session.user.uuid) {
        return NextResponse.json({ success: false, messages: ["account_changed"] }, { status: 409, headers });
      }
      payload = parsed.data;
    }
    const response = await fetch(`${process.env.API_URL}/users/notification-preferences`, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
    return NextResponse.json(await response.json(), { status: response.status, headers });
  } catch {
    return NextResponse.json(
      { success: false, messages: ["Notification preferences request failed"] },
      { status: 502, headers },
    );
  }
}

export const GET = (req: NextRequest) => proxy(req, "GET");
export const PATCH = (req: NextRequest) => proxy(req, "PATCH");
