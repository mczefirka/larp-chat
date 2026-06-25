import pdf from 'pdf-parse';

export interface Chunk {
  content: string;
  page_number: number;
}

// Parse a PDF buffer into text + page count.
export async function parsePdf(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  const data = await pdf(buffer);
  return { text: data.text || '', pageCount: data.numpages || 0 };
}

// Split text into ~500 char chunks with 100 char overlap.
// page_number is approximated proportionally across the document.
export function chunkText(text: string, pageCount: number, size = 500, overlap = 100): Chunk[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const chunks: Chunk[] = [];
  let start = 0;
  const total = clean.length;
  while (start < total) {
    const end = Math.min(start + size, total);
    const content = clean.slice(start, end).trim();
    if (content.length > 0) {
      const ratio = start / total;
      const page = Math.max(1, Math.min(pageCount || 1, Math.floor(ratio * (pageCount || 1)) + 1));
      chunks.push({ content, page_number: page });
    }
    if (end >= total) break;
    start += size - overlap;
  }
  return chunks;
}
