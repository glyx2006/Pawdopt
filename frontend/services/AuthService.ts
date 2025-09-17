import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode, JwtPayload } from 'jwt-decode';

// ================== API ENDPOINT CONSTANTS ==================
const AUTH_API_BASE = 'https://pj0r2r59y5.execute-api.eu-west-2.amazonaws.com/default';
const PREFERENCES_API = 'https://y2wy5m6frb.execute-api.eu-west-2.amazonaws.com/default/preferences';

// ================== INTERFACES ==================
interface StructuredAddress {
  formatted: string;
}

interface CustomJwtPayload extends JwtPayload {
  'custom:role': 'shelter' | 'adopter';
  sub: string;
  email: string;
  name: string;
  phone_number: string;
  address: string | StructuredAddress;
  'custom:postcode': string;
  'custom:iconURL'?: string;
}

export interface UserAttributes {
  sub: string;
  email: string;
  name: string;
  phone_number: string;
  address: StructuredAddress;
  'custom:postcode': string;
  'custom:iconURL': string;
  'custom:role': 'shelter' | 'adopter' | '';
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  dob: string;
  gender: string;
  address: string;
  postcode: string;
  phoneNo: string;
  role: string;
  experience?: string;
  shelterName?: string;
  latitude?: string;
  longitude?: string;
}

// ================== UTILITY FUNCTIONS ==================
const safeJsonParse = (value: string): any => {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string') {
      return safeJsonParse(parsed);
    }
    return parsed;
  } catch {
    return value;
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp !== undefined && decoded.exp < now;
  } catch {
    return true;
  }
};

// ================== TOKEN MANAGEMENT ==================
export const getIdToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem('idToken');
  if (!token || isTokenExpired(token)) {
    const refreshedTokens = await refreshSession();
    return refreshedTokens ? refreshedTokens.idToken : null;
  }
  return token;
};

export const getAccessToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token || isTokenExpired(token)) {
    const refreshedTokens = await refreshSession();
    return refreshedTokens ? refreshedTokens.accessToken : null;
  }
  return token;
};

// ================== USER INFO ==================
export const getCurrentUserAttributes = async (): Promise<UserAttributes | null> => {
  try {
    let idToken = await AsyncStorage.getItem('idToken');
    let accessToken = await AsyncStorage.getItem('accessToken');

    if (!idToken || !accessToken) {
      const refreshedTokens = await refreshSession();
      if (refreshedTokens) {
        idToken = refreshedTokens.idToken;
        accessToken = refreshedTokens.accessToken;
      } else {
        return null;
      }
    }

    const decodedToken = jwtDecode<CustomJwtPayload>(idToken);
    let parsedAddress: StructuredAddress = { formatted: '' };

    if (typeof decodedToken.address === 'object' && decodedToken.address !== null) {
      if (typeof decodedToken.address.formatted === 'string') {
        const parsedFormatted = safeJsonParse(decodedToken.address.formatted);
        parsedAddress.formatted = parsedFormatted.formatted || parsedFormatted;
      } else {
        parsedAddress = decodedToken.address;
      }
    } else if (typeof decodedToken.address === 'string') {
      const parsedFormatted = safeJsonParse(decodedToken.address);
      parsedAddress.formatted = parsedFormatted.formatted || parsedFormatted;
    }

    return {
      sub: decodedToken.sub || '',
      email: decodedToken.email || '',
      name: decodedToken.name || '',
      phone_number: decodedToken.phone_number || '',
      address: parsedAddress,
      'custom:postcode': decodedToken['custom:postcode'] || '',
      'custom:iconURL': decodedToken['custom:iconURL'] || '',
      'custom:role': decodedToken['custom:role'] || '',
    };
  } catch {
    return null;
  }
};

export const getUserRole = async (): Promise<'shelter' | 'adopter' | null> => {
  const userAttributes = await getCurrentUserAttributes();
  return userAttributes?.['custom:role'] || null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAccessToken();
  return !!token;
};

// ================== AUTHENTICATION ACTIONS ==================
export const signUp = async (params: SignUpParams): Promise<{ idToken?: string; accessToken?: string; refreshToken?: string }> => {
  try {
    const response = await fetch(`${AUTH_API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(params),
    });

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const { idToken, accessToken, refreshToken } = data;
    if (idToken) await AsyncStorage.setItem('idToken', idToken);
    if (accessToken) await AsyncStorage.setItem('accessToken', accessToken);
    if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);

    return { idToken, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<{ idToken: string; accessToken: string; refreshToken?: string }> => {
  try {
    const response = await fetch(`${AUTH_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed.');

    const { idToken, accessToken, refreshToken } = data;
    await AsyncStorage.setItem('idToken', idToken);
    await AsyncStorage.setItem('accessToken', accessToken);
    if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);

    // Handle adopter preferences (legacy behavior)
    const decodedToken: CustomJwtPayload = jwtDecode(idToken);
    if (decodedToken['custom:role'] === 'adopter') {
      const getResponse = await fetch(PREFERENCES_API, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      });

      if (getResponse.ok) {
        const preferencesData = await getResponse.json();
        if (!preferencesData || Object.keys(preferencesData).length === 0) {
          await createAdopterPreferences(accessToken);
        }
      } else {
        throw new Error(`Failed to fetch adopter preferences`);
      }
    }

    return { idToken, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  await AsyncStorage.multiRemove(['idToken', 'accessToken', 'refreshToken']);
};

export const refreshSession = async (): Promise<{ idToken: string; accessToken: string } | null> => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${AUTH_API_BASE}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      await signOut();
      return null;
    }

    const { idToken, accessToken } = data;
    await AsyncStorage.setItem('idToken', idToken);
    await AsyncStorage.setItem('accessToken', accessToken);
    return { idToken, accessToken };
  } catch {
    await signOut();
    return null;
  }
};

// ================== USER MANAGEMENT ==================
export const updateUserAttributes = async (attributes: Record<string, string>): Promise<void> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No access token available. Please log in.');

  const response = await fetch(`${AUTH_API_BASE}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(attributes),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user attributes: ${await response.text()}`);
  }
  await refreshSession();
};

// ================== ADOPTER PREFERENCES ==================
export const createAdopterPreferences = async (token: string): Promise<void> => {
  const defaultPreferences = {
    minAge: null,
    maxAge: null,
    size: ['Any'],
    color: ['Any'],
    preferredBreeds: ['Any'],
  };

  const response = await fetch(PREFERENCES_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(defaultPreferences),
  });

  if (!response.ok) {
    throw new Error(`Failed to create adopter preferences: ${await response.text()}`);
  }
};

// Export default for easy importing
export default {
  // Token management
  getIdToken,
  getAccessToken,
  
  // User info
  getCurrentUserAttributes,
  getUserRole,
  isAuthenticated,
  
  // Authentication actions
  signUp,
  signIn,
  signOut,
  refreshSession,
  
  // User management
  updateUserAttributes,
  createAdopterPreferences,
};