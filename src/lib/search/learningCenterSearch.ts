import 'server-only';
import { prisma } from '@/lib/prisma';

export interface SearchResult {
  answer: string;
  citations: string[];
}

const NGRAM_SIZE = 3;

function isThai(text: string): boolean {
  return /[฀-๿]/.test(text);
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '');
}

// Character n-grams work for both Thai (no spaces between words, so word tokenization
// doesn't apply) and English, without needing a dictionary-based word segmenter.
function ngrams(text: string, n = NGRAM_SIZE): string[] {
  const clean = normalize(text);
  if (clean.length <= n) return clean ? [clean] : [];
  const grams: string[] = [];
  for (let i = 0; i <= clean.length - n; i++) grams.push(clean.slice(i, i + n));
  return grams;
}

function overlapCount(queryGrams: string[], fieldGrams: Set<string>): number {
  let hits = 0;
  for (const g of queryGrams) if (fieldGrams.has(g)) hits++;
  return hits;
}

function excerpt(body: string, max = 140): string {
  const trimmed = body.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max).trim()}…` : trimmed;
}

/**
 * Keyword search over the Learning Center (LearningArticle rows) — no LLM involved.
 * Scores each article via character n-gram overlap between the question and its
 * title/tag/body (weighted toward title/tag), plus a bonus if the question appears
 * as a literal substring. n-grams avoid needing Thai word segmentation, since Thai
 * text has no spaces between words.
 */
export async function searchLearningCenter(question: string): Promise<SearchResult> {
  const thai = isThai(question);
  const queryClean = normalize(question);
  const queryGrams = ngrams(question);

  if (queryGrams.length === 0) {
    return {
      answer: thai
        ? 'ลองพิมพ์คำสำคัญ เช่น ชื่อเรื่องหรือหัวข้อที่สนใจ เพื่อค้นหาในคลังความรู้'
        : 'Try typing a keyword — a topic or title — to search the learning center.',
      citations: [],
    };
  }

  const articles = await prisma.learningArticle.findMany({ orderBy: { createdAt: 'desc' } });

  const scored = articles
    .map((article) => {
      const titleClean = normalize(article.title);
      const tagClean = normalize(article.tag);
      const bodyClean = normalize(article.body);

      const titleGrams = new Set(ngrams(article.title));
      const tagGrams = new Set(ngrams(article.tag));
      const bodyGrams = new Set(ngrams(article.body));

      let score =
        overlapCount(queryGrams, titleGrams) * 3 +
        overlapCount(queryGrams, tagGrams) * 2 +
        overlapCount(queryGrams, bodyGrams) * 1;

      if (queryClean.length >= 2) {
        if (titleClean.includes(queryClean)) score += 15;
        if (tagClean.includes(queryClean)) score += 10;
        if (bodyClean.includes(queryClean)) score += 5;
      }

      return { article, score };
    })
    .filter((s) => s.score >= Math.max(3, queryGrams.length * 0.3))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (scored.length === 0) {
    return {
      answer: thai
        ? 'ไม่พบบทความในคลังความรู้ที่ตรงกับคำค้นนี้ ลองใช้คำอื่นดูนะ'
        : "Couldn't find anything in the learning center matching that — try a different keyword.",
      citations: [],
    };
  }

  const intro = thai
    ? `พบ ${scored.length} บทความที่เกี่ยวข้อง:`
    : `Found ${scored.length} related article${scored.length > 1 ? 's' : ''}:`;

  const lines = scored.map(({ article }) => `• ${article.title} (${article.tag})\n  ${excerpt(article.body)}`);

  return {
    answer: [intro, ...lines].join('\n\n'),
    citations: scored.map(({ article }) => article.title),
  };
}
