// User Service
// Handles user profile operations for adopters and shelters
import { getIdToken } from './AuthService';
import { AdopterProfile } from '../App';

// ================== API ENDPOINT CONSTANTS ==================
const ADOPTER_API_BASE = 'https://hljqzvnyla.execute-api.eu-west-2.amazonaws.com/default/adoptersCRUD';

// ================== UTILITY FUNCTIONS ==================
// Utility function to create timeout signal for React Native compatibility
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

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

const adopterApiCircuitBreaker = new CircuitBreaker();

// ================== ADOPTER OPERATIONS ==================
export const getAdoptersByIds = async (adopterIds: string[]): Promise<AdopterProfile[]> => {
  if (adopterIds.length === 0) return [];
  
  const token = await getIdToken();
  if (!token) throw new Error("Authentication token not found.");

  try {
    return await retryWithBackoff(async () => {
      const response = await fetch(`${ADOPTER_API_BASE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adopterIds }),
        signal: createTimeoutSignal(10000) // 10 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json();
    }, 2, 500); // Reduced to 2 retries with 500ms base delay
    
  } catch (error) {
    console.error('Failed to fetch adopter profiles after retries:', error);
    
    // Return fallback data for all requested IDs
    return adopterIds.map(id => ({
      adopterId: id,
      adopterName: `Adopter (${id.substring(0, 8)})`,
      iconUrl: 'https://via.placeholder.com/50/FFDDC1/000000?text=AD'
    } as AdopterProfile));
  }
};

export const getAdopterDetails = async (adopterId: string): Promise<{ name: string; photoUrl?: string }> => {
  try {
    return await adopterApiCircuitBreaker.execute(async () => {
      const adopters = await getAdoptersByIds([adopterId]);
      const adopter = adopters[0];
      if (adopter) {
        return {
          name: adopter.adopterName,
          photoUrl: adopter.iconUrl || 'https://via.placeholder.com/50/FFDDC1/000000?text=AD'
        };
      }
      throw new Error('Adopter not found');
    });
  } catch (error) {
    console.error(`Failed to fetch adopter details for ${adopterId}:`, error);
    
    // Enhanced fallback with more descriptive placeholder
    return {
      name: `Adopter (${adopterId.substring(0, 8)})`,
      photoUrl: 'https://via.placeholder.com/50/FFDDC1/000000?text=AD'
    };
  }
};

// ================== SHELTER OPERATIONS ==================
export const getShelterDetails = async (shelterId: string): Promise<{ name: string; photoUrl?: string }> => {
  // TODO: Implement when shelter API is available
  // For now, return placeholder data
  return {
    name: `Shelter (${shelterId.substring(0, 8)})`,
    photoUrl: 'https://via.placeholder.com/50/C1FFDD/000000?text=SH'
  };
};

// ================== USER PROFILE OPERATIONS ==================
export const getUserProfile = async (userId: string, userType: 'adopter' | 'shelter'): Promise<any> => {
  if (userType === 'adopter') {
    const adopters = await getAdoptersByIds([userId]);
    return adopters[0] || null;
  } else {
    return await getShelterDetails(userId);
  }
};

// Export default for easy importing
export default {
  // Adopter operations
  getAdoptersByIds,
  getAdopterDetails,
  
  // Shelter operations
  getShelterDetails,
  
  // General user operations
  getUserProfile,
};