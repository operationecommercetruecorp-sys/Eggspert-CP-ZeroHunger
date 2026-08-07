import 'server-only';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

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
