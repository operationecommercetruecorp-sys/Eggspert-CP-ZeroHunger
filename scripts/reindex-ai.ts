import { PrismaClient } from '@prisma/client';
import { indexSource, articleIndexContent, newsIndexContent } from '../src/lib/ai/index-content';
import th from '../messages/th.json';

const prisma = new PrismaClient();

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set — nothing to index yet.');
    process.exit(1);
  }

  const [articles, news] = await Promise.all([prisma.learningArticle.findMany(), prisma.news.findMany()]);

  for (const a of articles) {
    await indexSource('article', a.id, articleIndexContent(a));
    console.log('indexed article:', a.title);
  }
  for (const n of news) {
    await indexSource('news', n.id, newsIndexContent(n));
    console.log('indexed news:', n.title);
  }

  const projectCopy = [th.projTitle, th.projSummary, th.projFull1, th.projFull2].join('\n\n');
  await indexSource('project', 'project-overview', projectCopy);
  console.log('indexed project overview');

  console.log(`Done — ${articles.length} articles, ${news.length} news, 1 project overview.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
