import 'server-only';
import { prisma } from '@/lib/prisma';
import { getOpenAI, EMBEDDING_MODEL } from './client';

export type SourceType = 'article' | 'news' | 'project';

async function embed(text: string): Promise<number[] | null> {
  const openai = getOpenAI();
  if (!openai) return null;
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text });
  return res.data[0].embedding;
}

/** Upserts (or silently no-ops without an API key) the retrieval index row for one source. */
export async function indexSource(sourceType: SourceType, sourceId: string, content: string): Promise<void> {
  try {
    const vector = await embed(content);
    if (!vector) return;

    const existing = await prisma.embedding.findFirst({ where: { sourceType, sourceId } });
    if (existing) {
      await prisma.embedding.update({ where: { id: existing.id }, data: { content, vector } });
    } else {
      await prisma.embedding.create({ data: { sourceType, sourceId, content, vector } });
    }
  } catch (err) {
    console.error(`Failed to index ${sourceType}:${sourceId}`, err);
  }
}

export async function removeIndex(sourceType: SourceType, sourceId: string): Promise<void> {
  await prisma.embedding.deleteMany({ where: { sourceType, sourceId } });
}

export function articleIndexContent(article: { title: string; tag: string; body: string }): string {
  return `${article.title} (${article.tag})\n${article.body}`;
}

export function newsIndexContent(news: { title: string; body: string }): string {
  return `${news.title}\n${news.body}`;
}
