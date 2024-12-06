import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { api } from '@/trpc/server'

import { useSupabaseServer } from '@/utils/supabase/server'
import { checkAuth } from '@/utils/utils'

import { ChatProvider } from '../components/chat-context'
import { ChatWindow } from '../components/chat-window'

interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const conversation = await api.chat.getConversation({
    conversationId: params.id
  })

  if (!conversation) {
    return {
      title: 'Chat Not Found'
    }
  }

  return {
    title: `Chat - ${conversation.item?.name}`,
    description: `Chat about ${conversation.item?.name}`
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const supabase = useSupabaseServer()
  const user = await checkAuth(supabase)

  const [conversation, messages] = await Promise.all([
    api.chat.getConversation({
      conversationId: params.id
    }),
    api.chat.getMessages({
      conversationId: params.id
    })
  ])

  if (!conversation) {
    notFound()
  }

  // Verify the user is part of the conversation
  if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
    redirect('/account/chat')
  }

  return (
    <ChatProvider
      conversationId={params.id}
      itemId={conversation.item_id}
      currentUserId={user.id}
    >
      <div className="container py-8">
        <ChatWindow
          conversation={conversation}
          currentUserId={user.id}
          backUrl="/account/chat"
        />
      </div>
    </ChatProvider>
  )
}
