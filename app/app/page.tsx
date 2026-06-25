import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Dashboard from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default async function AppPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // ensure a chatbot exists for this user (auto-create on first visit)
  let { data: bot } = await supabase.from('chatbots').select('*').eq('user_id', user.id).single();
  if (!bot) {
    const { data: created } = await supabase
      .from('chatbots')
      .insert({ user_id: user.id, name: 'My Chatbot' })
      .select('*').single();
    bot = created;
  }

  const { data: docs } = await supabase
    .from('documents').select('id, filename, status, page_count')
    .eq('chatbot_id', bot!.id).order('created_at', { ascending: false });

  return <Dashboard email={user.email ?? ''} bot={bot} initialDocs={docs ?? []} />;
}
