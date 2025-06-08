import { Inter } from 'next/font/google';
import Script from 'next/script';
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
  title: 'The intelligent personal interface | Birdinterface',
  description: 'At Birdinterface, the mission is to empower individuals in their own pursuits and from an early age.',
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
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers session={session}>
          <Navigation user={session?.user} />
          <main className="grow">{children}</main>
          <SubscriptionModal user={session?.user as ExtendedUser} />
          <Toaster />
        </Providers>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-Q8FKR2SNM6" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q8FKR2SNM6');
          `}
        </Script>
      </body>
    </html>
  );
}
