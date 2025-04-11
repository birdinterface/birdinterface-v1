import { Inter } from 'next/font/google';
import { type User } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

import { auth } from '@/app/(auth)/auth';
import { ModalProvider } from '@/components/context/modal-context';
import { Navigation } from '@/components/custom/navigation';
import { SubscriptionModal } from '@/components/custom/subscription-modal';
import { ThemeProvider } from '@/components/custom/theme-provider';

import type { Metadata } from 'next';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

interface ExtendedUser extends User {
  membership?: string;
}

export const metadata: Metadata = {
  metadataBase: new URL('https://birdinterface.com'),
  title: 'Bird Interface',
  description: 'An AI that understands your whole life',
  icons: {
    icon: '/favicon.ico'
  }
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_COLOR_SCRIPT }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <ModalProvider>
              <Navigation user={session?.user} />
              {children}
              <SubscriptionModal user={session?.user as ExtendedUser} />
              <Toaster />
            </ModalProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
