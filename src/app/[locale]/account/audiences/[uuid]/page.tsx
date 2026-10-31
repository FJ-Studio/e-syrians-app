import AudienceDetail from "@/components/account/dashboard/audiences/audience-detail";
import { getAudience } from "@/lib/api/requests";
import { Locale } from "@/lib/types/locale";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: Locale; uuid: string }>;
};

export default async function AudienceDetailPage({ params }: Props) {
  const { uuid } = await params;
  const res = await getAudience(uuid);
  if (!res?.data) {
    notFound();
  }

  return <AudienceDetail audience={res.data} />;
}
