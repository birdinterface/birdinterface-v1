import { NextResponse } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { getUserPreferences, saveUserPreferences } from '@/lib/queries';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await getUserPreferences(session.user.id);
    
    // Return default preferences if none exist
    if (!preferences) {
      return NextResponse.json({
        tabNames: {
          todo: 'ToDo',
          watch: 'Watch',
          later: 'Later',
          done: 'Completed'
        }
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('API Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch user preferences' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const preferences = await saveUserPreferences(session.user.id, body);

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('API Error saving user preferences:', error);
    return NextResponse.json({ error: 'Failed to save user preferences' }, { status: 500 });
  }
} 