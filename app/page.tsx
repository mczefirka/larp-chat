import Link from 'next/link';
import { Upload, MessageSquare, Code2, Quote } from 'lucide-react';
import LandingHero from '@/components/LandingHero';
import PricingTable from '@/components/PricingTable';

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <span className="text-lg font-bold text-slate-900">Larp<span className="text-brand-600">Chat</span></span>
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="#features" className="hidden hover:text-slate-900 sm:block">Features</Link>
            <Link href="#pricing" className="hidden hover:text-slate-900 sm:block">Pricing</Link>
            <Link href="/login" className="rounded-lg bg-brand-600 px-4 py-1.5 font-medium text-white hover:bg-brand-700">Sign in</Link>
          </nav>
        </div>
      </header>

      <LandingHero />

      {/* Features */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900">Everything you need, nothing you don't</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">Three steps from a folder of PDFs to a live assistant on your site.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Upload, title: '1. Upload your docs', body: 'Drop in your PDFs — product guides, FAQs, policies. We parse and index them automatically.' },
            { icon: MessageSquare, title: '2. Chat with citations', body: 'Ask questions in a ChatGPT-style interface. Every answer is grounded in your docs and shows its sources.' },
            { icon: Code2, title: '3. Embed anywhere', body: 'Copy one line of HTML to add the chatbot to your website so your customers can self-serve.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="inline-flex rounded-xl bg-brand-100 p-3 text-brand-600"><f.icon size={20} /></span>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo placeholder */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-brand-50 p-10 text-center">
          <Quote className="mx-auto text-brand-400" size={28} />
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-700">
            "We replaced our buried help center with a LarpChat widget. Support tickets dropped and customers find answers in seconds."
          </p>
          <p className="mt-3 text-sm text-slate-500">— A founder who would love this product</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900">Simple, honest pricing</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">Start free. Upgrade when your knowledge base grows.</p>
        <div className="mt-12"><PricingTable /></div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to turn your docs into answers?</h2>
          <Link href="/login" className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-medium text-brand-700 transition hover:bg-brand-50">
            Build your chatbot free
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} LarpChat · A demo MVP — billing is mocked.
      </footer>
    </main>
  );
}
