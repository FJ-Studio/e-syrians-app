import { proxyPublicJsonPost } from "@/lib/api-route";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string().min(1, "Password confirmation is required"),
});

export const POST = proxyPublicJsonPost({
  endpoint: "/users/reset-password",
  bodySchema: ResetPasswordSchema,
});
