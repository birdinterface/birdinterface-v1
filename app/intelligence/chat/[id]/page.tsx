import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/custom/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/model';
import { getChatById } from '@/lib/queries';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  const chat = await getChatById({ id });

  if (!chat || chat.userid !== session.user.id) {
    return notFound();
  }

  const cookieStore = await cookies();
  const value = cookieStore.get('model')?.value;
  const selectedModelName =
    models.find((m) => m.name === value)?.name || DEFAULT_MODEL_NAME;

  // Parse messages if they're stored as JSON string
  const messages = typeof chat.messages === 'string' 
    ? JSON.parse(chat.messages) 
    : chat.messages;

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={messages}
      selectedModelName={selectedModelName}
      api="/intelligence/api/chat"
    />
  );
} 