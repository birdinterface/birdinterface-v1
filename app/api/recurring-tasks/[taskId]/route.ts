import { NextResponse } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { updateRecurringTask, deleteRecurringTask } from '@/lib/queries';

export async function PUT(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = params;
    const body = await request.json();

    // Ensure that fields like title, description, etc. are correctly passed
    // and match the Partial<Task> structure expected by updateRecurringTask.
    // You might need to map fields from body to the Task structure if they differ.
    const taskData = {
      ...body,
      // Example: Map a 'name' field from body to 'title' if your Task model uses 'title'
      // title: body.name || body.title,
    };

    console.log(`API: Updating recurring task ${taskId} for user ${session.user.id} with data:`, taskData);
    const updatedTask = await updateRecurringTask(taskId, session.user.id, taskData);
    console.log(`API: Recurring task ${taskId} updated for user ${session.user.id}:`, updatedTask);

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('API Error updating recurring task:', error);
    return NextResponse.json({ error: 'Failed to update recurring task' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = params;

    console.log(`API: Deleting recurring task ${taskId} for user ${session.user.id}`);
    await deleteRecurringTask(taskId, session.user.id);
    console.log(`API: Recurring task ${taskId} deleted for user ${session.user.id}`);

    return NextResponse.json({ message: 'Recurring task deleted successfully' });
  } catch (error) {
    console.error('API Error deleting recurring task:', error);
    return NextResponse.json({ error: 'Failed to delete recurring task' }, { status: 500 });
  }
} 