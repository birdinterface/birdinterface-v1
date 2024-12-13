'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/tasks', label: 'Tasks' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/workspace', label: 'Workspace' },
  { href: '/curator', label: 'Curator' },
  { href: '/intelligence', label: 'Intelligence' },
];

export function Navigation() {
  const pathname = usePathname();
  
  // Check for imprint first
  if (pathname === '/imprint' || pathname === '/imprint/') {
    return null;
  }
  
  // Then check other paths
  if (pathname.startsWith('/welcome') ||
      pathname.startsWith('/terms') ||
      pathname.startsWith('/privacy') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register')) {
    return null;
  }

  return (
    <>
      <nav className="border-b fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-[9999]">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex h-14 items-center gap-8">
            <Link href="/" className="font-semibold text-lg">
              <span className="text-foreground">Bird</span>
              <span className="text-muted-foreground">interface</span>
            </Link>
            <div className="flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    (pathname === item.href || (item.href === '/intelligence' && pathname.startsWith('/intelligence')))
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-14" /> {/* Spacer to prevent content from going under navbar */}
    </>
  );
} 