
export type ChatType = 'direct' | 'group';

export interface Chat {
  id: string; // Unique ID for the chat (user ID for direct, group ID for group)
  name: string; // User's name or Group name
  type: ChatType;
  lastMessage?: string; // Preview of the last message
  timestamp: Date; // Timestamp of the last message or chat creation
  unreadCount: number; // Number of unread messages
  avatarUrl?: string; // URL for user/group avatar
}

export interface Message {
  id: string; // Unique ID for the message
  senderId: string; // ID of the user who sent the message
  senderName: string; // Name of the sender
  text: string; // Content of the message
  timestamp: Date; // Time the message was sent
  avatarUrl?: string; // Sender's avatar (can be redundant if fetched elsewhere)
}
