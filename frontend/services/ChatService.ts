// Chat Service
// Handles all chat-related operations
import { gql } from '@apollo/client';
import { getIdToken } from './AuthService';

// ================== API ENDPOINT CONSTANTS ==================
const CHAT_API_BASE = 'https://7ng635vzx5.execute-api.eu-west-2.amazonaws.com/default/chatCRUD';

// ================== INTERFACES ==================
// Interface for raw chat data from DynamoDB
interface RawChatData {
  chatId: string;
  adopterId: string;
  shelterId: string;
  dogId: string;
  dogCreatedAt: string;
  status: string;
  createdAt: string;
}

// Interface for enriched chat data for the frontend
export interface EnrichedChatData {
  chatId: string;
  dogId: string;
  dogName: string;
  dogCreatedAt: string;
  dogPhotoUrl?: string;
  shelterId: string;
  shelterName: string;
  adopterId: string;
  adopterName: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  status: 'pending_request' | 'active' | 'closed' | 'rejected';
  unreadCount?: number;
  otherParticipantPhotoUrl: string;
}

// ================== GRAPHQL QUERIES & MUTATIONS ==================
export const GET_MESSAGES = gql`
  query GetMessages($chatId: ID!) {
    getMessages(chatId: $chatId) {
      id
      text
      createdAt
      senderId
    }
  }
`;

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      messageId: message_id
      chatId: chat_id
      senderId: sender_id
      text
      sentAt: sent_at
      readStatus: read_status
    }
  }
`;

export const ON_NEW_MESSAGE = gql`
  subscription OnNewMessage {
    onCreateMessage {
      message_id
      chat_id
      sent_at
      sender_id
      text
      read_status
    }
  }
`;

export const LIST_MESSAGES = gql`
  query ListMessages(
    $filter: TableMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        messageId: message_id
        chatId: chat_id
        text
        sentAt: sent_at
        senderId: sender_id
        readStatus: read_status
      }
      nextToken
    }
  }
`;

// ================== CHAT OPERATIONS ==================
export const createChat = async (adopterId: string, dogId: string, dogCreatedAt: string): Promise<string> => {
  const token = await getIdToken();
  if (!token) throw new Error("No token available");

  const response = await fetch(`${CHAT_API_BASE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ adopterId, dogId, dogCreatedAt }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create chat: ${await response.text()}`);
  }

  const data = await response.json();
  return data.chatId;
};

export const fetchUserChats = async (): Promise<RawChatData[]> => {
  const token = await getIdToken();
  if (!token) {
    throw new Error("No token available. Please log in.");
  }

  const response = await fetch(CHAT_API_BASE, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch chats: ${text}`);
  }

  const data = await response.json();
  return data.chats || [];
};

// ================== CHAT DATA ENRICHMENT ==================
// Circuit breaker pattern for API resilience
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open - service temporarily unavailable');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.failureCount >= this.threshold && 
           (Date.now() - this.lastFailureTime) < this.timeout;
  }

  private onSuccess(): void {
    this.failureCount = 0;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }
}

const chatCircuitBreaker = new CircuitBreaker();

// Helper functions for enriching chat data
export const getShelterDetails = async (shelterId: string): Promise<{ name: string; photoUrl?: string }> => {
  // TODO: Implement when shelter API is available
  // For now, return placeholder data
  return {
    name: `Shelter (${shelterId.substring(0, 8)})`,
    photoUrl: 'https://via.placeholder.com/50/C1FFDD/000000?text=SH'
  };
};

