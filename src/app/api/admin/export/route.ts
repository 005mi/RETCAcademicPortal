import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const papers = await prisma.paper.findMany({
      include: { ratings: true },
      orderBy: { createdAt: 'desc' }
    });

    let csv = '\uFEFF'; 
    csv += 'ID,Title,Author,Department,Year,Status,Views,Downloads,Average Rating\n';

    for (const p of papers) {
      const avg = p.ratings.length > 0 ? (p.ratings.reduce((a,b) => a+b.score, 0) / p.ratings.length).toFixed(1) : '0';
      const escapedTitle = `"${p.title_th.replace(/"/g, '""')}"`;
      const escapedAuthor = `"${p.student_name.replace(/"/g, '""')}"`;
      csv += `${p.id},${escapedTitle},${escapedAuthor},${p.department},${p.academicYear},${p.status},${p.views},${p.downloads},${avg}\n`;
    }

    const response = new NextResponse(csv);
    response.headers.set('Content-Type', 'text/csv; charset=utf-8');
    response.headers.set('Content-Disposition', 'attachment; filename="papers_export.csv"');
    
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
