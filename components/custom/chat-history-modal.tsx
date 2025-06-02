'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { type User } from 'next-auth';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn, fetcher } from '@/lib/utils';

// Define the expected shape of a processed chat object from the API
interface ProcessedChat {
  id: string;
  title: string; 
  updatedat: string;
  messages?: any[];
}

// Define the expected shape of the grouped history from the API
type GroupedHistory = Record<string, ProcessedChat[]>;

interface ChatHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
}

export function ChatHistoryModal({ open, onOpenChange, user }: ChatHistoryModalProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { theme } = useTheme();
  const currentChatId = params?.id as string | undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [hoveredChatMessages, setHoveredChatMessages] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: groupedHistoryData,
    isLoading,
    mutate,
  } = useSWR<GroupedHistory>(user ? '/intelligence/api/history' : null, fetcher, {
    fallbackData: {},
  });

  useEffect(() => {
    mutate(); 
  }, [pathname, mutate]);

  // Filter chats based on search query
  const filteredHistory = Object.entries(groupedHistoryData || {}).reduce((acc, [period, chats]) => {
    const filteredChats = chats.filter(chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredChats.length > 0) {
      acc[period] = filteredChats;
    }
    return acc;
  }, {} as GroupedHistory);

  // Fetch chat details when hovering
  const fetchChatDetails = async (chatId: string) => {
    try {
      const response = await fetch(`/intelligence/api/chat?id=${chatId}`);
      if (response.ok) {
        const chatData = await response.json();
        let messages = [];
        
        if (Array.isArray(chatData.messages)) {
          messages = chatData.messages;
        } else if (typeof chatData.messages === 'string') {
          messages = JSON.parse(chatData.messages);
        }
        
        setHoveredChatMessages(messages.slice(0, 5)); // Show first 5 messages
      }
    } catch (error) {
      console.error('Error fetching chat details:', error);
      setHoveredChatMessages([]);
    }
  };

  const handleChatHover = (chatId: string) => {
    setHoveredChatId(chatId);
    fetchChatDetails(chatId);
  };

  const handleDelete = async () => {
    try {
      await fetch(`/intelligence/api/chat?id=${deleteId}`, {
        method: 'DELETE',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete');
      });

      mutate((currentData) => {
        if (!currentData) return {};
        const newData: GroupedHistory = {};
        for (const period in currentData) {
          const filteredChats = currentData[period].filter((h) => h.id !== deleteId);
          if (filteredChats.length > 0) {
            newData[period] = filteredChats;
          }
        }
        return newData;
      }, false);

      toast.success('Chat deleted successfully', {
        style: {
          background: theme === 'dark' ? 'black' : 'white',
          border: theme === 'dark' ? '1px solid rgb(31,41,55)' : '1px solid rgb(229,231,235)',
          color: theme === 'dark' ? 'white' : 'black',
        }
      });

      if (deleteId === currentChatId) {
        router.push('/intelligence');
        onOpenChange(false);
      }
    } catch (error) {
      toast.error('Failed to delete chat');
    } finally {
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const renderChatItem = (chat: ProcessedChat) => (
    <div
      key={chat.id}
      className={cn(
        "group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer",
        "hover:bg-accent hover:shadow-sm",
        chat.id === currentChatId ? "bg-accent border-primary" : "border-border",
        hoveredChatId === chat.id ? "bg-accent/50" : ""
      )}
      onMouseEnter={() => handleChatHover(chat.id)}
      onMouseLeave={() => {
        if (hoveredChatId === chat.id) {
          setHoveredChatId(null);
          setHoveredChatMessages([]);
        }
      }}
    >
      <Link
        href={`/intelligence/chat/${chat.id}`}
        onClick={() => onOpenChange(false)}
        className="flex-1 min-w-0"
      >
        <div className="font-medium text-sm truncate">{chat.title}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {new Date(chat.updatedat).toLocaleDateString()}
        </div>
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent hover:text-black dark:hover:text-white">
            <MoreHorizontalIcon size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/15 focus:text-destructive"
            onSelect={() => {
              setDeleteId(chat.id);
              setShowDeleteDialog(true);
            }}
          >
            <TrashIcon size={16} />
            <span className="ml-2">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const renderChatPreview = () => {
    if (!hoveredChatId || hoveredChatMessages.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <InfoIcon size={32} />
            <p className="mt-2">Hover over a chat to see preview</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Chat Preview</h3>
        <div className="h-[400px] overflow-y-auto">
          <div className="space-y-3">
            {hoveredChatMessages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg max-w-[80%]",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted"
                )}
              >
                <div className="text-xs font-medium mb-1 opacity-70">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="text-sm">
                  {typeof message.content === 'string' 
                    ? message.content.slice(0, 150) + (message.content.length > 150 ? '...' : '')
                    : 'Message content'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Modal 
        isOpen={open} 
        onClose={() => onOpenChange(false)}
        title="Chat History"
        className="max-w-6xl"
      >
        <div className="flex h-[60vh]">
          {/* Left side - Chat History List */}
          <div className="w-1/2 border-r pr-4">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="h-[calc(100%-4rem)] overflow-y-auto">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : Object.keys(filteredHistory).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <InfoIcon size={32} />
                    <p className="mt-2">{searchQuery ? 'No chats found matching your search' : 'No chats found'}</p>
                  </div>
                ) : (
                  Object.entries(filteredHistory).map(([period, chats]) => (
                    <div key={period} className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground px-2 py-1">
                        {period}
                      </div>
                      {chats.map(renderChatItem)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right side - Chat Preview */}
          <div className="w-1/2 pl-4">
            {renderChatPreview()}
          </div>
        </div>
      </Modal>

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