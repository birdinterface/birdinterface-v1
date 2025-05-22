import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getUserTasks } from '@/lib/queries';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`API: Fetching tasks for user ${session.user.id}`);
    const tasks = await getUserTasks(session.user.id);
    console.log(`API: Tasks received for user ${session.user.id}:`, tasks);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('API Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
} 