'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { type User } from 'next-auth';

import { SidebarHistory } from '@/components/custom/sidebar-history';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { BetterTooltip } from '@/components/ui/tooltip';

export function AppSidebar({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="mt-14 h-[calc(100vh-3.5rem)] bg-white dark:bg-black border-t border-r border-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="intelligence-text">
              <Link href="/intelligence" onClick={() => setOpenMobile(false)}>
                <span>New Chat</span>
              </Link>
            </SidebarMenuButton>
            <BetterTooltip content="New Chat">
              <SidebarMenuAction asChild>
                <Link href="/intelligence" onClick={() => setOpenMobile(false)} className="hover:bg-transparent hover:opacity-80 transition-opacity text-black dark:text-white">
                  <Plus />
                </Link>
              </SidebarMenuAction>
            </BetterTooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
    </Sidebar>
  );
}
