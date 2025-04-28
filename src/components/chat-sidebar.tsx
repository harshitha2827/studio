
import * as React from 'react';
import type { Chat } from '@/interfaces/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns'; // For relative timestamps

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chat: Chat) => void;
}

export function ChatSidebar({ chats, selectedChatId, onSelectChat }: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by most recent message

  const getInitials = (name: string): string => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    return names
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="relative">
           <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
           <Input
             type="search"
             placeholder="Search chats..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-9 h-9 text-sm bg-background"
           />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                  selectedChatId === chat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                )}
                onClick={() => onSelectChat(chat)}
              >
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={chat.avatarUrl} alt={chat.name} />
                  <AvatarFallback className={cn(selectedChatId === chat.id ? "bg-primary-foreground text-primary" : "")}>
                    {getInitials(chat.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-medium">{chat.name}</p>
                  <p className={cn(
                      "text-xs truncate",
                      selectedChatId === chat.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}>
                    {chat.lastMessage}
                  </p>
                </div>
                <div className="ml-auto flex flex-col items-end text-xs">
                  <span className={cn(
                      "whitespace-nowrap",
                      selectedChatId === chat.id ? 'text-primary-foreground/70' : 'text-muted-foreground/80'
                  )}>
                    {formatDistanceToNowStrict(chat.timestamp, { addSuffix: false })}
                  </span>
                   {chat.unreadCount > 0 && (
                     <Badge variant={selectedChatId === chat.id ? "secondary" : "default"} className="mt-1 px-1.5 py-0.5 h-4 min-w-[1rem] justify-center">
                       {chat.unreadCount}
                     </Badge>
                   )}
                </div>
              </button>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">No chats found.</p>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
