'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, MessageSquare, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import EmbedCode from './EmbedCode';
import Chat from './Chat';

const FREE_LIMIT = 3;

interface Bot { id: string; name: string; welcome_message: string; }
interface Doc { id: string; filename: string; status: string; page_count: number | null; }

export default function Dashboard({ email, bot, initialDocs }: { email: string; bot: Bot; initialDocs: Doc[]; }) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<'documents' | 'chat' | 'settings'>('documents');
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [name, setName] = useState(bot.name);
  const [welcome, setWelcome] = useState(bot.welcome_message);
  const [saved, setSaved] = useState(false);

  async function refresh() {
    const { data } = await supabase.from('documents').select('id, filename, status, page_count').eq('chatbot_id', bot.id).order('created_at', { ascending: false });
    setDocs(data ?? []);
  }
  async function del(id: string) {
    await supabase.from('documents').delete().eq('id', id);
    setDocs((d) => d.filter((x) => x.id !== id));
  }
  async function saveSettings() {
    await supabase.from('chatbots').update({ name, welcome_message: welcome }).eq('id', bot.id);
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  }
  async function signOut() { await supabase.auth.signOut(); router.push('/'); router.refresh(); }

  const atLimit = docs.length >= FREE_LIMIT;
  const tabs = [
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <span className="text-lg font-bold text-slate-900">Larp<span className="text-brand-600">Chat</span></span>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="hidden sm:block">{email}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Free plan</span>
            <button onClick={signOut} className="inline-flex items-center gap-1 hover:text-slate-900"><LogOut size={15} /> Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ' + (tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50')}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Your documents</h2>
              <span className="text-sm text-slate-500">{docs.length}/{FREE_LIMIT} used</span>
            </div>
            <DocumentUpload disabled={atLimit} onUploaded={refresh} />
            {atLimit && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">You've reached the Free limit of {FREE_LIMIT} documents. Upgrade to Pro for unlimited documents.</p>}
            <DocumentList docs={docs} onDelete={del} />
          </div>
        )}

        {tab === 'chat' && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Chat with your docs</h2>
            {docs.filter((d) => d.status === 'ready').length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Upload and process a PDF first, then chat with it here.</div>
            ) : (
              <Chat chatbotId={bot.id} welcomeMessage={welcome} />
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Chatbot name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Welcome message</label>
                <input value={welcome} onChange={(e) => setWelcome(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <button onClick={saveSettings} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">{saved ? 'Saved!' : 'Save changes'}</button>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-medium text-slate-900">Embed your chatbot</h3>
              <p className="mt-1 text-sm text-slate-500">Add this widget to any website so your visitors can ask questions.</p>
              <div className="mt-4"><EmbedCode chatbotId={bot.id} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
