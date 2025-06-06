import { setConfig, lists } from '@mailchimp/mailchimp_marketing';
import { NextResponse } from 'next/server';

// Validate environment variables
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER_PREFIX) {
  console.error('Missing required Mailchimp environment variables:', {
    hasApiKey: !!MAILCHIMP_API_KEY,
    hasListId: !!MAILCHIMP_LIST_ID,
    hasServerPrefix: !!MAILCHIMP_SERVER_PREFIX
  });
}

// Initialize Mailchimp
setConfig({
  apiKey: MAILCHIMP_API_KEY!,
  server: MAILCHIMP_SERVER_PREFIX!,
});

export async function POST(request: Request) {
  try {
    // Validate environment variables are available
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER_PREFIX) {
      throw new Error('Missing required Mailchimp configuration');
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    try {
      // Add member to list
      await lists.addListMember(MAILCHIMP_LIST_ID, {
        email_address: email,
        status: 'subscribed',
      });

      return NextResponse.json(
        { message: 'Successfully joined waitlist' },
        { status: 200 }
      );
    } catch (mailchimpError: any) {
      console.error('Mailchimp error:', {
        error: mailchimpError,
        listId: MAILCHIMP_LIST_ID,
        serverPrefix: MAILCHIMP_SERVER_PREFIX
      });
      
      // Check if the error is because the email is already subscribed
      if (mailchimpError.response?.body?.title === 'Member Exists') {
        return NextResponse.json(
          { message: 'You\'re already signed up!' },
          { status: 200 }
        );
      }

      throw mailchimpError;
    }
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      { error: 'Failed to join Alpha' },
      { status: 500 }
    );
  }
} 