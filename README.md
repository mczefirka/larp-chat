# LarpChat 🦜💬

**Turn your company docs into a chatbot.** Upload your PDFs and LarpChat builds a ChatGPT-style assistant that answers from your knowledge — with sources cited. Use it in-app, or embed it on any website with one line of HTML.

> This is an MVP demo. Billing is **mocked** (no real payments), but the full product loop works: **sign up → upload PDF → chat with citations → grab embed code → live widget**.

---

## ✨ Features

- **Email/password auth** (Supabase)
- **PDF ingestion pipeline** — parse → chunk → embed (Gemini `gemini-embedding-001`) → store in pgvector
- **RAG chat with streaming** — grounded answers via `gemini-2.5-flash`, with **source citations** (filename · page)
- **Embeddable widget** — a public `/embed/{id}` page + copy-paste `<iframe>` snippet
- **Pricing & gating** — Free / Pro / Enterprise showcased on the landing page; one **real enforced limit**: 3 documents on Free. Billing is mocked.
- **Endpoint protection** — in-memory rate limiting on the public chat API

## 🖼️ Screenshots

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed;">
  <tr>
    <td colspan="2" align="center" style="padding: 0;"><img src="docs/screenshots/LarpChat — Turn your docs into a chatbot 1.png" width="75%" alt="LarpChat landing page" style="display: block; margin: 0 auto;"></td>
  </tr>
  <tr>
    <td width="50%" style="padding: 0;"><img src="docs/screenshots/LarpChat — Turn your docs into a chatbot 2.png" width="100%" alt="LarpChat authentication" style="display: block;"></td>
    <td width="50%" style="padding: 0;"><img src="docs/screenshots/LarpChat — Turn your docs into a chatbot 3.png" width="100%" alt="LarpChat dashboard" style="display: block;"></td>
  </tr>
</table>

## 🧱 Tech stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Supabase** — Auth, Postgres + pgvector, Storage
- **Google Gemini** — embeddings + chat

---

## 🚀 Local setup

### 1. Create a Supabase project
- Go to [supabase.com](https://supabase.com), create a free project.
- In **SQL Editor**, paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql). This enables pgvector, creates the tables + RLS policies + the `match_chunks` function, and creates a private `documents` storage bucket.

### 2. Get your keys
- **Supabase**: Project Settings → API → copy the *Project URL*, *anon public* key, and *service_role* key.
- **Gemini**: get an API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

### 3. Configure environment
```bash
cp .env.example .env.local
```
Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Tip:** In Supabase → Authentication → Providers → Email, turn **off** "Confirm email" for the smoothest demo (instant sign-in). Otherwise users must confirm via email before signing in.

### 4. Run it
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🧭 How to use

1. Click **Build your chatbot free** → sign up.
2. On the dashboard **Documents** tab, upload a PDF (max 10MB, 3 docs on Free). Wait for the **Ready** badge.
3. Go to **Chat** and ask questions — answers cite the source document and page.
4. Open **Settings** to rename the bot, set a welcome message, and copy the **embed snippet**.
5. Paste the `<iframe>` into any website to embed the widget. (Locally, the public widget is at `/embed/{chatbot_id}`.)

---

## 💳 Pricing (mocked billing)

| Plan | Price | What you get |
|------|-------|--------------|
| **Free** | $0 | 1 chatbot, **3 documents**, citations, embeddable widget |
| **Pro** | $19/mo | Unlimited documents, no branding, priority responses |
| **Enterprise** | Custom | Multiple bots, SSO, SLA |

Only the **3-document Free limit** is actually enforced (simple `count(*)`). "Upgrade" buttons open a mock modal — no real checkout. Swapping in Stripe Checkout later is a small, isolated change.

---

## ☁️ Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com).
3. Add the same env vars (set `NEXT_PUBLIC_SITE_URL` to your Vercel URL).
4. Deploy. Add your production URL to Supabase → Authentication → URL Configuration → Redirect URLs.

---

## 📁 Project structure
```
app/
  page.tsx              # Landing page (hero, features, pricing, CTA)
  login/page.tsx        # Auth (email/password)
  auth/callback/route.ts
  app/page.tsx          # Dashboard (server: auth + auto-create chatbot)
  embed/[id]/page.tsx   # Public widget
  api/upload/route.ts   # PDF upload + embedding pipeline (3-doc + 10MB limits)
  api/chat/route.ts     # RAG chat (SSE streaming, rate-limited)
components/             # Chat, Dashboard, DocumentUpload/List, PricingTable, ...
lib/
  supabase/{client,server}.ts
  gemini.ts             # embeddings + streaming chat
  pdf.ts                # parse + chunk
supabase/schema.sql     # run this in Supabase SQL editor
```

---

## ⚠️ Notes & limitations (MVP)
- Chat history is **ephemeral** (not persisted).
- One chatbot per user.
- Rate limiting is in-memory (per server instance) — fine for a demo; use a shared store (e.g. Upstash) in production.
- PDF-only ingestion.

Built as a focused MVP — small surface area, real end-to-end functionality.
