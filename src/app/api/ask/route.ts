import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchLearningCenter } from '@/lib/search/learningCenterSearch';

const bodySchema = z.object({ question: z.string().min(1).max(500) });

// Public endpoint — the homepage "ask the Eggspert" panel. No auth: anyone may ask.
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const result = await searchLearningCenter(parsed.data.question);
    return NextResponse.json({ configured: true, ...result });
  } catch (err) {
    console.error('searchLearningCenter failed:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
