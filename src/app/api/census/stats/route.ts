import { NextResponse } from "next/server";

// Revalidate stats every 5 minutes — public data that doesn't change frequently
export const revalidate = 300;

export async function GET() {
  try {
    const request = await fetch(`${process.env.API_URL}/stats`, {
      next: { revalidate: 300 },
    });
    const response = await request.json();
    return NextResponse.json(response, { status: request.status });
  } catch {
    return NextResponse.json({ success: false, messages: ["Failed to fetch stats"] }, { status: 500 });
  }
}