export const enrichChatData = async (rawChats: RawChatData[], userRole: 'adopter' | 'shelter'): Promise<EnrichedChatData[]> => {
  // Import getDogById and getAdopterDetails here to avoid circular dependencies
  const { getDogById } = await import('./DogService');
  const { getAdopterDetails } = await import('./UserService');

  // Process chats in smaller batches to avoid overwhelming APIs
  const BATCH_SIZE = 5;
  const results: EnrichedChatData[] = [];
  
  for (let i = 0; i < rawChats.length; i += BATCH_SIZE) {
    const batch = rawChats.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (chat) => {
        try {
          // Fetch dog details with timeout protection
          let dogName = `Dog ${chat.dogId.substring(0, 8)}`;
          let dogPhotoUrl = 'https://via.placeholder.com/50/FFE4B5/000000?text=DOG';
          
          try {
            const dogData = await Promise.race([
              getDogById(chat.dogId, chat.dogCreatedAt, await getIdToken() || ''),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Dog fetch timeout')), 8000)
              )
            ]);
            
            dogName = dogData.name || dogName;
            if (dogData.photoURLs && dogData.photoURLs.length > 0) {
              dogPhotoUrl = dogData.photoURLs[0];
            }
            console.log(`Successfully fetched dog: ${dogName}`);
          } catch (error) {
            console.warn(`Failed to fetch dog details for ${chat.dogId}:`, error);
          }

          // Fetch user details with improved error handling
          let shelterName = `Shelter (${chat.shelterId.substring(0, 8)})`;
          let adopterName = `Adopter (${chat.adopterId.substring(0, 8)})`;
          let otherParticipantPhotoUrl = 'https://via.placeholder.com/50/CCCCCC/000000?text=?';

          // Use Promise.allSettled to handle partial failures gracefully
          const [shelterResult, adopterResult] = await Promise.allSettled([
            getShelterDetails(chat.shelterId),
            getAdopterDetails(chat.adopterId)
          ]);

          if (shelterResult.status === 'fulfilled') {
            shelterName = shelterResult.value.name;
            if (userRole === 'adopter') {
              otherParticipantPhotoUrl = shelterResult.value.photoUrl || 'https://via.placeholder.com/50/C1FFDD/000000?text=SH';
            }
          } else {
            console.warn(`Failed to fetch shelter details for ${chat.shelterId}:`, shelterResult.reason);
          }

          if (adopterResult.status === 'fulfilled') {
            adopterName = adopterResult.value.name;
            if (userRole === 'shelter') {
              otherParticipantPhotoUrl = adopterResult.value.photoUrl || 'https://via.placeholder.com/50/FFDDC1/000000?text=AD';
            }
          } else {
            console.warn(`Failed to fetch adopter details for ${chat.adopterId}:`, adopterResult.reason);
          }

          return {
            chatId: chat.chatId,
            dogId: chat.dogId,
            dogName,
            dogCreatedAt: chat.dogCreatedAt,
            dogPhotoUrl,
            shelterId: chat.shelterId,
            shelterName,
            adopterId: chat.adopterId,
            adopterName,
            lastMessageAt: chat.createdAt, // TODO: Replace with actual last message time
            lastMessagePreview: 'Chat created', // TODO: Replace with actual last message
            status: chat.status as 'pending_request' | 'active' | 'closed' | 'rejected',
            unreadCount: 0, // TODO: Implement unread count
            otherParticipantPhotoUrl
          };
        } catch (error) {
          console.error(`Failed to enrich chat data for ${chat.chatId}:`, error);
          
          // Return minimal fallback data
          return {
            chatId: chat.chatId,
            dogId: chat.dogId,
            dogName: `Dog ${chat.dogId.substring(0, 8)}`,
            dogCreatedAt: chat.dogCreatedAt || '2024-01-01T00:00:00Z',
            shelterId: chat.shelterId,
            shelterName: `Shelter (${chat.shelterId.substring(0, 8)})`,
            adopterId: chat.adopterId,
            adopterName: `Adopter (${chat.adopterId.substring(0, 8)})`,
            lastMessageAt: chat.createdAt,
            lastMessagePreview: 'Chat created',
            status: chat.status as 'pending_request' | 'active' | 'closed' | 'rejected',
            unreadCount: 0,
            otherParticipantPhotoUrl: 'https://via.placeholder.com/50/CCCCCC/000000?text=?'
          };
        }
      })
    );

    // Extract successful results and add to final array
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    });

    // Add small delay between batches to be gentle on the APIs
    if (i + BATCH_SIZE < rawChats.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
};

// Export default for easy importing
export default {
  // Chat operations
  createChat,
  fetchUserChats,
  enrichChatData,
  getShelterDetails,
  
  // GraphQL operations
  GET_MESSAGES,
  CREATE_MESSAGE,
  ON_NEW_MESSAGE,
  LIST_MESSAGES,
};
