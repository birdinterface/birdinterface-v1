import { Message } from "ai";

import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/lib/queries";
import { getTitleFromChat, groupChatsByDate } from "@/lib/server-utils";
import { Chat } from "@/lib/supabase";

// Define a type for the processed chat including the title
// This might need adjustment based on what SidebarHistory actually needs
interface ProcessedChatForGrouping extends Chat {
  title: string;
}

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch raw chats - Assume getChatsByUserId returns an array of objects
  // where `messages` might be unknown or JSON
  const rawChats = await getChatsByUserId({ id: session.user.id! });

  // Process chats: Validate/cast messages and add titles
  const processedChats: ProcessedChatForGrouping[] = rawChats.map((chat: Chat) => {
    // Basic validation/casting - adjust if your messages are stored differently (e.g., JSON string)
    let messages: Message[] = [];
    if (Array.isArray(chat.messages)) {
      messages = chat.messages as Message[];
    } else if (typeof chat.messages === 'string') {
      try {
        messages = JSON.parse(chat.messages);
      } catch {}
    }
    const chatWithTypedMessages: Chat = { ...chat, messages };

    return {
      ...chatWithTypedMessages,
      title: getTitleFromChat(chatWithTypedMessages) // Now uses the correctly typed chat
    };
  });

  // Group the processed chats by date
  // groupChatsByDate expects Chat[], and ProcessedChatForGrouping extends Chat
  const groupedChats = groupChatsByDate(processedChats);

  // Return the processed and grouped data
  // We might want to strip the raw `messages` property before sending to client
  // if SidebarHistory only needs id, title, updatedAt.
  // For now, sending the full grouped structure.
  return Response.json(groupedChats);
}
