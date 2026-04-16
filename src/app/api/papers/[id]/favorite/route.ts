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

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_paperId: {
          userId: session.id,
          paperId: params.id
        }
      }
    });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          userId_paperId: {
            userId: session.id,
            paperId: params.id
          }
        }
      });
    } else {
      await prisma.favorite.create({
        data: {
          userId: session.id,
          paperId: params.id
        }
      });
    }

    return NextResponse.redirect(new URL(`/papers/${params.id}`, request.url));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
