import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700">
          <Sparkles size={13} /> Your docs, instantly chattable
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Turn your company docs into a <span className="text-brand-600">chatbot</span> in minutes
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Upload your PDFs and LarpChat builds an AI assistant that answers from your knowledge —
          with sources cited. Use it in-app, or embed it on your website with one line of HTML.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-700">
            Build your chatbot free <ArrowRight size={16} />
          </Link>
          <Link href="#features" className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            See features
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">No credit card required · Free plan includes 3 documents</p>
      </div>
    </section>
  );
}
