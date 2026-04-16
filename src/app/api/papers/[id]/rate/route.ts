import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { score } = await request.json();

    if (!score || score < 1 || score > 5) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    await prisma.rating.upsert({
      where: {
        userId_paperId: {
          userId: session.id,
          paperId: params.id
        }
      },
      update: { score },
      create: {
        userId: session.id,
        paperId: params.id,
        score
      }
    });

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Attempting to delete rating: paperId=${params.id}, userId=${session.id}`);

    const result = await prisma.rating.deleteMany({
      where: {
        userId: session.id,
        paperId: params.id
      }
    });

    console.log(`Deleted ${result.count} rating(s).`);

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      paperId: params.id,
      userId: session.id
    });
  } catch (error) {
    console.error('Rating DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
