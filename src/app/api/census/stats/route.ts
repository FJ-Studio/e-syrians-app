import { NextResponse } from "next/server";

export async function GET() {
  const request = await fetch(`${process.env.API_URL}/stats`);
  const response = await request.json();
  return NextResponse.json(response, { status: request.status });
}
