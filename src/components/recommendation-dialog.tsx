
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Send, User } from "lucide-react";
import type { Book } from "@/interfaces/book";
import type { MockUser } from "@/interfaces/user"; // Assuming user interface exists
import { cn } from "@/lib/utils";

interface RecommendationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
  currentUser: MockUser; // The user sending the recommendation
  onSendRecommendation: (recipient: MockUser, message?: string) => void;
}

// --- Mock Data (Replace with actual API/backend fetching) ---

// Mock User list (replace with actual user search/data)
// Ensure this list is accessible here or passed down if needed elsewhere
const mockUsers: MockUser[] = [
  { id: 'user1', username: 'alice_s', name: 'Alice Smith', avatarUrl: 'https://i.pravatar.cc/40?u=alice' },
  { id: 'user2', username: 'bob_j', name: 'Bob Johnson', avatarUrl: 'https://i.pravatar.cc/40?u=bob' },
  { id: 'user3', username: 'charlie_w', name: 'Charlie Williams', avatarUrl: 'https://i.pravatar.cc/40?u=charlie' },
  { id: 'user4', username: 'diana_b', name: 'Diana Brown', avatarUrl: 'https://i.pravatar.cc/40?u=diana' },
];

// Helper function to get initials
const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    return names
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
};

export function RecommendationDialog({
  isOpen,
  onOpenChange,
  book,
  currentUser,
  onSendRecommendation,
}: RecommendationDialogProps) {
  const [userSearchTerm, setUserSearchTerm] = React.useState('');
  const [searchedUsers, setSearchedUsers] = React.useState<MockUser[]>([]);
  const [selectedRecipient, setSelectedRecipient] = React.useState<MockUser | null>(null);
  const [recommendationMessage, setRecommendationMessage] = React.useState('');

  // Reset state when dialog opens/closes
  React.useEffect(() => {
      if (!isOpen) {
          setUserSearchTerm('');
          setSearchedUsers([]);
          setSelectedRecipient(null);
          setRecommendationMessage('');
      }
  }, [isOpen]);


  const handleUserSearch = (term: string) => {
    setUserSearchTerm(term);
    if (term.length > 1) {
      // Mock user search - filter mockUsers (exclude self)
      const results = mockUsers.filter(
        (u) =>
          u.id !== currentUser.id && // Exclude current user
          (u.name.toLowerCase().includes(term.toLowerCase()) ||
           u.username.toLowerCase().includes(term.toLowerCase()))
      );
      setSearchedUsers(results);
    } else {
      setSearchedUsers([]);
    }
    setSelectedRecipient(null); // Clear selection if search term changes
  };

  const handleSelectRecipient = (user: MockUser) => {
    setSelectedRecipient(user);
    setUserSearchTerm(user.name); // Fill input with selected user's name
    setSearchedUsers([]); // Hide search results
  };

  const handleSendClick = () => {
    if (!selectedRecipient) return;
    onSendRecommendation(selectedRecipient, recommendationMessage || undefined);
    onOpenChange(false); // Close dialog after sending
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Recommend "{book.title}"</DialogTitle>
          <DialogDescription>
            Share this book with another user. Search for a user below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Recipient Search */}
          <div className="relative space-y-1">
            <label htmlFor="recipient-search-dialog" className="text-sm font-medium">
              To:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="recipient-search-dialog"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => handleUserSearch(e.target.value)}
                className="pl-10"
                autoComplete="off" // Prevent browser autocomplete interference
              />
            </div>
            {/* User Search Results Dropdown */}
            {searchedUsers.length > 0 && (
              <Card className="absolute z-20 w-full mt-1 max-h-40 overflow-y-auto shadow-md border">
                <CardContent className="p-2">
                  {searchedUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2 mb-1"
                      onClick={() => handleSelectRecipient(user)}
                    >
                      <Avatar className="h-7 w-7 mr-2 border">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
            {selectedRecipient && !searchedUsers.length && (
              <p className="text-xs text-muted-foreground pl-2 pt-1">
                Selected: {selectedRecipient.name} (@{selectedRecipient.username})
              </p>
            )}
          </div>

          {/* Message (Optional) */}
          <div className="space-y-1">
            <label htmlFor="rec-message-dialog" className="text-sm font-medium">
              Message (Optional):
            </label>
            <Textarea
              id="rec-message-dialog"
              placeholder="Add a personal note..."
              value={recommendationMessage}
              onChange={(e) => setRecommendationMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSendClick}
            disabled={!selectedRecipient}
          >
            <Send className="mr-2 h-4 w-4" /> Send Recommendation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
