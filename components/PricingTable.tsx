'use client';
import { useState } from 'react';
import { Check, X } from 'lucide-react';

const tiers = [
  { name: 'Free', price: '$0', period: 'forever', cta: 'Start free',
    features: ['1 chatbot', '3 documents', 'Answer citations', 'Embeddable widget', 'Community support'],
    highlight: false, plan: 'free' },
  { name: 'Pro', price: '$19', period: 'per month', cta: 'Upgrade to Pro',
    features: ['Everything in Free', 'Unlimited documents', 'Remove "Powered by" branding', 'Priority AI responses', 'Email support'],
    highlight: true, plan: 'pro' },
  { name: 'Enterprise', price: 'Custom', period: 'let\'s talk', cta: 'Contact sales',
    features: ['Everything in Pro', 'Multiple chatbots', 'SSO & audit logs', 'Dedicated infra', 'SLA & onboarding'],
    highlight: false, plan: 'enterprise' },
];

export default function PricingTable() {
  const [modal, setModal] = useState<string | null>(null);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
      {tiers.map((t) => (
        <div key={t.name} className={'flex flex-col rounded-2xl border p-6 ' + (t.highlight ? 'border-brand-500 bg-brand-50/40 shadow-lg ring-1 ring-brand-200' : 'border-slate-200 bg-white')}>
          {t.highlight && <span className="mb-2 inline-block w-fit rounded-full bg-brand-600 px-3 py-0.5 text-xs font-medium text-white">Most popular</span>}
          <h3 className="text-lg font-semibold text-slate-900">{t.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{t.price}</span>
            <span className="text-sm text-slate-500">/ {t.period}</span>
          </div>
          <ul className="mt-5 flex-1 space-y-2.5">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 shrink-0 text-brand-600" size={16} /> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => (t.plan === 'free' ? (window.location.href = '/login') : setModal(t.name))}
            className={'mt-6 rounded-xl px-4 py-2.5 text-sm font-medium transition ' + (t.highlight ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-slate-300 text-slate-700 hover:bg-slate-50')}
          >
            {t.cta}
          </button>
        </div>
      ))}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(null)} className="ml-auto block text-slate-400 hover:text-slate-600"><X size={18} /></button>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">🚀</div>
            <h4 className="text-lg font-semibold text-slate-900">{modal} is coming soon</h4>
            <p className="mt-2 text-sm text-slate-600">
              This is a demo MVP — billing is mocked, so no real payment is taken. In production this would open a secure checkout.
            </p>
            <button onClick={() => setModal(null)} className="mt-5 w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
