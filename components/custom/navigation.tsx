'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; 
import { cn } from '@/lib/utils';

import { useModal } from '../context/modal-context';

const navItems = [
  { href: '/tasks', label: 'Tasks' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/workspace', label: 'Workspace' },
  { href: '/curator', label: 'Curator' },
  { href: '/intelligence', label: 'Intelligence' },
];

export function Navigation({ user }: { user: any }) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const { openModal } = useModal();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Check for imprint first
  if (pathname === '/imprint' || pathname === '/imprint/') {
    return null;
  }
  
  // Then check other paths
  if (pathname?.startsWith('/welcome') ||
      pathname?.startsWith('/terms') ||
      pathname?.startsWith('/privacy') ||
      pathname?.startsWith('/login') ||
      pathname?.startsWith('/register')) {
    return null;
  }

  return (
    <>
      <nav className="border-b fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-[9999] overscroll-none">
        <div className="w-full md:max-w-screen-2xl md:mx-auto md:pl-4">
          <div className="flex h-14 items-center pl-4 md:px-0">
            <Link href="/" className="font-semibold text-lg shrink-0">
              {isMobile ? (
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  fill="currentColor"
                  stroke="none"
                >
                  <path d="M4 12 C8 8 10 6 12 6 C14 6 16 8 20 12 C16 16 14 18 12 18 C10 18 8 16 4 12Z" />
                </svg>
              ) : (
                <>
                  <span className="text-foreground">Bird</span>
                  <span className="text-muted-foreground">interface</span>
                </>
              )}
            </Link>
            <div className="flex-1 overflow-x-auto scrolling-touch overscroll-contain touch-pan-x no-scrollbar">
              <div className="flex gap-6 pl-6 min-w-max">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                      (pathname === item.href || (item.href === '/intelligence' && pathname?.startsWith('/intelligence')))
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0 pl-4 md:pl-0">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 rounded-full">
                      <Image
                        src={user.image || `https://avatar.vercel.sh/${user.email}`}
                        alt={user.email ?? 'User Avatar'}
                        width={32}
                        height={32}
                        className="rounded-full"
                        draggable={false}
                      />
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <button className="w-full text-left" onClick={openModal}>
                        Your Plan
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <button
                        className="w-full text-left"
                        onClick={() => {
                          signOut({
                            redirect: true,
                            callbackUrl: '/',
                          });
                        }}
                      >
                        Sign out
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-14" /> {/* Spacer to prevent content from going under navbar */}
    </>
  );
} 