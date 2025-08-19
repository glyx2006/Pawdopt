import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { Configuration, DogsApi, SwipesApi } from '../generated';
import { getIdToken, getAccessToken } from '../services/CognitoService';
import { Dog, AdopterProfile } from '../App';

global.Buffer = Buffer;

// ================== API ENDPOINT CONSTANTS ==================
const API_ENDPOINTS = {
  PRESIGN_IMAGE_URLS: 'https://1g53nof6f8.execute-api.eu-west-2.amazonaws.com/presignImageUrls',
  DOG_API_BASE: 'https://m4gwfeebyk.execute-api.eu-west-2.amazonaws.com',
  ADOPTER_API_BASE: 'https://hljqzvnyla.execute-api.eu-west-2.amazonaws.com/default/adoptersCRUD',
  CHAT_API_BASE: 'https://7ng635vzx5.execute-api.eu-west-2.amazonaws.com/default/chatCRUD',
} as const;

// ================== FUNCTIONS ==================
export async function getPresignedUrls(fileCount: number, token: string): Promise<{ uploadUrls: string[], keys: string[] }> {
  const response = await fetch(API_ENDPOINTS.PRESIGN_IMAGE_URLS, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ count: fileCount }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get pre-signed URLs: ${text}`);
  }

  const json = await response.json();
  console.log('Presigned URL response:', json);

  const uploadUrls = json.uploadUrls ?? json.urls ?? [];
  const keys = json.keys ?? [];

  return { uploadUrls, keys };
}

export async function uploadImagesToS3(uris: string[], urls: string[]) {
  const uploads = uris.map(async (uri, i) => {
    const res = await fetch(uri);
    const blob = await res.blob();

    const uploadRes = await fetch(urls[i], {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: blob,
    });

    return uploadRes;
  });

  const results = await Promise.all(uploads);
  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    throw new Error("One or more uploads failed.");
  }
}

export async function uploadDogProfile(data: any, token: string) {
  const response = await fetch(`${API_ENDPOINTS.DOG_API_BASE}/dog`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
}

export async function deleteDog(dogId: string, dogCreatedAt: string, token: string) {
  const response = await fetch(`${API_ENDPOINTS.DOG_API_BASE}/dog/${dogId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-created-at': dogCreatedAt,
    },
  });

  return response;
}

