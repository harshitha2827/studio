
'use client';

import * as React from 'react';
import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatMessages } from '@/components/chat-messages';
import type { Chat } from '@/interfaces/chat'; // Define this type later if needed
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquarePlus, Users, LogIn } from 'lucide-react'; // Import necessary icons, Added LogIn
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Mock initial chat data structure (replace with actual data fetching/state management)
const mockChats: Chat[] = [
  { id: 'user1', name: 'Alice Smith', type: 'direct', lastMessage: 'Hey there!', timestamp: new Date(Date.now() - 3600 * 1000), unreadCount: 2, avatarUrl: 'https://i.pravatar.cc/40?u=alice' },
  { id: 'group1', name: 'Book Club', type: 'group', lastMessage: 'What did everyone think?', timestamp: new Date(Date.now() - 7200 * 1000), unreadCount: 0, avatarUrl: 'https://picsum.photos/seed/group1/40/40' },
  { id: 'user2', name: 'Bob Johnson', type: 'direct', lastMessage: 'See you then.', timestamp: new Date(Date.now() - 86400 * 1000), unreadCount: 0, avatarUrl: 'https://i.pravatar.cc/40?u=bob' },
   { id: 'group2', name: 'Sci-Fi Fans', type: 'group', lastMessage: 'Amazing trailer!', timestamp: new Date(Date.now() - 172800 * 1000), unreadCount: 5, avatarUrl: 'https://picsum.photos/seed/group2/40/40' },
];


export default function ChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // Loading state
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  const [chats, setChats] = React.useState<Chat[]>(mockChats); // Manage chats state

  React.useEffect(() => {
    // Check login status on client mount
    const userProfileExists = localStorage.getItem('userProfile');
    const loggedIn = !!userProfileExists;
    setIsLoggedIn(loggedIn);
    setIsLoading(false); // Finish loading check

    if (!loggedIn) {
        toast({
            title: "Login Required",
            description: "Please log in to access chat.",
            variant: "destructive",
        });
        // Optionally redirect immediately
        // router.push('/login');
    } else {
       // Placeholder for fetching user/group data if logged in
       // fetchInitialChats();
    }
  }, [router, toast]);


  // Handler for selecting a chat from the sidebar
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    // Mark chat as read (update state and potentially backend)
    setChats(prevChats =>
      prevChats.map(c =>
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  // Placeholder for sending a message
  const handleSendMessage = (message: string) => {
    if (!selectedChat || !message.trim()) return;
    console.log(`Sending message "${message}" to chat ${selectedChat.id}`);
    // TODO: Implement actual message sending logic (update state, send to backend)
  };

  // Placeholder for creating a new chat/group
  const handleCreateNewChat = () => {
    console.log("Creating new chat/group (not implemented)");
    // TODO: Implement UI/logic for creating chats/groups
  };


  if (isLoading) {
     return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg text-muted-foreground">Checking login status...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
             <div className="text-center max-w-md bg-background p-8 rounded-lg shadow-lg border">
                 <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
                 <p className="text-muted-foreground mb-6">You need to be logged in to use the chat feature.</p>
                 <Button onClick={() => router.push('/login')} size="lg">
                     <LogIn className="mr-2 h-5 w-5" /> Login to Continue
                 </Button>
                  <Button variant="link" size="sm" asChild className="mt-4">
                     <Link href="/">
                         <ArrowLeft className="mr-1 h-4 w-4" /> Go Back Home
                     </Link>
                 </Button>
             </div>
        </div>
     );
  }

  // Render chat page only if logged in
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="lg:hidden">
            {/* Mobile back/menu button can be implemented here */}
             <Link href="/">
                <ArrowLeft className="h-5 w-5" />
             </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">
            {selectedChat ? selectedChat.name : 'Chat'}
          </h1>
        </div>
         <div className="flex items-center gap-2">
             {/* Placeholder buttons for new chat/group */}
             <Button variant="ghost" size="icon" onClick={handleCreateNewChat} title="New Chat">
                 <MessageSquarePlus className="h-5 w-5" />
                 <span className="sr-only">New Chat</span>
             </Button>
             <Button variant="ghost" size="icon" onClick={() => console.log("Manage Groups (not implemented)")} title="Manage Groups">
                 <Users className="h-5 w-5" />
                 <span className="sr-only">Manage Groups</span>
             </Button>
         </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (visible on larger screens) */}
        <aside className="hidden w-72 flex-shrink-0 border-r lg:flex lg:flex-col">
          <ChatSidebar
            chats={chats}
            selectedChatId={selectedChat?.id ?? null}
            onSelectChat={handleSelectChat}
          />
        </aside>

        {/* Message Area */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          {selectedChat ? (
            <ChatMessages
              chat={selectedChat}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <MessageSquarePlus className="h-16 w-16 mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">Select a chat to start messaging</p>
              <p className="text-sm">or create a new chat or group.</p>
               {/* Button to show sidebar on mobile/tablet */}
               <Button variant="outline" className="mt-4 lg:hidden" onClick={() => console.log("Open mobile sidebar (implement with Sheet)")}>
                  View Chats
               </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
