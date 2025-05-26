import { NextResponse } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { executeTaskAction, TaskAction } from '@/lib/task-actions';
import { logTaskAction } from '@/lib/queries';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action }: { action: TaskAction } = await request.json();

    if (!action || !action.type) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log(`API: Executing task action for user ${session.user.id}:`, action);

    // Execute the task action
    const success = await executeTaskAction(session.user.id, action);

    if (!success) {
      return NextResponse.json({ error: 'Failed to execute task action' }, { status: 500 });
    }

    // Log the action for audit trail
    if (action.taskId) {
      await logTaskAction({
        taskId: action.taskId,
        userId: session.user.id,
        actorType: 'ai_intelligence',
        actorId: 'intelligence_system',
        actionType: action.type,
        details: {
          reason: action.reason,
          data: action.data
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Task action '${action.type}' executed successfully` 
    });

  } catch (error) {
    console.error('API Error executing task action:', error);
    return NextResponse.json({ error: 'Failed to execute task action' }, { status: 500 });
  }
} 