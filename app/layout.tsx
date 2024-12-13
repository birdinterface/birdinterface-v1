import { Metadata } from 'next';
import { type User } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

import { auth } from '@/app/(auth)/auth';
import { ModalProvider } from '@/components/context/modal-context';
import { SubscriptionModal } from '@/components/custom/subscription-modal';
import { ThemeProvider } from '@/components/custom/theme-provider';
import { Navigation } from '@/components/custom/navigation';

import './globals.css';

interface ExtendedUser extends User {
  membership?: string;
}

export const metadata: Metadata = {
  metadataBase: new URL('https://advancers.ai'),
  title: 'AdvancersAI',
  description: 'AI that assists in innovation and aids in research',
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let userData: ExtendedUser | null = null;
  
  if (session?.user?.email) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user?email=${encodeURIComponent(session.user.email)}`);
    const data = await response.json();
    userData = {
      ...session.user,
      membership: data.membership
    };
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_COLOR_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ModalProvider>
            <Toaster position="top-center" />
            <SessionProvider>
              <Navigation />
              {children}
              {userData && <SubscriptionModal user={userData} />}  
            </SessionProvider>
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
