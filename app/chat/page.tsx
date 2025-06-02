import { cookies } from 'next/headers';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/custom/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/model';
import { generateUUID } from '@/lib/utils';

// Restore original code
export default async function Page() {
  const id = generateUUID();
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const value = cookieStore.get('model')?.value;
  const selectedModelName =
    models.find((m) => m.name === value)?.name || DEFAULT_MODEL_NAME;
  
  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      selectedModelName={selectedModelName}
      user={session?.user}
    />
  );
}

// Remove minimal component
// export default function MinimalChatPage() {
//   return (
//     <div>
//       <h1>Minimal Chat Page (Testing Build)</h1>
//       <p>If this builds, the issue is in the original component or its imports.</p>
//     </div>
//   );
// }
