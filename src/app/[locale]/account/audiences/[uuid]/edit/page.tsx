import AudienceForm from "@/components/account/dashboard/audiences/audience-form";
import { getAudience } from "@/lib/api/requests";
import { Locale } from "@/lib/types/locale";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: Locale; uuid: string }>;
};

export default async function EditAudiencePage({ params }: Props) {
  const { uuid } = await params;
  const res = await getAudience(uuid);
  if (!res?.data) {
    notFound();
  }

  return <AudienceForm mode="edit" audience={res.data} />;
}
