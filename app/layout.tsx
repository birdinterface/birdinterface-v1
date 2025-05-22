import { Inter } from 'next/font/google';
import { type User } from 'next-auth';
import { Toaster } from 'sonner';

import { auth } from '@/app/(auth)/auth';
import { Navigation } from '@/components/custom/navigation';
import { SubscriptionModal } from '@/components/custom/subscription-modal';
import { Providers } from '@/components/providers';

import type { Metadata } from 'next';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

interface ExtendedUser extends User {
  membership?: string;
}

export const metadata: Metadata = {
  metadataBase: new URL('https://birdinterface.com'),
  title: 'Birdinterface',
  description: 'An intelligent personal interface.',
  icons: {
    icon: '/favicon.ico'
  }
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers session={session}>
          <Navigation user={session?.user} />
          {children}
          <SubscriptionModal user={session?.user as ExtendedUser} />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
