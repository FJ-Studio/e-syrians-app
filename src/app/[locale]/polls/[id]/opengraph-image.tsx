import { Locale } from '@/lib/types/locale';
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

export const runtime = 'nodejs'

// Image metadata
export const alt = 'E-SYRIANS Poll'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({ params }: Props) {
  // Font loading, process.cwd() is Next.js project directory
  const { id } = await params;

  let question = 'E-SYRIANS Poll';
  try {
    const res = await fetch(`${process.env.API_URL}/polls/${id}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-cache',
    });
    if (res.ok) {
      const poll = await res.json();
      question = poll?.data?.question || question;
    }
  } catch {
    // Fall back to default question text
  }
  const ibmSemiBold = await readFile(
    join(process.cwd(), 'src/lib/fonts/IBMPlexSansArabic-SemiBold.ttf')
  )
 
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 48,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {question}
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: 'IBM Plex Sans Arabic',
          data: ibmSemiBold,
          style: 'normal',
          weight: 600,
        },
      ],
    }
  )
}
