import fs from 'fs';
import path from 'path';

/**
 * Storage Utility to handle file uploads to either local filesystem 
 * or Supabase Storage depending on the environment.
 */

const IS_PROD = process.env.NODE_ENV === 'production';

export interface StorageResult {
  filePath: string; // The path to store in the DB
  url: string;      // The accessible URL
}

export async function uploadFile(file: File | Buffer, fileName: string, mimeType: string): Promise<StorageResult> {
  const bucketName = 'papers'; // Make sure this bucket exists in Supabase
  
  if (IS_PROD || process.env.ENABLE_CLOUD_STORAGE === 'true') {
    // SUPABASE STORAGE LOGIC
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing in production');
    }
    
    const url = `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`;
    const buffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer());

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': mimeType,
        'x-upsert': 'true'
      },
      body: new Uint8Array(buffer)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase upload error:', err);
      throw new Error(`Failed to upload to Supabase: ${response.statusText}`);
    }

    // Public URL construction (assuming the bucket is public)
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;
    
    return {
      filePath: fileName,
      url: publicUrl
    };
  } else {
    // LOCAL STORAGE LOGIC
    const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const localPath = path.join(uploadDir, fileName);
    fs.writeFileSync(localPath, buffer);
    
    return {
      filePath: `/uploads/${fileName}`,
      url: `/uploads/${fileName}`
    };
  }
}

export async function getFileBuffer(filePath: string): Promise<Buffer> {
  if (filePath.startsWith('/uploads/')) {
    // LOCAL FILE
    const fullPath = path.join(process.cwd(), 'public', filePath);
    return fs.readFileSync(fullPath);
  } else {
    // CLOUD FILE
    const supabaseUrl = process.env.SUPABASE_URL;
    const bucketName = 'papers';
    const url = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file from storage');
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
