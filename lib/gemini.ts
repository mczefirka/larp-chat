import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const EMBEDDING_DIM = 768;
const CHAT_MODEL = 'gemini-2.5-flash';
const EMBEDDING_MODEL = 'gemini-embedding-001';

// Embed a single piece of text, forced to 768 dims to match the DB schema.
export async function embedText(text: string, retries = 2): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await model.embedContent({
        content: { role: 'user', parts: [{ text }] },
        outputDimensionality: EMBEDDING_DIM,
      } as any);
      let values = res.embedding.values as number[];
      // safety: if the model ignores outputDimensionality, truncate to 768
      if (values.length > EMBEDDING_DIM) values = values.slice(0, EMBEDDING_DIM);
      return values;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastErr;
}

// Stream a chat completion grounded in the provided context chunks.
export async function* streamChat(question: string, context: string) {
  const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
  const prompt = [
    'You are a helpful assistant for a company knowledge base.',
    'Answer the user\'s question ONLY using the context below.',
    'If the answer is not in the context, say you do not have that information.',
    'Be concise and friendly.',
    '',
    'Context:',
    context || '(no relevant context found)',
    '',
    'Question: ' + question,
  ].join('\n');

  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const t = chunk.text();
    if (t) yield t;
  }
}
