'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';

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
  { href: '/database', label: 'Database' }, 
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
  if (pathname?.startsWith('/welcome') ||
      pathname?.startsWith('/terms') ||
      pathname?.startsWith('/privacy') ||
      pathname?.startsWith('/login') ||
      pathname?.startsWith('/register')) {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 inset-x-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-[9999] overscroll-none">
        <div className="relative w-full">
          <div className="flex h-10 items-center justify-center relative z-10 px-4">
            <div className="flex items-center gap-3 w-full max-w-screen-2xl mx-auto md:justify-center">
              <div className="hidden md:flex md:flex-1 md:basis-8 md:justify-end" /> {/* Left spacer */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="size-10 p-0 data-[state=open]:bg-transparent shrink-0 focus-visible:ring-0 transition-opacity hover:bg-transparent"
                    >
                      <div className="relative size-8 -ml-5">
                        <Image
                          src={'/images/Birdblack.png'}
                          alt="Bird Interface Logo Light"
                          layout="fill"
                          objectFit="contain"
                          priority
                          className="block dark:hidden"
                          draggable={false}
                        />
                        <Image
                          src={'/images/Birdwhite.png'}
                          alt="Bird Interface Logo Dark"
                          layout="fill"
                          objectFit="contain"
                          priority
                          className="hidden dark:block"
                          draggable={false}
                        />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" sideOffset={0} className="w-48 custom-dropdown">
                    {user && (
                      <>
                        <DropdownMenuItem asChild>
                          <button className="w-full text-left text-[10px] nav-text text-[#858a8f] hover:text-[#858a8f] focus:bg-transparent" onClick={openModal}>
                            Your Plan
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-[10px] nav-text text-[#858a8f] hover:text-[#858a8f] focus:bg-transparent"
                          onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <button
                            className="w-full text-left text-[10px] nav-text text-[#858a8f] hover:text-[#858a8f] focus:bg-transparent"
                            onClick={() => {
                              signOut({
                                redirect: true,
                                callbackUrl: '/',
                              });
                            }}
                          >
                            Sign Out
                          </button>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="overflow-x-auto scrolling-touch overscroll-x-contain touch-pan-x flex-1 -mx-4 px-4 no-scrollbar">
                  <div className="flex gap-8 min-w-max">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-xs font-medium transition-colors whitespace-nowrap nav-text",
                          (pathname === item.href || (item.href === '/intelligence' && pathname?.startsWith('/intelligence')))
                            ? 'text-foreground'
                            : 'text-[#858a8f] hover:text-[#858a8f]'
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hidden md:flex md:flex-1 md:basis-8" /> {/* Right spacer */}
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from going under navbar - adjust height for intelligence route on mobile */}
      <div className={cn(
        "h-14", // default height
        pathname?.startsWith('/intelligence') && "h-10 md:h-14" // smaller height on mobile for intelligence route
      )} />
    </>
  );
} 