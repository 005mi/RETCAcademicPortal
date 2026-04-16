import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, email, password, role, student_id, phone, notify_new_project } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    if (role === 'OUTSIDER' && !email) {
      return NextResponse.json({ error: 'บุคคลภายนอกต้องกรอกอีเมลเพื่อยืนยันตัวตน' }, { status: 400 });
    }

    if (role === 'STUDENT' && (!/^\d{11}$/.test(student_id))) {
      return NextResponse.json({ error: 'รหัสนักศึกษาต้องเป็นตัวเลข 11 หลักเท่านั้น' }, { status: 400 });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: email || 'never_match' },
          { student_id: student_id || 'never_match' }
        ]
      }
    });

    if (existing) {
      if (existing.username === username) return NextResponse.json({ error: `ชื่อผู้ใช้ "${username}" มีผู้อื่นใช้งานแล้ว` }, { status: 400 });
      if (existing.email === email) return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email: email || null,
        password_hash,
        role, // STUDENT, OUTSIDER, ADMIN
        student_id: role === 'STUDENT' ? student_id : null,
        phone: phone || null,
        notify_new_project: role === 'OUTSIDER' ? (notify_new_project || false) : false
      }
    });

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