export async function updateDogProfile(dogId: string, data: any, token: string) {
  console.log('Frontend updating dog with this data:', JSON.stringify(data, null, 2));
  
  const response = await fetch(`${API_ENDPOINTS.DOG_API_BASE}/dog/${dogId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
}

export const dogApiConfig = new Configuration({
  basePath: API_ENDPOINTS.DOG_API_BASE,
  accessToken: async () => (await getIdToken()) ?? '',
});

export const dogsApi = new DogsApi(dogApiConfig);

export const swipeApiConfig = new Configuration({
  basePath: 'https://yvj4ov9377.execute-api.eu-west-2.amazonaws.com',
  accessToken: async () => (await getIdToken()) ?? ''
})

export const swipesApi = new SwipesApi(swipeApiConfig);

export async function getDogProfileById(dogId: string, dogCreatedAt: string, token: string): Promise<Dog> {
  const response = await fetch(`${API_ENDPOINTS.DOG_API_BASE}/dog/${dogId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-created-at': dogCreatedAt,
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get dog profile: ${text}`);
  }

  return response.json();
}

// NEW: Function to fetch details for multiple dogs by their IDs
// This will be called from AdoptionRequestsScreen.tsx
export async function getDogsByIds(dogsInfo: Array<{ dogId: string; dogCreatedAt: string }>): Promise<Dog[]> {
    const token = await getIdToken(); // Or use getIdToken() as per your backend
    if (!token) {
      throw new Error("No token available. Please log in.");
    }

    // Use Promise.all to fetch all dogs concurrently for better performance
    const fetchPromises = dogsInfo.map(async ({ dogId, dogCreatedAt }) => {
        try {
            return await getDogProfileById(dogId, dogCreatedAt, token);
        } catch (error) {
            console.error(`Failed to fetch dog with ID ${dogId}:`, error);
            // Return null so we can filter out failed requests later
            return null;
        }
    });

    const results = await Promise.all(fetchPromises);
    
    // Filter out any null results from failed fetches
    return results.filter(dog => dog !== null) as Dog[];
}
export async function getAdoptersByIds(adopterIds: string[]): Promise<AdopterProfile[]> {
  const token = await getIdToken();
  if (!token) throw new Error("Authentication token not found.");

  const response = await fetch(`${API_ENDPOINTS.ADOPTER_API_BASE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Pass the access token for authorization
    },
    body: JSON.stringify({ adopterIds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch adopter profiles: ${await response.text()}`);
  }

  return response.json();
}

// ================== CHAT API FUNCTIONS ==================

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

// Fetch all chats for current user
export async function fetchUserChats(): Promise<RawChatData[]> {
  const token = await getIdToken();
  if (!token) {
    throw new Error("No token available. Please log in.");
  }

  const response = await fetch(API_ENDPOINTS.CHAT_API_BASE, {
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
}

// Fetch shelter details by ID
export async function getShelterDetails(shelterId: string): Promise<{ name: string; photoUrl?: string }> {
  // TODO: Implement when shelter API is available
  // For now, return placeholder data
  return {
    name: `Shelter ${shelterId.substring(0, 8)}`,
    photoUrl: 'https://via.placeholder.com/50/C1FFDD/000000?text=SH'
  };
}

// Fetch adopter details by ID
export async function getAdopterDetails(adopterId: string): Promise<{ name: string; photoUrl?: string }> {
  try {
    const adopters = await getAdoptersByIds([adopterId]);
    const adopter = adopters[0];
    if (adopter) {
      return {
        name: adopter.adopterName,
        photoUrl: adopter.iconUrl || 'https://via.placeholder.com/50/FFDDC1/000000?text=AD'
      };
    }
  } catch (error) {
    console.error('Failed to fetch adopter details:', error);
  }
  
  // Fallback
  return {
    name: `Adopter ${adopterId.substring(0, 8)}`,
    photoUrl: 'https://via.placeholder.com/50/FFDDC1/000000?text=AD'
  };
}

// Enrich chat data with dog and user details
export async function enrichChatData(rawChats: RawChatData[], userRole: 'adopter' | 'shelter'): Promise<EnrichedChatData[]> {
  const enrichedChats = await Promise.all(rawChats.map(async (chat) => {
    try {
      // Fetch dog details
      let dogName = `Dog ${chat.dogId.substring(0, 8)}`;
      let dogPhotoUrl = 'https://via.placeholder.com/50/FFE4B5/000000?text=DOG';
      
      try {
        // Use the dogCreatedAt from chat record, or fallback to placeholder
        const createdAt = chat.dogCreatedAt ;
        console.log(`Fetching dog ${chat.dogId} with created_at: ${createdAt}`);
        const dogData = await getDogProfileById(chat.dogId, createdAt, await getIdToken() || '');
        dogName = dogData.name || dogName;
        if (dogData.photoURLs && dogData.photoURLs.length > 0) {
          dogPhotoUrl = dogData.photoURLs[0];
        }
        console.log(`Successfully fetched dog: ${dogName}`);
      } catch (error) {
        console.warn('Failed to fetch dog details for', chat.dogId, 'with created_at:', chat.dogCreatedAt, error);
      }

      // Fetch user details
      let shelterName = 'Unknown Shelter';
      let adopterName = 'Unknown Adopter';
      let otherParticipantPhotoUrl = 'https://via.placeholder.com/50/CCCCCC/000000?text=?';

      try {
        const [shelterDetails, adopterDetails] = await Promise.all([
          getShelterDetails(chat.shelterId),
          getAdopterDetails(chat.adopterId)
        ]);
        
        shelterName = shelterDetails.name;
        adopterName = adopterDetails.name;
        
        // Set photo of the other participant
        otherParticipantPhotoUrl = userRole === 'adopter' 
          ? (shelterDetails.photoUrl || 'https://via.placeholder.com/50/C1FFDD/000000?text=SH')
          : (adopterDetails.photoUrl || 'https://via.placeholder.com/50/FFDDC1/000000?text=AD');
      } catch (error) {
        console.warn('Failed to fetch user details for chat', chat.chatId, error);
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
      console.error('Failed to enrich chat data for', chat.chatId, error);
      // Return minimal data on error
      return {
        chatId: chat.chatId,
        dogId: chat.dogId,
        dogName: `Dog ${chat.dogId.substring(0, 8)}`,
        dogCreatedAt: chat.dogCreatedAt || '2024-01-01T00:00:00Z',
        shelterId: chat.shelterId,
        shelterName: `Shelter ${chat.shelterId.substring(0, 8)}`,
        adopterId: chat.adopterId,
        adopterName: `Adopter ${chat.adopterId.substring(0, 8)}`,
        lastMessageAt: chat.createdAt,
        lastMessagePreview: 'Chat created',
        status: chat.status as 'pending_request' | 'active' | 'closed' | 'rejected',
        unreadCount: 0,
        otherParticipantPhotoUrl: 'https://via.placeholder.com/50/CCCCCC/000000?text=?'
      };
    }
  }));

  return enrichedChats;
}