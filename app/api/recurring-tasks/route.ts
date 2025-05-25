import { NextResponse } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { getUserRecurringTasks, createRecurringTask, updateRecurringTask, deleteRecurringTask } from '@/lib/queries';
import { Task } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`API: Fetching recurring tasks for user ${session.user.id}`);
    const tasks = await getUserRecurringTasks(session.user.id);
    console.log(`API: Recurring tasks received for user ${session.user.id}:`, tasks);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('API Error fetching recurring tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch recurring tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, dueDate, status, recurrencePattern } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const taskData = {
      title,
      description,
      dueDate,
      status: status || 'pending',
      recurrencepattern: recurrencePattern,
    };

    console.log(`API: Creating recurring task for user ${session.user.id} with data:`, taskData);
    const newTask = await createRecurringTask(session.user.id, taskData as any);
    console.log(`API: Recurring task created for user ${session.user.id}:`, newTask);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('API Error creating recurring task:', error);
    return NextResponse.json({ error: 'Failed to create recurring task' }, { status: 500 });
  }
} 