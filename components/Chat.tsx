'use client';
import { useRef, useState, useEffect } from 'react';
import { Send, Bot, User, FileText } from 'lucide-react';
import clsx from 'clsx';

interface Citation { filename: string; page_number: number; }
interface Message { role: 'user' | 'assistant'; content: string; citations?: Citation[]; }

export default function Chat({
  chatbotId,
  welcomeMessage = 'Ask me anything about my documents!',
  compact = false,
}: { chatbotId: string; welcomeMessage?: string; compact?: boolean; }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }, { role: 'assistant', content: '' }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId, question: q }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        setMessages((m) => updateLast(m, err.error || 'Something went wrong.', []));
        setLoading(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      let citations: Citation[] = [];
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.replace(/^data: /, '').trim();
          if (!trimmed || trimmed === '[DONE]') continue;
          try {
            const obj = JSON.parse(trimmed);
            if (obj.token) { acc += obj.token; setMessages((m) => updateLast(m, acc, citations)); }
            if (obj.citations) { citations = obj.citations; setMessages((m) => updateLast(m, acc, citations)); }
            if (obj.error) { acc = obj.error; setMessages((m) => updateLast(m, acc, [])); }
          } catch {}
        }
      }
    } catch {
      setMessages((m) => updateLast(m, 'Network error. Please try again.', []));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={clsx('flex flex-col', compact ? 'h-full' : 'h-[70vh] rounded-2xl border border-slate-200 bg-white shadow-sm')}>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex items-start gap-3 text-slate-600">
            <span className="mt-0.5 rounded-full bg-brand-100 p-2 text-brand-600"><Bot size={16} /></span>
            <p className="rounded-2xl bg-slate-100 px-4 py-2 text-sm">{welcomeMessage}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={clsx('flex items-start gap-3', m.role === 'user' && 'flex-row-reverse')}>
            <span className={clsx('mt-0.5 rounded-full p-2', m.role === 'user' ? 'bg-slate-200 text-slate-700' : 'bg-brand-100 text-brand-600')}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </span>
            <div className={clsx('max-w-[80%]')}>
              <p className={clsx('whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm', m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800')}>
                {m.content || (loading && i === messages.length - 1 ? <span className="animate-pulse-soft">…</span> : '')}
              </p>
              {m.citations && m.citations.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.citations.map((c, j) => (
                    <span key={j} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                      <FileText size={11} /> {c.filename} · p.{c.page_number}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type your question…"
            className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button onClick={send} disabled={loading || !input.trim()}
            className="rounded-full bg-brand-600 p-2.5 text-white transition hover:bg-brand-700 disabled:opacity-40">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function updateLast(m: Message[], content: string, citations: Citation[]): Message[] {
  const copy = [...m];
  const last = copy[copy.length - 1];
  if (last && last.role === 'assistant') copy[copy.length - 1] = { ...last, content, citations };
  return copy;
}
