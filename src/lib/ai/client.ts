import 'server-only';
import OpenAI from 'openai';

export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const CHAT_MODEL = 'gpt-4o-mini';

let client: OpenAI | null = null;

/** Null when OPENAI_API_KEY isn't set — every caller must handle that (no key configured yet). */
export function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new OpenAI({ apiKey });
  return client;
}
