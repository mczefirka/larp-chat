'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function EmbedCode({ chatbotId }: { chatbotId: string }) {
  const [copied, setCopied] = useState(false);
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const snippet = `<iframe\n  src="${base}/embed/${chatbotId}"\n  width="400"\n  height="600"\n  style="border:none;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.12)"\n></iframe>`;

  function copy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="relative">
        <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">{snippet}</pre>
        <button onClick={copy} className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20">
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">Paste this snippet into any website's HTML to embed your chatbot.</p>
    </div>
  );
}
