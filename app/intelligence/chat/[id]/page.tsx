import { CoreMessage, Message } from 'ai';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { IntelligenceInterface } from '@/app/intelligence/intelligence-interface';
import { DEFAULT_MODEL_NAME, models } from '@/lib/model';
import { getChatById } from '@/lib/queries';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  try {
    const chat = await getChatById({ id });

    if (!chat || chat.userid !== session.user.id) {
      return notFound();
    }

    const cookieStore = await cookies();
    const value = cookieStore.get('model')?.value;
    const selectedModelName =
      models.find((m) => m.name === value)?.name || DEFAULT_MODEL_NAME;

    // Parse and convert messages to UI format
    let messages: Array<Message> = [];
    try {
      let rawMessages: Array<CoreMessage> = [];
      if (Array.isArray(chat.messages)) {
        rawMessages = chat.messages as Array<CoreMessage>;
      } else if (typeof chat.messages === 'string') {
        rawMessages = JSON.parse(chat.messages) as Array<CoreMessage>;
      } else if (chat.messages) {
        rawMessages = [chat.messages] as Array<CoreMessage>;
      }

      // Convert to UI messages format
      messages = convertToUIMessages(rawMessages);
    } catch (error) {
      console.error('Error parsing chat messages:', error);
      messages = [];
    }

    return (
      <IntelligenceInterface
        id={id}
        selectedModelName={selectedModelName}
        user={session?.user}
        initialMessages={messages}
      />
    );
  } catch (error) {
    console.error('Error loading chat:', error);
    return notFound();
  }
} 