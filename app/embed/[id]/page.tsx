import { createServiceClient } from '@/lib/supabase/server';
import Chat from '@/components/Chat';

export const dynamic = 'force-dynamic';

export default async function EmbedPage({ params }: { params: { id: string } }) {
  const service = createServiceClient();
  const { data: bot } = await service.from('chatbots').select('id, name, welcome_message').eq('id', params.id).single();

  if (!bot) {
    return <div className="flex h-screen items-center justify-center text-sm text-slate-500">Chatbot not found.</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-brand-600 px-4 py-3 text-white">
        <span className="font-medium">{bot.name}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <Chat chatbotId={bot.id} welcomeMessage={bot.welcome_message} compact />
      </div>
      <div className="border-t border-slate-100 py-1.5 text-center text-[10px] text-slate-400">
        Powered by LarpChat
      </div>
    </div>
  );
}
