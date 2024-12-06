import { Metadata } from 'next'
import { api } from '@/trpc/server'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import { ConversationsList } from './components/conversations-list'
import { EmptyState } from './components/empty-state'

export const metadata: Metadata = {
  title: 'Messages',
  description: 'View your conversations and offers'
}

export default async function ChatPage() {
  const supabase = useSupabaseServer()
  const user = await checkAuth(supabase)

  const conversations = await api.chat.getConversations()

  return (
    <div className="container">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-muted-foreground">
            View your conversations and offers
          </p>
        </div>

        {conversations && conversations.length > 0 ? (
          <ConversationsList
            conversations={conversations}
            currentUserId={user.id}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}
