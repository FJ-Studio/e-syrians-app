import { proxyJsonPost } from "@/lib/api-route";
import revalidateLocalePath from "@/lib/revalidate";
import { NextResponse } from "next/server";

export const POST = proxyJsonPost({
  endpoint: "/users/update/basic-info",
  onSuccess: async (_response, session) => {
    revalidateLocalePath(`/census/v/${session.user.uuid}`);
    return NextResponse.json({}, { status: 200 });
  },
});
