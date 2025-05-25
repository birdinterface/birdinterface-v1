import { Message } from "ai";

import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/lib/queries";
import { getTitleFromChat, groupChatsByDate } from "@/lib/server-utils";
import { Chat } from "@/lib/supabase";

// Define a type for the processed chat including the title
interface ProcessedChatForGrouping extends Chat {
  title: string;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawChats = await getChatsByUserId({ id: session.user.id });
    
    // Process chats: Parse messages and add titles
    const processedChats: ProcessedChatForGrouping[] = rawChats.map((chat) => {
      // Parse messages if they're stored as JSON string
      let messages: Message[] = [];
      if (Array.isArray(chat.messages)) {
        messages = chat.messages as Message[];
      } else if (typeof chat.messages === 'string') {
        try {
          messages = JSON.parse(chat.messages);
        } catch (e) {
          console.error('Failed to parse messages for chat:', chat.id);
          messages = [];
        }
      }
      
      const chatWithTypedMessages: Chat = { ...chat, messages };
      
      return {
        ...chatWithTypedMessages,
        title: getTitleFromChat(chatWithTypedMessages)
      };
    });

    // Group the processed chats by date
    const groupedChats = groupChatsByDate(processedChats);

    return Response.json(groupedChats);
  } catch (error) {
    console.error('Failed to get chat history:', error);
    return Response.json({ error: 'Failed to get chat history' }, { status: 500 });
  }
}
