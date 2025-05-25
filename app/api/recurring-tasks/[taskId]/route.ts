import { NextResponse, NextRequest } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { updateRecurringTask, deleteRecurringTask } from '@/lib/queries';

// Define a common type for the context parameters
type RouteContext = {
  params: {
    taskId: string;
  };
};

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { taskId } = params;
    // const session = await auth(); // Simplified
    // if (!session?.user?.id) { // Simplified
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Simplified
    // }
    // const body = await request.json(); // Simplified
    // const taskData = { ...body }; // Simplified
    // console.log(`API: Updating recurring task ${taskId} for user ${session.user.id} with data:`, taskData); // Simplified
    // const updatedTask = await updateRecurringTask(taskId, session.user.id, taskData); // Simplified
    // console.log(`API: Recurring task ${taskId} updated for user ${session.user.id}:`, updatedTask); // Simplified
    // return NextResponse.json(updatedTask); // Simplified

    // Bare minimum logic for diagnostics:
    console.log(`API: PUT request for taskId: ${taskId} (simplified handler)`);
    return NextResponse.json({ message: `PUT request for ${taskId} received (simplified handler)` });
  } catch (error) {
    console.error('API Error in simplified PUT handler:', error);
    return NextResponse.json({ error: 'Failed in simplified PUT handler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
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