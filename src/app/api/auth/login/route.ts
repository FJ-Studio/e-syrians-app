import { PrismaClient } from "@prisma/client";
import { verifyPassword, generateToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();

    // Validate input
    const data = loginSchema.parse(body);

    // Find user
    const user = await prisma.dataEntry.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.password);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });
    return new Response(JSON.stringify({ token, user }), { status: 200 });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}
