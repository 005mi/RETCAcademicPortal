import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { isStudent, identifier1, identifier2, newPassword } = await request.json();

    if (!identifier1 || !identifier2 || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let user;
    if (isStudent) {
      // identifier1 = student_id, identifier2 = phone
      user = await prisma.user.findFirst({
        where: { student_id: identifier1, phone: identifier2, role: 'STUDENT' }
      });
    } else {
      // identifier1 = username, identifier2 = email
      user = await prisma.user.findFirst({
        where: { username: identifier1, email: identifier2 }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Identity verification failed' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
