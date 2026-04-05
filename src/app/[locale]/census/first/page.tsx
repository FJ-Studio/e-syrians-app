import FirstRegistrants from "@/components/census/first";
import { getFirstRegistrants } from "@/lib/api/requests";

export default async function FirstRegistrantsPage() {
  const users = await getFirstRegistrants();
  return <FirstRegistrants users={users?.data ?? []} />;
}
