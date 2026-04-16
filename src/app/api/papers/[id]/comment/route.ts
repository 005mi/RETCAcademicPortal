import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const formData = await request.formData();
    const content = formData.get('content') as string;

    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }

    await prisma.comment.create({
      data: {
        userId: session.id,
        paperId: params.id,
        content
      }
    });

    return NextResponse.redirect(new URL(`/papers/${params.id}`, request.url));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
