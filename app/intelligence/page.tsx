import { cookies } from 'next/headers';

import { auth } from '@/app/(auth)/auth';
import { DEFAULT_MODEL_NAME, models } from '@/lib/model';
import { generateUUID } from '@/lib/utils';
import { IntelligenceInterface } from '@/app/intelligence/intelligence-interface';

export default async function Page() {
  const id = generateUUID();

  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const value = cookieStore.get('model')?.value;
  const selectedModelName =
    models.find((m) => m.name === value)?.name || DEFAULT_MODEL_NAME;

  return (
    <IntelligenceInterface
      id={id}
      selectedModelName={selectedModelName}
      user={session?.user}
    />
  );
} 