'use client';

import { Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type User } from 'next-auth';

import { VercelIcon } from '@/components/custom/icons';
import { SidebarHistory } from '@/components/custom/sidebar-history';
import { SidebarUserNav } from '@/components/custom/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
    <Sidebar className="mt-14 bg-white dark:bg-black border-t border-r border-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/intelligence" onClick={() => setOpenMobile(false)}>
                <Image
                  src="/images/logodark.png"
                  alt="Logo"
                  width={180}
                  height={30}
                  className="dark:hidden"
                  draggable={false}
                />
                <Image
                  src="/images/logowhite.png"
                  alt="Logo"
                  width={180}
                  height={30}
                  className="hidden dark:block"
                  draggable={false}
                />
              </Link>
            </SidebarMenuButton>
            <BetterTooltip content="New Chat">
              <SidebarMenuAction asChild>
                <Link href="/intelligence" onClick={() => setOpenMobile(false)}>
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
      <SidebarFooter className="gap-0">
        <SidebarGroup>
          <SidebarGroupContent>
          </SidebarGroupContent>
        </SidebarGroup>
        {user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarUserNav user={user} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
