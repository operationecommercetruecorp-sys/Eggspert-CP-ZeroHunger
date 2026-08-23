import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const lessons = [
  {
    tag: 'ความรู้พื้นฐาน',
    title: 'รู้จักไข่ไก่ (บทเรียนอินเทอร์แอกทีฟ)',
    body: 'คลิกที่ไข่ไก่เพื่อดูโครงสร้างภายใน เรียนรู้ส่วนต่างๆ ของไข่แบบอินเทอร์แอกทีฟ',
    file: '1-egg-knowledge.html',
  },
  {
    tag: 'ความรู้พื้นฐาน',
    title: 'ไก่และแม่ไก่ (บทเรียนอินเทอร์แอกทีฟ)',
    body: 'แตะตัวไก่เพื่อเรียนรู้ส่วนต่างๆ ทีละส่วน เข้าใจกายวิภาคของแม่ไก่แบบง่ายๆ',
    file: '2-chicken-hen.html',
  },
  {
    tag: 'การเลี้ยง',
    title: 'การเลี้ยงแม่ไก่ (บทเรียนอินเทอร์แอกทีฟ)',
    body: 'มาจัดโรงเรือนให้แม่ไก่กันเถอะ เรียนรู้การเลี้ยงไก่ไข่แบบอินเทอร์แอกทีฟ',
    file: '3-raising-hens.html',
  },
  {
    tag: 'โภชนาการ',
    title: 'คุณค่าทางโภชนาการของไข่ (บทเรียนอินเทอร์แอกทีฟ)',
    body: 'ไข่หนึ่งฟองมีสารอาหารอะไรบ้าง สำรวจคุณค่าทางโภชนาการแบบอินเทอร์แอกทีฟ',
    file: '4-nutrition.html',
  },
];

for (const lesson of lessons) {
  const existing = await prisma.learningArticle.findFirst({ where: { title: lesson.title } });
  if (existing) {
    console.log('skip (already exists):', lesson.title);
    continue;
  }
  const article = await prisma.learningArticle.create({
    data: {
      tag: lesson.tag,
      title: lesson.title,
      body: lesson.body,
      attachments: {
        create: {
          kind: 'file',
          label: lesson.title,
          url: `/learning-pages/${lesson.file}`,
          fileType: 'html',
        },
      },
    },
  });
  console.log('created:', article.title, article.id);
}

await prisma.$disconnect();
