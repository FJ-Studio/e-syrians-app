import SingleFeatureRequest from "@/components/feature-requests/single-feature-request";
import { getFeatureRequest } from "@/lib/api/requests";
import { Locale } from "@/lib/types/locale";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const feature = await getFeatureRequest(id);
  if (!feature?.data) {
    return { title: "Feature request not found" };
  }
  return {
    title: feature.data.title,
    description: feature.data.description.slice(0, 160),
    openGraph: {
      title: feature.data.title,
      description: feature.data.description.slice(0, 160),
      images: [
        {
          url: "https://www.e-syrians.com/e-syrians-polls-og.png",
          width: 1200,
          height: 630,
          alt: "E-SYRIANS Network",
        },
      ],
    },
  };
}

export default async function SingleFeatureRequestPage({ params }: Props) {
  const { id } = await params;
  const feature = await getFeatureRequest(id);
  if (!feature?.data) {
    notFound();
  }
  return <SingleFeatureRequest feature={feature.data} />;
}
