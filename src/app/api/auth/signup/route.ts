import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

const prisma = new PrismaClient();

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();

    // Validate input
    const data = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.dataEntry.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
      });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(data.password);
    const newUser = await prisma.dataEntry.create({
      data: { email: data.email, password: hashedPassword, name: data.name },
    });

    return new Response(JSON.stringify({ user: newUser }), { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ error: "An unknown error occurred" }), {
      status: 400,
    });
  }
}
