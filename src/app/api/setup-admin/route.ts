import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const username = 'admin';
    const password = '22222222';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create or Update Admin
    const admin = await prisma.user.upsert({
      where: { username },
      update: {
        password_hash,
        role: 'ADMIN',
      },
      create: {
        username,
        password_hash,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `บัญชีเจ้าหน้าที่ (Admin) ชื่อ "${username}" ถูกสร้าง/อัปเดตเรียบร้อยแล้ว`,
      role: admin.role
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'ไม่สามารถสร้างบัญชีได้: ' + String(error) }, { status: 500 });
  }
}
