import { getPoll } from "@/lib/api/requests";
import { Locale } from "@/lib/types/locale";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({ params }: Props) {
  // Font loading, process.cwd() is Next.js project directory
  const { id } = await params;
  const poll = await getPoll(id);
  const font = await readFile(
    join(process.cwd(), "src/lib/fonts/IBMPlexSansArabic-SemiBold.ttf")
  );
  //

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 30,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: "IBMPlexSansArabic-SemiBold",
          backgroundImage: 'linear-gradient(180deg, rgba(191,171,219,1) 0%, rgba(217,212,231,1) 68%);',
            color: '#333',
        }}
      >
        <div style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <p>{poll.data.question.substring(0, 100)}</p>
          {poll.data.options.slice(0, 5).map((option, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #999",
                borderRadius: "4px",
                marginBottom: "10px",
                padding: "6px 10px",
                color: "#333",
                fontSize: "20px",
              }}
            >
              {option.option_text}
            </div>
          ))}
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: "IBMPlexSansArabic-SemiBold",
          data: font,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
