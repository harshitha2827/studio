
import * as React from 'react';
import type { Chat, Message } from '@/interfaces/chat'; // Define these types later
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, User } from 'lucide-react'; // Use SendHorizonal
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns'; // For message timestamps

interface ChatMessagesProps {
  chat: Chat;
  onSendMessage: (message: string) => void;
}

// Mock messages for the selected chat (replace with actual data fetching)
const getMockMessages = (chatId: string): Message[] => {
  // Simulate different messages for different chats
  const baseMessages: Omit<Message, 'id' | 'timestamp'>[] = [
    { senderId: 'user1', senderName: 'Alice', text: 'Hey Bob! How are you?', avatarUrl: 'https://i.pravatar.cc/40?u=alice' },
    { senderId: 'user2', senderName: 'Bob', text: 'Hi Alice! Doing well, thanks. How about you?', avatarUrl: 'https://i.pravatar.cc/40?u=bob' },
    { senderId: 'user1', senderName: 'Alice', text: 'Pretty good! Working on the BookBurst chat feature.', avatarUrl: 'https://i.pravatar.cc/40?u=alice' },
    { senderId: 'user2', senderName: 'Bob', text: 'Sounds cool! Let me know if you need help testing.', avatarUrl: 'https://i.pravatar.cc/40?u=bob' },
  ];

  if (chatId.startsWith('group')) {
     const groupMessages: Omit<Message, 'id' | 'timestamp'>[] = [
        { senderId: 'user1', senderName: 'Alice', text: `Hello ${chatId === 'group1' ? 'Book Club' : 'Sci-Fi Fans'}!`, avatarUrl: 'https://i.pravatar.cc/40?u=alice' },
        { senderId: 'user3', senderName: 'Charlie', text: 'Hi Alice!', avatarUrl: 'https://i.pravatar.cc/40?u=charlie' },
        { senderId: 'user4', senderName: 'Diana', text: 'Welcome!', avatarUrl: 'https://i.pravatar.cc/40?u=diana' },
        { senderId: 'user1', senderName: 'Alice', text: 'What is everyone reading?', avatarUrl: 'https://i.pravatar.cc/40?u=alice' },
     ];
     return groupMessages.map((msg, index) => ({
        ...msg,
        id: `${chatId}-msg-${index}`,
        timestamp: new Date(Date.now() - (groupMessages.length - index) * 60000 * 5), // Messages spaced 5 mins apart
     }));
  }

  // Add unique IDs and timestamps
  return baseMessages.map((msg, index) => ({
    ...msg,
    id: `${chatId}-msg-${index}`,
    timestamp: new Date(Date.now() - (baseMessages.length - index) * 60000 * 5), // Messages spaced 5 mins apart
  }));
};

export function ChatMessages({ chat, onSendMessage }: ChatMessagesProps) {
  const [newMessage, setNewMessage] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

   // Mock current user ID (replace with actual user context)
   const currentUserId = 'user2'; // Assume 'Bob' is the current user for styling

  // Fetch/update messages when chat changes
  React.useEffect(() => {
    // Simulate fetching messages for the selected chat
    const fetchedMessages = getMockMessages(chat.id);
    setMessages(fetchedMessages);

    // Scroll to bottom when messages load or chat changes
     setTimeout(() => {
       if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
       }
     }, 100); // Delay slightly to ensure DOM update

  }, [chat.id]);

  // Scroll to bottom when new messages are added (this needs refinement with actual message state)
  // React.useEffect(() => {
  //   if (scrollAreaRef.current) {
  //     scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  //   }
  // }, [messages]); // Adjust dependency if messages state updates correctly

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    // TODO: Add the new message optimistically to the 'messages' state here
    // Example (needs proper sender info):
    // setMessages(prev => [...prev, { id: Date.now().toString(), senderId: currentUserId, senderName: 'You', text: newMessage, timestamp: new Date() }]);
    setNewMessage(''); // Clear input
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    return names
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((message, index) => {
           const isCurrentUser = message.senderId === currentUserId;
           // Determine if the sender changed from the previous message (for group chats mainly)
           const showSenderInfo = index === 0 || messages[index - 1]?.senderId !== message.senderId;

          return (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3",
                isCurrentUser ? "justify-end" : "justify-start",
                showSenderInfo ? "mt-3" : "mt-1" // Add more space if sender changes
              )}
            >
               {/* Avatar (show for others, optionally hide for current user or if sender didn't change) */}
              {!isCurrentUser && (
                 <Avatar className={cn("h-8 w-8 border", showSenderInfo ? "opacity-100" : "opacity-0")}>
                   <AvatarImage src={message.avatarUrl} alt={message.senderName} />
                   <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
                 </Avatar>
              )}

              {/* Message Bubble */}
              <div className={cn("max-w-[70%]")}>
                 {/* Show sender name for group chats if it's a new sender */}
                 {chat.type === 'group' && !isCurrentUser && showSenderInfo && (
                    <p className="text-xs text-muted-foreground mb-0.5 ml-1">{message.senderName}</p>
                 )}
                 <div
                   className={cn(
                     "rounded-lg px-3 py-2 text-sm break-words",
                     isCurrentUser
                       ? "bg-primary text-primary-foreground"
                       : "bg-muted text-foreground"
                   )}
                 >
                   {message.text}
                 </div>
                  {/* Timestamp (optional, could show on hover or below) */}
                   <p className={cn(
                      "text-[10px] text-muted-foreground/70 mt-0.5",
                      isCurrentUser ? "text-right mr-1" : "text-left ml-1"
                    )}>
                      {format(message.timestamp, 'p')} {/* Format time e.g., 10:30 AM */}
                    </p>
              </div>

                {/* Spacer for current user to align message right */}
               {isCurrentUser && (
                 <div className={cn("h-8 w-8 flex-shrink-0", showSenderInfo ? "" : "")}></div> // Placeholder to push bubble left
               )}
            </div>
          );
        })}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            className="flex-1"
            aria-label="Chat message input"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
