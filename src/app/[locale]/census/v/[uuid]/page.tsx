import PublicVerify from "@/components/account/public-verify/public-verify";
import { getUser } from "@/lib/api/requests";
import { Locale } from "@/lib/types/locale";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: Locale; uuid: string }>;
};

export default async function VerifyProfilePage({ params }: Props) {
  const { uuid } = await params;
  const user = await getUser(uuid);
  if (!user.data) {
    notFound();
  }
  return <PublicVerify user={user.data} />;
}
