'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { type User } from 'next-auth';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import {
  InfoIcon,
  MoreHorizontalIcon,
  TrashIcon,
} from '@/components/custom/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Chat } from '@/db/schema';
import { fetcher, getTitleFromChat, groupChatsByDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const params = useParams();
  const id = params?.id as string | undefined;
  const pathname = usePathname();
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<Chat>>(user ? '/intelligence/api/history' : null, fetcher, {
    fallbackData: [],
  });

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const handleDelete = async () => {
    try {
      await fetch(`/intelligence/api/chat?id=${deleteId}`, {
        method: 'DELETE',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete');
      });

      mutate((history) => {
        if (history) {
          return history.filter((h) => h.id !== deleteId);
        }
      }, false);

      toast.success('Chat deleted successfully', {
        style: {
          background: theme === 'dark' ? 'black' : 'white',
          border: theme === 'dark' ? '1px solid rgb(31,41,55)' : '1px solid rgb(229,231,235)',
          color: theme === 'dark' ? 'white' : 'black',
        }
      });

      if (deleteId === id) {
        router.push('/intelligence');
      }
    } catch (error) {
      toast.error('Failed to delete chat');
    } finally {
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // or whatever breakpoint you use
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const groupedHistory = history ? groupChatsByDate(history) : {};

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Render function for chat items
  const renderChatItem = (chat: Chat) => (
    <SidebarMenuItem key={chat.id} className="group/menu-item">
      <div className={cn(
        "flex w-full rounded-md",
        "md:group-hover/menu-item:bg-sidebar-accent",
        openMenuId === chat.id && "bg-sidebar-accent"
      )}>
        <SidebarMenuButton 
          asChild 
          isActive={chat.id === id}
          className={cn(
            "min-h-[38px] py-0 flex-grow",
            "@media (hover: none) {active:bg-transparent hover:bg-transparent}",
            "@media (hover: hover) {hover:bg-sidebar-accent}"
          )}
        >
          <Link
            href={`/intelligence/chat/${chat.id}`}
            onClick={() => setOpenMobile(false)}
            className="py-2 w-full"
          >
            <span>{getTitleFromChat(chat)}</span>
          </Link>
        </SidebarMenuButton>
        <DropdownMenu 
          modal={isMobile} 
          open={openMenuId === chat.id}
          onOpenChange={(open) => setOpenMenuId(open ? chat.id : null)}
        >
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              className={cn(
                "hover:bg-transparent active:bg-transparent h-[25px] flex items-center",
                chat.id !== id ? "hidden md:opacity-0 md:group-hover/menu-item:opacity-100 md:block" : ""
              )}
              showOnHover={chat.id !== id}
            >
              <MoreHorizontalIcon />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/15 focus:text-destructive"
              onSelect={() => {
                setDeleteId(chat.id);
                setShowDeleteDialog(true);
              }}
            >
              <TrashIcon />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SidebarMenuItem>
  );

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="text-zinc-500 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
            <InfoIcon />
            <div>Login to save and revisit previous chats!</div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="rounded-md h-8 flex gap-2 px-2 items-center"
              >
                <div
                  className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                  style={
                    {
                      '--skeleton-width': `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (history?.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <InfoIcon />
                <span>No chats found</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup className="mt-3">
        <SidebarGroupContent>
          <SidebarMenu>
            {Object.entries(groupedHistory).map(([period, chats]) => 
              chats.length > 0 && (
                <div key={period} className="mb-4">
                  <div className="px-2 mb-2 text-xs font-medium text-muted-foreground">
                    {period}
                  </div>
                  {chats.map(renderChatItem)}
                </div>
              )
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              autoFocus
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
