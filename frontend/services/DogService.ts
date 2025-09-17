// Dog Service
// Handles all dog-related operations
import { Configuration, DogsApi, Dog } from '../generated';
import { getIdToken } from './AuthService';

// ================== API ENDPOINT CONSTANTS ==================
const DOG_API_BASE = 'https://m4gwfeebyk.execute-api.eu-west-2.amazonaws.com';

// ================== CONFIGURATION ==================
export const dogApiConfig = new Configuration({
  basePath: DOG_API_BASE,
  accessToken: async () => (await getIdToken()) ?? '',
});

export const dogsApi = new DogsApi(dogApiConfig);

// ================== UTILITY FUNCTIONS ==================
// Retry utility function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// ================== DOG CRUD OPERATIONS ==================
export const createDog = async (data: any, token: string): Promise<Response> => {
  const response = await fetch(`${DOG_API_BASE}/dog`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
};

export const getDogById = async (dogId: string, dogCreatedAt: string, token: string): Promise<Dog> => {
  const response = await fetch(`${DOG_API_BASE}/dog/${dogId}`, {
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
};

export const updateDog = async (dogId: string, data: any, token: string): Promise<Response> => {
  console.log('Frontend updating dog with this data:', JSON.stringify(data, null, 2));
  
  const response = await fetch(`${DOG_API_BASE}/dog/${dogId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
};

export const deleteDog = async (dogId: string, dogCreatedAt: string, token: string): Promise<Response> => {
  const response = await fetch(`${DOG_API_BASE}/dog/${dogId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-created-at': dogCreatedAt,
    },
  });

  return response;
};

// ================== BATCH OPERATIONS ==================
export const getDogsByIds = async (dogsInfo: Array<{ dogId: string; dogCreatedAt: string }>): Promise<Dog[]> => {
  const token = await getIdToken();
  if (!token) {
    throw new Error("No token available. Please log in.");
  }

  // Use Promise.all to fetch all dogs concurrently for better performance
  const fetchPromises = dogsInfo.map(async ({ dogId, dogCreatedAt }) => {
    try {
      return await getDogById(dogId, dogCreatedAt, token);
    } catch (error) {
      console.error(`Failed to fetch dog with ID ${dogId}:`, error);
      // Return null so we can filter out failed requests later
      return null;
    }
  });

  const results = await Promise.all(fetchPromises);
  
  // Filter out any null results from failed fetches
  return results.filter(dog => dog !== null) as Dog[];
};

// ================== SEARCH & FILTERING ==================
export const searchDogs = async (filters: any): Promise<Dog[]> => {
  // This can be implemented when the search endpoint is available
  // For now, return empty array
  return [];
};

export const getDogsByShelter = async (shelterId: string): Promise<Dog[]> => {
  // This can be implemented when the shelter-specific endpoint is available
  // For now, return empty array
  return [];
};

// ================== LEGACY SUPPORT ==================
// These are for backward compatibility with existing code
export const uploadDogProfile = createDog;
export const updateDogProfile = updateDog;
export const getDogProfileById = getDogById;

// Export default for easy importing
export default {
  // CRUD operations
  createDog,
  getDogById,
  updateDog,
  deleteDog,
  
  // Batch operations
  getDogsByIds,
  
  // Search & filtering
  searchDogs,
  getDogsByShelter,
  
  // Generated API
  dogsApi,
  dogApiConfig,
  
  // Legacy aliases
  uploadDogProfile,
  updateDogProfile,
  getDogProfileById,
};