import Contributors from "@/components/feature-requests/contributors";
import CreateFeatureRequest from "@/components/feature-requests/create-feature-request";
import WhatHappensNext from "@/components/feature-requests/what-happens-next";
import { redirect } from "next/navigation";
import { auth } from "../../../../../auth";

export default async function NewFeatureRequestPage() {
  const session = await auth();
  if (!session?.user?.accessToken) {
    redirect(`/auth/sign-in?redirect=${encodeURIComponent("/feature-requests/new")}`);
  }
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 pb-10 lg:grid-cols-3 lg:gap-8 lg:pb-14">
      <div className="lg:col-span-2">
        <CreateFeatureRequest />
      </div>
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <WhatHappensNext />
        <Contributors />
      </aside>
    </div>
  );
}
