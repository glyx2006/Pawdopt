// Swipe Service
// Handles dog swiping operations
import { Configuration, SwipesApi } from '../generated';
import { getIdToken } from './AuthService';

// ================== API ENDPOINT CONSTANTS ==================
const SWIPE_API_BASE = 'https://yvj4ov9377.execute-api.eu-west-2.amazonaws.com';

// ================== CONFIGURATION ==================
export const swipeApiConfig = new Configuration({
  basePath: SWIPE_API_BASE,
  accessToken: async () => (await getIdToken()) ?? ''
});

export const swipesApi = new SwipesApi(swipeApiConfig);

// ================== SWIPE OPERATIONS ==================
export const createSwipe = async (dogId: string, dogCreatedAt: string, shelterId: string, direction: 'left' | 'right'): Promise<any> => {
  // Use the generated API for creating swipes
  return await swipesApi.createSwipe({
    swipeCreate: {
      dogId,
      dogCreatedAt,
      shelterId,
      direction,
    }
  });
};

export const getSwipesByAdopter = async (adopterId: string): Promise<any[]> => {
  // This can be implemented when the endpoint is available
  return [];
};

export const getSwipesByDog = async (dogId: string): Promise<any[]> => {
  // This can be implemented when the endpoint is available
  return [];
};

// Export default for easy importing
export default {
  // Swipe operations
  createSwipe,
  getSwipesByAdopter,
  getSwipesByDog,
  
  // Generated API
  swipesApi,
  swipeApiConfig,
};