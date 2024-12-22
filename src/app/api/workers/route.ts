import { PrismaClient } from '@prisma/client';
import { workerSchema } from '@/lib/validation';
import { authenticate } from '@/lib/auth';
import { uploadFile } from '@/lib/do-space';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Authenticate the user
    const user = await authenticate(req);

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('photo') as File;
    if (!file) {
      throw new Error('Photo is required');
    }

    const fileName = `${Date.now()}-${file.name}`;
    const photoUrl = await uploadFile(file, fileName);

    // Validate worker data
    const workerData = workerSchema.parse({
      name: formData.get('name'),
      nationalId: formData.get('nationalId'),
      serialId: formData.get('serialId'),
      jobTitle: formData.get('jobTitle'),
      description: formData.get('description'),
    });

    // Create worker with the authenticated user's ID
    const worker = await prisma.worker.create({
      data: { ...workerData, photoUrl, dataEntryId: user.id },
    });

    return new Response(JSON.stringify({ worker }), { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
}
