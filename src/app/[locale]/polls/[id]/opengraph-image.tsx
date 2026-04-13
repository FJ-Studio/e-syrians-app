import { Locale } from "@/lib/types/locale";
import { ImageResponse } from "next/og";

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

export const runtime = "nodejs";

// Image metadata
export const alt = "E-SYRIANS Poll";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({ params }: Props) {
  const { id } = await params;

  let question = "E-SYRIANS Poll";
  try {
    const res = await fetch(`${process.env.API_URL}/polls/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    });
    if (res.ok) {
      const poll = await res.json();
      question = poll?.data?.question || question;
    }
  } catch {
    // Fall back to default question text
  }

  // Fetch font from Google Fonts CDN (reliable in serverless environments)
  const fontResponse = await fetch(
    "https://fonts.gstatic.com/s/ibmplexsansarabic/v12/Qw3MZRtWPQCuHme67tEYUIx3Kh0PHR9N6YNe3PC5eMlAMg0.ttf",
  );
  const ibmSemiBold = await fontResponse.arrayBuffer();

  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        textAlign: "center",
      }}
    >
      {question}
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "IBM Plex Sans Arabic",
          data: ibmSemiBold,
          style: "normal",
          weight: 600,
        },
      ],
    },
  );
}
