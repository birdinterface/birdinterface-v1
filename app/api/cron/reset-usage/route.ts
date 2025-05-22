import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // Ensure the authorization header is present
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Reset all users' usage to 0
    const { error } = await supabase
      .from('User')
      .update({ usage: '0.00' });
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reset usage:', error);
    return NextResponse.json({ error: 'Failed to reset usage' }, { status: 500 });
  }
} 