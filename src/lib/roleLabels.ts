import type { Role } from '@prisma/client';

export const ROLE_LABEL: Record<Role, string> = {
  developer: 'นักพัฒนา (Developer)',
  admin: 'ผู้ดูแลระบบ (Admin)',
  cp: 'ผู้ใช้งาน CP',
  teacher: 'ครู',
  student: 'นักเรียน',
};

export const ROLE_SUB: Record<Role, string> = {
  developer: 'นักพัฒนา — เข้าถึงได้ทุกส่วนของระบบและโค้ด',
  admin: 'ผู้ดูแลระบบ — จัดการข้อมูลและสิทธิ์ผู้ใช้ทั้งหมด',
  cp: 'ผู้ใช้งาน CP — ดู/ส่งออกข้อมูล และจัดการสิทธิ์ครู-นักเรียน',
  teacher: 'ครู',
  student: 'นักเรียน',
};
