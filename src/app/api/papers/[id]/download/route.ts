import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFileBuffer } from '@/lib/storage';
import path from 'path';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  try {
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';

    const paper = await prisma.paper.findUnique({ where: { id: params.id } });
    
    if (!paper) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const fileBuffer = await getFileBuffer(paper.filePath);
    const fileName = path.basename(paper.filePath);

    // Only increment downloads if NOT a preview AND NOT an admin
    if (!isPreview) {
      const { getSession } = require('@/lib/auth');
      const session = await getSession();
      if (session?.role !== 'ADMIN') {
        await prisma.paper.update({
          where: { id: params.id },
          data: { downloads: { increment: 1 } }
        });
      }
    }

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': isPreview 
          ? 'inline' 
          : `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
