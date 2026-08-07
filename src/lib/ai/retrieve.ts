import 'server-only';
import { prisma } from '@/lib/prisma';

export interface RetrievedChunk {
  sourceType: string;
  sourceId: string;
  content: string;
  title: string;
  score: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function titleFor(sourceType: string, sourceId: string): Promise<string> {
  if (sourceType === 'article') {
    const a = await prisma.learningArticle.findUnique({ where: { id: sourceId }, select: { title: true } });
    return a?.title ?? 'บทความ';
  }
  if (sourceType === 'news') {
    const n = await prisma.news.findUnique({ where: { id: sourceId }, select: { title: true } });
    return n?.title ?? 'ข่าวสาร';
  }
  return 'ข้อมูลโครงการ';
}

/** In-memory cosine search — dataset (articles + news + project copy) is small, no pgvector needed. */
export async function retrieveTopK(queryVector: number[], k = 5): Promise<RetrievedChunk[]> {
  const rows = await prisma.embedding.findMany();
  const scored = rows
    .map((row) => ({
      sourceType: row.sourceType,
      sourceId: row.sourceId,
      content: row.content,
      score: cosineSimilarity(queryVector, row.vector as number[]),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return Promise.all(
    scored.map(async (s) => ({ ...s, title: await titleFor(s.sourceType, s.sourceId) })),
  );
}
