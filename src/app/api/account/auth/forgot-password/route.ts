import { proxyPublicJsonPost } from "@/lib/api-route";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const POST = proxyPublicJsonPost({
  endpoint: "/users/forgot-password",
  bodySchema: ForgotPasswordSchema,
});
