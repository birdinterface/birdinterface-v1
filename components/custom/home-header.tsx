'use client';

import Image from 'next/image';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

import { useModal } from '../context/modal-context';

interface ExtendedUser extends User {
  membership?: string;
}

export function HomeHeader({ user }: { user: ExtendedUser }) {
  const { setTheme, theme } = useTheme();
  const { openModal } = useModal();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'light' ? 'Dark' : 'Light'} mode
        </Button>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-3">
              <Image
                src={user.image || `https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={32}
                height={32}
                className="rounded-full"
                draggable={false}
              />
              <span className="text-sm font-medium">{user?.name || user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openModal}
            >
              {user?.membership || 'Free'} Plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/welcome' })}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Sign out
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 