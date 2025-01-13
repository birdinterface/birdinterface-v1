'use client';

import { ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';

import { useModal } from '../context/modal-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
            <div className="ml-auto flex items-center gap-4">
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