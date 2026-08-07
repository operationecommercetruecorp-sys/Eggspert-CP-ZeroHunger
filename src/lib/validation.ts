import { z } from 'zod';

export const createStaffSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  nameTh: z.string().min(1, 'กรุณากรอกชื่อภาษาไทย'),
  nameEn: z.string().min(1, 'กรุณากรอกชื่อภาษาอังกฤษ'),
});
export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const createSchoolUserSchema = z.object({
  role: z.enum(['teacher', 'student']),
  schoolId: z.string().min(1, 'กรุณาเลือกสถานศึกษา'),
  nameTh: z.string().min(1, 'กรุณากรอกชื่อภาษาไทย'),
  nameEn: z.string().min(1, 'กรุณากรอกชื่อภาษาอังกฤษ'),
  phone: z.string().optional(),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  isMainContact: z.boolean().optional(),
});
export type CreateSchoolUserInput = z.infer<typeof createSchoolUserSchema>;

export const createSchoolSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อโรงเรียน'),
  location: z.string().min(1, 'กรุณากรอกที่ตั้ง'),
});
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;

export const createProjectResultSchema = z.object({
  updateDate: z.string().min(1),
  provinces: z.number().int().min(0),
  countries: z.number().int().min(1),
  schoolCount: z.number().int().min(0),
  studentCount: z.number().int().min(0),
  staffCount: z.number().int().min(0),
  communityCount: z.number().int().min(0),
  eggsPerCycle: z.string().min(1),
});
export type CreateProjectResultInput = z.infer<typeof createProjectResultSchema>;

export const createLearningArticleSchema = z.object({
  tag: z.string().min(1, 'กรุณากรอกหมวดหมู่'),
  title: z.string().min(1, 'กรุณากรอกหัวข้อ'),
  body: z.string().min(1, 'กรุณากรอกเนื้อหา'),
});
export type CreateLearningArticleInput = z.infer<typeof createLearningArticleSchema>;

export const emailSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
});
export type EmailInput = z.infer<typeof emailSchema>;

export const eggLogSchema = z.object({
  date: z.string().min(1),
  count: z.number().int().min(0),
});
export type EggLogInput = z.infer<typeof eggLogSchema>;

export const waterFeedLogSchema = z.object({
  date: z.string().min(1),
  type: z.enum(['water', 'feed']),
  action: z.enum(['purchase', 'usage']),
  amount: z.string().min(1, 'กรุณากรอกปริมาณ'),
});
export type WaterFeedLogInput = z.infer<typeof waterFeedLogSchema>;

export const iotReadingSchema = z.object({
  deviceId: z.string().min(1, 'กรุณาเลือกอุปกรณ์'),
  temp: z.number(),
  humidity: z.number(),
  water: z.number(),
  feed: z.number(),
});
export type IotReadingInput = z.infer<typeof iotReadingSchema>;

export const newsSchema = z.object({
  schoolId: z.string().min(1).optional(),
  title: z.string().min(1, 'กรุณากรอกหัวข้อข่าว'),
  body: z.string().min(1, 'กรุณากรอกเนื้อหาข่าว'),
});
export type NewsInput = z.infer<typeof newsSchema>;

export const syllabusSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อเอกสาร'),
  type: z.enum(['lesson_plan', 'worksheet', 'quiz']),
});
export type SyllabusInput = z.infer<typeof syllabusSchema>;

export const applicationSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อผู้สมัคร'),
  school: z.string().min(1, 'กรุณากรอกชื่อสถานศึกษา'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  address: z.string().min(1, 'กรุณากรอกที่อยู่สถานศึกษา'),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;
