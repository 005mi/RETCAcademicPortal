/**
 * Mailer Utility for RETC Academic Portal
 * This is a mock implementation. For production, use 'nodemailer' or an API like Resend/SendGrid.
 */

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: MailOptions) {
  // In a real implementation:
  // const transporter = nodemailer.createTransport({ ... });
  // await transporter.sendMail({ from: '"RETC Portal" <noreply@retc.ac.th>', to, subject, html });

  console.log('----------------------------------------------------');
  console.log(`[SIMULATED EMAIL SENT]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body (HTML Snippet): ${html.substring(0, 200)}...`);
  console.log('----------------------------------------------------');

  return { success: true, messageId: 'simulated-id-' + Date.now() };
}


export async function notifyNewPaper(userEmail: string, paper: { id: string; title_th: string; student_name: string }) {
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const paperUrl = `${portalUrl}/papers/${paper.id}`;

  return sendEmail({
    to: userEmail,
    subject: `📢 มีผลงานวิจัยใหม่: ${paper.title_th}`,
    html: `
      <div style="font-family: 'Sarabun', sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f4c81;">มีผลงานวิจัยใหม่เผยแพร่บน RETC Academic Portal</h2>
        <p>สวัสดีครับคุณผู้ใช้งาน,</p>
        <p>เรามีผลงานวิจัยใหม่ที่เพิ่งได้รับการอนุมัติและเผยแพร่บนระบบที่คุณอาจสนใจ:</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <strong style="font-size: 1.1rem;">${paper.title_th}</strong><br/>
          <span style="color: #64748b;">โดย: ${paper.student_name}</span>
        </div>
        <a href="${paperUrl}" style="display: inline-block; background: #0f4c81; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          คลิกเพื่ออ่านผลงาน
        </a>
        <p style="margin-top: 30px; font-size: 0.85rem; color: #94a3b8;">
          หากคุณไม่ต้องการรับการแจ้งเตือนนี้อีก สามารถแก้ไขได้ในหน้าโปรไฟล์ของคุณ
        </p>
      </div>
    `
  });
}

/**
 * Broadcast notification to all subscribed outsiders
 */
export async function broadcastNewPaper(paper: { id: string; title_th: string; student_name: string }) {
  const { prisma } = await import('@/lib/prisma');
  
  const outsiders = await prisma.user.findMany({
    where: {
      role: 'OUTSIDER',
      notify_new_project: true,
      email: { not: null }
    }
  });

  console.log(`[BROADCAST] Found ${outsiders.length} subscribed outsiders for paper: ${paper.id}`);

  const results = await Promise.all(
    outsiders.map(user => {
      if (user.email) {
        return notifyNewPaper(user.email, paper);
      }
      return Promise.resolve(null);
    })
  );

  return results;
}
