import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/password/send-otp",
  errorMessage: "Failed to send verification code",
});
