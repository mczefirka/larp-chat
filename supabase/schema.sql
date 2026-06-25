-- LarpChat database schema
-- Run this in the Supabase Dashboard -> SQL Editor.

-- 1. Enable pgvector
create extension if not exists vector with schema extensions;

-- 2. Core tables
create table if not exists chatbots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  name text default 'My Chatbot',
  welcome_message text default 'Ask me anything about my documents!',
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid references chatbots(id) on delete cascade,
  filename text not null,
  status text default 'processing', -- processing | ready | error
  page_count int,
  created_at timestamptz default now()
);

create table if not exists chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  page_number int,
  embedding vector(768), -- Gemini text-embedding-004
  created_at timestamptz default now()
);

-- 3. Vector similarity search (returns metadata for citations)
create or replace function match_chunks(
  query_embedding vector(768),
  p_chatbot_id uuid,
  match_threshold float default 0.5,
  match_count int default 5
) returns table (
  content text,
  filename text,
  page_number int,
  similarity float
) language plpgsql as $$
begin
  return query
  select chunks.content, documents.filename, chunks.page_number,
         1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  join documents on chunks.document_id = documents.id
  where documents.chatbot_id = p_chatbot_id
    and 1 - (chunks.embedding <=> query_embedding) > match_threshold
  order by chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 4. Row Level Security
alter table chatbots enable row level security;
alter table documents enable row level security;
alter table chunks enable row level security;

drop policy if exists "Users own their chatbots" on chatbots;
create policy "Users own their chatbots" on chatbots for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users own their docs" on documents;
create policy "Users own their docs" on documents for all
  using (chatbot_id in (select id from chatbots where user_id = auth.uid()));

drop policy if exists "Users own their chunks" on chunks;
create policy "Users own their chunks" on chunks for all
  using (document_id in (
    select id from documents where chatbot_id in (
      select id from chatbots where user_id = auth.uid()
    )
  ));

-- 5. Storage bucket for uploaded PDFs
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
