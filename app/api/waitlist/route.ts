import mailchimp from '@mailchimp/mailchimp_marketing';
import { NextResponse } from 'next/server';

// Initialize Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    try {
      // Add member to list
      await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID!, {
        email_address: email,
        status: 'subscribed',
      });

      return NextResponse.json(
        { message: 'Successfully joined waitlist' },
        { status: 200 }
      );
    } catch (mailchimpError: any) {
      console.error('Mailchimp error:', mailchimpError);
      
      // Check if the error is because the email is already subscribed
      if (mailchimpError.response?.body?.title === 'Member Exists') {
        return NextResponse.json(
          { message: 'You\'re already on the waitlist!' },
          { status: 200 }
        );
      }

      throw mailchimpError;
    }
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
} 