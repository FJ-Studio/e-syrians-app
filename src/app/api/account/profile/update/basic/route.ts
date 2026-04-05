import { NextResponse } from "next/server";
import { proxyJsonPost } from "@/lib/api-route";
import revalidateLocalePath from "@/lib/revalidate";

export const POST = proxyJsonPost({
  endpoint: "/users/update/basic-info",
  onSuccess: async (_response, session) => {
    revalidateLocalePath(`/census/v/${session.user.uuid}`);
    return NextResponse.json({}, { status: 200 });
  },
});
