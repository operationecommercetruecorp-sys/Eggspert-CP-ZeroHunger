import 'server-only';
import { getOpenAI, EMBEDDING_MODEL, CHAT_MODEL } from './client';
import { retrieveTopK } from './retrieve';

export interface AskResult {
  configured: boolean;
  answer: string;
  citations: string[];
}

const SYSTEM_PROMPT = `You are "the Eggspert", an assistant embedded on the CP Foundation's egg-knowledge website for
teachers and students. You may answer ONLY using the CONTEXT chunks provided in the user message — never from
general knowledge. If the context does not contain the answer, say plainly that you don't have that information
on this site yet (in the same language as the question). Keep answers concise (2-4 sentences). Reply in the same
language the question was asked in (Thai or English). Respond as JSON: {"answer": string, "usedSources": string[]}
where usedSources lists the exact titles (from the CONTEXT headers) you actually drew from — omit sources you
didn't use, and return an empty array if you couldn't answer from the context.`;

export async function askEggspert(question: string): Promise<AskResult> {
  const openai = getOpenAI();
  if (!openai) {
    return { configured: false, answer: '', citations: [] };
  }

  const embedRes = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: question });
  const queryVector = embedRes.data[0].embedding;

  const chunks = await retrieveTopK(queryVector, 5);
  const context = chunks.map((c, i) => `[${i + 1}] ${c.title}\n${c.content}`).join('\n\n');

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `CONTEXT:\n${context || '(no content available)'}\n\nQUESTION: ${question}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  let parsed: { answer?: string; usedSources?: string[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { answer: raw, usedSources: [] };
  }

  const validTitles = new Set(chunks.map((c) => c.title));
  const citations = (parsed.usedSources ?? []).filter((title) => validTitles.has(title));

  return { configured: true, answer: parsed.answer ?? '', citations };
}
