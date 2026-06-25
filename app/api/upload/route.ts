import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { parsePdf, chunkText } from '@/lib/pdf';
import { embedText } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

const FREE_DOC_LIMIT = 3;
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // resolve chatbot
  const { data: bot } = await supabase.from('chatbots').select('id').eq('user_id', user.id).single();
  if (!bot) return NextResponse.json({ error: 'No chatbot found' }, { status: 400 });

  // enforce the one real limit
  const { count } = await supabase
    .from('documents').select('id', { count: 'exact', head: true }).eq('chatbot_id', bot.id);
  if ((count ?? 0) >= FREE_DOC_LIMIT) {
    return NextResponse.json(
      { error: `Free plan limit reached (${FREE_DOC_LIMIT} documents). Upgrade to Pro for unlimited documents.` },
      { status: 403 }
    );
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large. Max 10MB on this MVP.' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  // create the document row (processing)
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .insert({ chatbot_id: bot.id, filename: file.name, status: 'processing' })
    .select('id').single();
  if (docErr || !doc) return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });

  const service = createServiceClient();
  try {
    const { text, pageCount } = await parsePdf(buffer);
    const chunks = chunkText(text, pageCount);
    if (chunks.length === 0) {
      await supabase.from('documents').update({ status: 'error', page_count: pageCount }).eq('id', doc.id);
      return NextResponse.json({ error: 'No extractable text found in this PDF.' }, { status: 422 });
    }

    // optionally store the original file
    await service.storage.from('documents').upload(`${bot.id}/${doc.id}.pdf`, buffer, {
      contentType: 'application/pdf', upsert: true,
    }).catch(() => {});

    for (const c of chunks) {
      const embedding = await embedText(c.content);
      await service.from('chunks').insert({
        document_id: doc.id, content: c.content, page_number: c.page_number, embedding,
      });
    }

    await supabase.from('documents').update({ status: 'ready', page_count: pageCount }).eq('id', doc.id);
    return NextResponse.json({ ok: true, documentId: doc.id, chunks: chunks.length });
  } catch (err) {
    await supabase.from('documents').update({ status: 'error' }).eq('id', doc.id);
    return NextResponse.json({ error: 'Failed to process PDF.' }, { status: 500 });
  }
}
