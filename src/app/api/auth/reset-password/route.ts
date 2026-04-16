import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { isStudent, identifier1, identifier2, newPassword } = await request.json();

    if (!identifier1 || !identifier2 || !newPassword) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    let user;
    if (isStudent) {
      // 1. Check if student_id exists
      user = await prisma.user.findFirst({ where: { student_id: identifier1 } });
      if (!user) {
        return NextResponse.json({ error: `ไม่พบรหัสนักศึกษา "${identifier1}" ในระบบ` }, { status: 400 });
      }
      // 2. Check if phone matches
      if (user.phone !== identifier2) {
        return NextResponse.json({ error: 'เบอร์โทรศัพท์ที่ระบุไม่ตรงกับข้อมูลในระบบ' }, { status: 400 });
      }
    } else {
      // 1. Check if username exists
      user = await prisma.user.findFirst({ where: { username: identifier1 } });
      if (!user) {
        return NextResponse.json({ error: `ไม่พบชื่อผู้ใช้ "${identifier1}" ในระบบ` }, { status: 400 });
      }
      // 2. Check if email matches
      if (user.email !== identifier2) {
        return NextResponse.json({ error: 'อีเมลที่ระบุไม่ตรงกับข้อมูลในระบบ' }, { status: 400 });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
