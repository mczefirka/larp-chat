import { createServiceClient } from '@/lib/supabase/server';
import { embedText, streamChat } from '@/lib/gemini';

export const runtime = 'nodejs';

// --- simple in-memory rate limiter (per chatbot + IP) ---
type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_REQ = 20; // 20 messages / minute per chatbot+IP

function rateLimited(key: string): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > MAX_REQ;
}

export async function POST(req: Request) {
  let body: { chatbotId?: string; question?: string };
  try { body = await req.json(); } catch { return json({ error: 'Invalid body' }, 400); }
  const { chatbotId, question } = body;
  if (!chatbotId || !question) return json({ error: 'chatbotId and question are required' }, 400);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(`${chatbotId}:${ip}`)) {
    return json({ error: 'Rate limit exceeded. Please slow down.' }, 429);
  }

  const service = createServiceClient();

  // verify the chatbot exists (prevents probing of random ids)
  const { data: bot } = await service.from('chatbots').select('id').eq('id', chatbotId).single();
  if (!bot) return json({ error: 'Chatbot not found' }, 404);

  // retrieve relevant context
  let context = '';
  let citations: { filename: string; page_number: number }[] = [];
  try {
    const queryEmbedding = await embedText(question);
    const { data: matches } = await service.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      p_chatbot_id: chatbotId,
      match_threshold: 0.5,
      match_count: 5,
    });
    if (matches && matches.length) {
      context = matches.map((m: any) => m.content).join('\n---\n');
      const seen = new Set<string>();
      for (const m of matches as any[]) {
        const key = `${m.filename}#${m.page_number}`;
        if (!seen.has(key)) { seen.add(key); citations.push({ filename: m.filename, page_number: m.page_number }); }
      }
    }
  } catch {
    // continue with empty context; the model will say it lacks info
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const token of streamChat(question, context)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ citations })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Generation failed' })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*', // widget is embeddable on external sites
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}