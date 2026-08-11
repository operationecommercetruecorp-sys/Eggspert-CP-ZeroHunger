import 'server-only';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

export async function sendPasswordResetEmail(to: string, newPassword: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping password reset email.');
    return;
  }

  const resend = new Resend(apiKey);
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'Eggspert <notifications@example.org>',
      to,
      subject: 'รีเซ็ตรหัสผ่าน Eggspert Backoffice',
      text: `มีคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี ${to}\n\nรหัสผ่านใหม่ของคุณคือ: ${newPassword}\n\nเข้าสู่ระบบที่ /backoffice/login แล้วเปลี่ยนรหัสผ่านได้ในภายหลัง หากคุณไม่ได้ขอรีเซ็ตรหัสผ่านนี้ กรุณาติดต่อผู้ดูแลระบบ`,
    });
  } catch (err) {
    console.error('Failed to send password reset email:', err);
  }
}

export async function sendNewApplicationEmail(application: { name: string; school: string; createdAt: Date }) {
  const recipients = await prisma.notificationEmail.findMany({ select: { email: true } });
  if (recipients.length === 0) return;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping new-application email notification.');
    return;
  }

  const dateStr = application.createdAt.toLocaleDateString('th-TH');
  const subject = `มีผู้สมัครใหม่ โครงการไก่ไข่เพื่ออาหารกลางวันนักเรียน วันที่ ${dateStr}`;

  const resend = new Resend(apiKey);
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'Eggspert <notifications@example.org>',
      to: recipients.map((r) => r.email),
      subject,
      text: `มีใบสมัครใหม่จาก ${application.name} (${application.school}) เมื่อวันที่ ${dateStr}\n\nดูรายละเอียดในระบบ Backoffice > ใบสมัคร`,
    });
  } catch (err) {
    console.error('Failed to send new-application email:', err);
  }
}
