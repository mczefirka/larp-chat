'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setBusy(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) { setError(error.message); return; }
        // try immediate sign-in (works when email confirmation is off)
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
        if (e2) { setInfo('Account created! Check your email to confirm, then sign in.'); setMode('signin'); return; }
        router.push('/app'); router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); return; }
        router.push('/app'); router.refresh();
      }
    } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="block text-center text-xl font-bold text-slate-900">Larp<span className="text-brand-600">Chat</span></Link>
        <h1 className="mt-6 text-center text-lg font-semibold text-slate-800">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          <input type="password" required placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-600">{info}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }} className="font-medium text-brand-600 hover:underline">
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  );
}
