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
  { href: '/tasks', label: 'TASKS' },
  { href: '/calendar', label: 'CALENDAR' },
  { href: '/database', label: 'DATABASE' }, 
  { href: '/curator', label: 'CURATOR' },
  { href: '/intelligence', label: 'INTELLIGENCE' },
];

export function Navigation({ user }: { user: any }) {
  const pathname = usePathname();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { openModal } = useModal();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .nav-text {
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.05em;
        }
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(circle, rgba(0, 0, 0, 0.20) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
          z-index: -1;
        }
        .dark body::before {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
        }
        .nav-dots::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(circle, rgba(0, 0, 0, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
        }
        .dark .nav-dots::before {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
        }
        .custom-dropdown {
          border: none !important;
          padding: 0.5rem !important;
          background-color: var(--background) !important;
          backdrop-filter: blur(16px) !important;
          z-index: 99999 !important;
        }
      `}</style>
      <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-[9999] overscroll-none">
        <div className="relative w-full nav-dots">
          <div className="flex h-14 items-center justify-center relative z-10 px-4">
            <div className="flex items-center gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-transparent">
                    <div className="relative w-6 h-6">
                      {mounted && (
                        <Image
                          src={resolvedTheme === 'dark' ? '/images/Birdwhite.png' : '/images/Birdblack.png'}
                          alt="Bird Interface Logo"
                          layout="fill"
                          objectFit="contain"
                          priority
                        />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={0} className="w-48 custom-dropdown">
                  {user && (
                    <>
                      <DropdownMenuItem asChild>
                        <button className="w-full text-left text-xs nav-text" onClick={openModal}>
                          YOUR PLAN
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs nav-text"
                        onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      >
                        {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <button
                          className="w-full text-left text-xs nav-text"
                          onClick={() => {
                            signOut({
                              redirect: true,
                              callbackUrl: '/',
                            });
                          }}
                        >
                          SIGN OUT
                        </button>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="overflow-x-auto scrolling-touch overscroll-contain touch-pan-x no-scrollbar">
                <div className="flex gap-6 min-w-max">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-xs font-medium transition-colors hover:text-primary whitespace-nowrap nav-text",
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
            </div>
          </div>
        </div>
      </nav>
      <div className="h-14" /> {/* Spacer to prevent content from going under navbar */}
    </>
  );
} 