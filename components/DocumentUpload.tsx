'use client';
import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

export default function DocumentUpload({ disabled, onUploaded }: { disabled: boolean; onUploaded: () => void; }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Upload failed.'); }
      else { onUploaded(); }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled || busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
        {busy ? 'Processing your PDF…' : disabled ? 'Free limit reached — upgrade to add more' : 'Click to upload a PDF'}
      </button>
      <input ref={inputRef} type="file" accept="application/pdf" hidden
        onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
