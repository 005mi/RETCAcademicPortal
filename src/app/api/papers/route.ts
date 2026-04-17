import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { uploadFile } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const yearStr = searchParams.get('year') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '18', 10);
    const skip = (page - 1) * limit;

    const where: any = { status: 'PUBLISHED' };

    if (search) {
      where.OR = [
        { title_th: { contains: search } },
        { student_name: { contains: search } }
      ];
    }
    
    if (department) {
      where.department = department;
    }
    
    if (yearStr) {
      where.academicYear = parseInt(yearStr, 10);
    }

    // Get total count for pagination
    const totalCount = await prisma.paper.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    const academicYearsRaw = await prisma.paper.findMany({
      where: { status: 'PUBLISHED' },
      select: { academicYear: true },
      distinct: ['academicYear'],
      orderBy: { academicYear: 'desc' }
    });
    const academicYears = academicYearsRaw.map(p => p.academicYear);

    const papers = await prisma.paper.findMany({
      where,
      include: {
        ratings: true,
      },
      orderBy: [
        { academicYear: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit,
    });

    return NextResponse.json({ 
      papers, 
      academicYears,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'STUDENT' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Support both direct file upload (legacy/small files) and pre-uploaded path (large files)
    let filePath = formData.get('filePath') as string;
    
    if (!filePath) {
      const pdfFile = formData.get('pdf_file') as File;
      if (!pdfFile || pdfFile.size === 0) {
        return NextResponse.json({ error: 'PDF file is required' }, { status: 400 });
      }

      if (pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }

      const fileName = `${uuidv4()}.pdf`;
      const uploadRes = await uploadFile(pdfFile, fileName, 'application/pdf');
      filePath = uploadRes.filePath;
    }

    const paper = await prisma.paper.create({
      data: {
        title_th: formData.get('title_th') as string,
        title_en: (formData.get('title_en') as string) || null,
        department: formData.get('department') as string,
        academicYear: parseInt(formData.get('academicYear') as string, 10),
        research_type: formData.get('research_type') as string,
        
        student_name: formData.get('student_name') as string,
        researcher_co1: (formData.get('researcher_co1') as string) || null,
        researcher_co2: (formData.get('researcher_co2') as string) || null,
        organization: (formData.get('organization') as string) || 'วิทยาลัยเทคนิคร้อยเอ็ด',
        funding_by: (formData.get('funding_by') as string) || null,
        awards: (formData.get('awards') as string) || null,
        
        abstract: formData.get('abstract') as string,
        keywords: (formData.get('keywords') as string) || null,
        background: (formData.get('background') as string) || null,
        objectives: (formData.get('objectives') as string) || null,
        scope: (formData.get('scope') as string) || null,
        theory: (formData.get('theory') as string) || null,
        methodology: (formData.get('methodology') as string) || null,
        results: (formData.get('results') as string) || null,
        discussion: (formData.get('discussion') as string) || null,
        suggestions_use: (formData.get('suggestions_use') as string) || null,
        suggestions_next: (formData.get('suggestions_next') as string) || null,
        other_info: (formData.get('other_info') as string) || null,
        
        filePath: filePath,
        status: session.role === 'ADMIN' ? 'PUBLISHED' : 'PENDING',
        uploaderId: session.id,
      }
    });

    // Trigger Notification if Published immediately (Admin upload)
    if (paper.status === 'PUBLISHED') {
      const { broadcastNewPaper } = await import('@/lib/mailer');
      // Fire and forget or await? Usually better to await to ensure logs
      await broadcastNewPaper({
        id: paper.id,
        title_th: paper.title_th,
        student_name: paper.student_name
      });
    }

    return NextResponse.json({ success: true, paper });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '시스템 에러: ' + (error instanceof Error ? error.stack : String(error)) }, { status: 500 });
  }
}
