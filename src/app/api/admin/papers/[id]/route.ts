import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    const paper = await prisma.paper.update({
      where: { id: params.id },
      data: { status }
    });

    // Trigger Notifications if Published
    if (status === 'PUBLISHED') {
      const { broadcastNewPaper } = await import('@/lib/mailer');
      await broadcastNewPaper({
        id: paper.id,
        title_th: paper.title_th,
        student_name: paper.student_name
      });
    }

    return NextResponse.json({ success: true, paper });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.comment.deleteMany({ where: { paperId: params.id } });
    await prisma.rating.deleteMany({ where: { paperId: params.id } });
    await prisma.favorite.deleteMany({ where: { paperId: params.id } });
    await prisma.paper.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
