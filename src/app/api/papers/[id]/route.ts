import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET Paper for Editing
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paper = await prisma.paper.findUnique({
      where: { id: params.id },
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // Check if the user is authorized to edit this paper (owner or admin)
    // Note: GET is usually fine, but let's be safe
    if (session.role !== 'ADMIN' && paper.uploaderId !== session.id) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ paper });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// UPDATE Paper
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingPaper = await prisma.paper.findUnique({ where: { id: params.id } });
    if (!existingPaper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // Authorization: Admin or Owner
    if (session.role !== 'ADMIN' && existingPaper.uploaderId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this paper' }, { status: 401 });
    }

    const formData = await request.formData();
    const pdfFile = formData.get('pdf_file') as File | null;
    
    let filePath = existingPaper.filePath;

    // Handle File Re-upload
    if (pdfFile && pdfFile.size > 0) {
      if (pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }

      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      const fileName = `${uuidv4()}.pdf`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePathLocal = path.join(uploadDir, fileName);
      fs.writeFileSync(filePathLocal, buffer);
      
      // Optional: Delete old file
      // try { fs.unlinkSync(path.join(process.cwd(), 'public', existingPaper.filePath)); } catch {}

      filePath = `/uploads/${fileName}`;
    }

    const updatedPaper = await prisma.paper.update({
      where: { id: params.id },
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
        
        filePath,
        // Keep status as PENDING if not Admin, so re-approval is needed. Or keep existing.
        // Let's reset to PENDING if student edits, for safety.
        status: session.role === 'ADMIN' ? existingPaper.status : 'PENDING',
      }
    });

    return NextResponse.json({ success: true, paper: updatedPaper });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
