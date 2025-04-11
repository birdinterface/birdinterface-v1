import { cookies } from 'next/headers';
import { Chat } from '@/components/custom/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/model';
import { generateUUID } from '@/lib/utils';

// Restore original code
export default async function Page() {
  const id = generateUUID();
  const cookieStore = await cookies();
  const value = cookieStore.get('model')?.value;
  const selectedModelName =
    models.find((m) => m.name === value)?.name || DEFAULT_MODEL_NAME;
  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      selectedModelName={selectedModelName}
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
