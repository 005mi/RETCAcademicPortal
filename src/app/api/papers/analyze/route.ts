import { NextResponse } from 'next/server';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const pdf = pdfParse.default || pdfParse;
import { analyzeResearchPaper } from '@/lib/gemini';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF (Using new v2.x Class API)
    const parser = new pdfParse.PDFParse({ data: buffer });
    const data = await parser.getText();
    const pdfText = data.text;

    // Cleanup resources
    await parser.destroy();

    if (!pdfText || pdfText.length < 100) {
      return NextResponse.json({ error: 'Could not extract enough text from PDF.' }, { status: 400 });
    }

    // Analyze with Gemini
    const result = await analyzeResearchPaper(pdfText);

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('PDF Analysis Error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze paper. ' + (error.message || '') 
    }, { status: 500 });
  }
}
