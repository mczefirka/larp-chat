'use client';
import { Trash2, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface Doc { id: string; filename: string; status: string; page_count: number | null; }

export default function DocumentList({ docs, onDelete }: { docs: Doc[]; onDelete: (id: string) => void; }) {
  if (docs.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No documents yet. Upload your first PDF to train your chatbot!
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {docs.map((d) => (
        <li key={d.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="text-slate-400" size={18} />
            <div>
              <p className="text-sm font-medium text-slate-800">{d.filename}</p>
              <p className="text-xs text-slate-500">{d.page_count ? d.page_count + ' pages' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={d.status} />
            <button onClick={() => onDelete(d.id)} className="text-slate-400 transition hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ready') return <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"><CheckCircle2 size={12} /> Ready</span>;
  if (status === 'error') return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700"><AlertCircle size={12} /> Error</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700"><Loader2 className="animate-spin" size={12} /> Processing</span>;
}
