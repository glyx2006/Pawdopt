import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode, JwtPayload } from 'jwt-decode';

// Define the type for the structured address object
interface StructuredAddress {
  formatted: string;
}

// Define a custom interface to extend JwtPayload with your custom attributes
interface CustomJwtPayload extends JwtPayload {
  'custom:role': 'shelter' | 'adopter';
  sub: string;
  email: string;
  name: string;
  phone_number: string;
  address: string | StructuredAddress; // Address claim can be a string or an object
  'custom:postcode': string;
  'custom:iconURL'?: string;
}

// Define the precise type for the object returned by getCurrentUserAttributes
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

/**
 * A utility function to safely and recursively parse a JSON string.
 * It will keep parsing until the value is no longer a stringified JSON object.
 */
const safeJsonParse = (value: string): any => {
  try {
    const parsed = JSON.parse(value);
    // If the parsed result is still a string, it means it was doubly stringified.
    // Recursively call the function to get the actual value.
    if (typeof parsed === 'string') {
      return safeJsonParse(parsed);
    }
    return parsed;
  } catch (e) {
    // If parsing fails, return the original value.
    return value;
  }
};

/**
 * Retrieves the currently authenticated user's attributes by decoding the stored ID token.
 * @returns {Promise<UserAttributes | null>} A promise that resolves to an object of user attributes,
 * or null if no user is authenticated.
 */
export const getCurrentUserAttributes = async (): Promise<UserAttributes | null> => {
  try {
    let idToken = await AsyncStorage.getItem('idToken');
    let accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!idToken || !accessToken) {
      const refreshedTokens = await refreshSession();
      if (refreshedTokens) {
        idToken = refreshedTokens.idToken;
        accessToken = refreshedTokens.accessToken;
        // ...existing code...
      } else {
        // ...existing code...
        return null;
      }
    }
    
    const decodedToken = jwtDecode<CustomJwtPayload>(idToken);
    // ...existing code...

    let parsedAddress: StructuredAddress = { formatted: '' };

    // Check if the address is a structured object
    if (typeof decodedToken.address === 'object' && decodedToken.address !== null) {
        // If it's an object, check if its 'formatted' value is a string that needs parsing
        if (typeof decodedToken.address.formatted === 'string') {
            const parsedFormatted = safeJsonParse(decodedToken.address.formatted);
            // After parsing, the result might be another object, so extract the final formatted string.
            parsedAddress.formatted = parsedFormatted.formatted || parsedFormatted;
        } else {
            // Otherwise, just use the value of formatted as is
            parsedAddress = decodedToken.address;
        }
    } else if (typeof decodedToken.address === 'string') {
        // If it's a direct string (not an object), parse it
        const parsedFormatted = safeJsonParse(decodedToken.address);
        parsedAddress.formatted = parsedFormatted.formatted || parsedFormatted;
    }
    
    const attributes: UserAttributes = {
      'sub': decodedToken.sub || '',
      'email': decodedToken.email || '',
      'name': decodedToken.name || '',
      'phone_number': decodedToken.phone_number || '',
      'address': parsedAddress,
      'custom:postcode': decodedToken['custom:postcode'] || '',
      'custom:iconURL': decodedToken['custom:iconURL'] || '',
      'custom:role': decodedToken['custom:role'] || '',
    };
    // ...existing code...
    return attributes;
  } catch (e) {
    // ...existing code...
    return null;
  }
};

/**
 * Retrieves the stored ID token.
 * @returns {Promise<string | null>} The ID token string, or null if not found.
 */
export const getIdToken = async (): Promise<string> => {
  return await AsyncStorage.getItem('idToken') ?? '';
};

/**
 * Retrieves the stored Access Token.
 * @returns {Promise<string | null>} The Access Token string, or null if not found.
 */
export const getAccessToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token || isTokenExpired(token)) {
    // ...existing code...
    const refreshedTokens = await refreshSession();
    // ...existing code...
    return refreshedTokens ? refreshedTokens.accessToken : null;
  }
  // ...existing code...
  return token;
};

/**
 * Checks if a JWT token is expired.
 * @param token The JWT token to check.
 * @returns {boolean} True if the token is expired, false otherwise.
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // current time in seconds
    const isExpired = decoded.exp !== undefined && decoded.exp < now;
    // ...existing code...
    return isExpired;
  } catch (e) {
    // ...existing code...
    return true; // Assume expired on error
  }
};


/**
 * Logs the user out by clearing the stored tokens.
 * @returns {Promise<void>}
 */
export const signOut = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('idToken');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    // ...existing code...
  } catch (e) {
    // ...existing code...
  }
};

/**
 * Handles user sign-up by calling the Lambda signup function.
 * @param params The user's signup details.
 * @returns A promise that resolves with the ID token and access token on success.
 */
export async function signUp(params: {
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
}): Promise<{ idToken?: string; accessToken?: string; refreshToken?: string }> {
  
  const url = `https://sd9to5sjo8.execute-api.eu-west-2.amazonaws.com/default/CognitoSignUpFunction`;
  
  console.log('SignUp Request - Role:', params.role);
  console.log('SignUp Request - Coordinates:', { latitude: params.latitude, longitude: params.longitude });
  console.log('SignUp Request - Full payload:', JSON.stringify(params, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);


    // Try to get response text first
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('Response text:', responseText);
    
    } catch (textError) {
      console.log('Error reading response text:', textError);
      throw new Error('Failed to read server response');
    }

    // Parse JSON from text
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
   
    } catch (jsonError) {
      console.log('JSON parse error:', jsonError);
      throw new Error(`Server returned invalid JSON: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const { idToken, accessToken, refreshToken } = data;
    if (idToken) await AsyncStorage.setItem('idToken', idToken);
    if (accessToken) await AsyncStorage.setItem('accessToken', accessToken);
    if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);

    return { idToken, accessToken, refreshToken };
  } catch (error) {
    console.log('SignUp error:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to signup service. Please check your internet connection and try again.');
    }
    throw error;
  }
}

/**
 * Handles user sign-in by calling the Lambda login function.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves with the ID token and access token on success.
 */
export async function signIn(email: string, password: string): Promise<{ idToken: string; accessToken: string; refreshToken?: string }> {
  // ...existing code...
  try {
    const response = await fetch(`https://55kq17gfi7.execute-api.eu-west-2.amazonaws.com/default/CognitoLoginFunction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed.');
    }

    const { idToken, accessToken, refreshToken } = data;
    await AsyncStorage.setItem('idToken', idToken);
    await AsyncStorage.setItem('accessToken', accessToken);
    // FIX: Ensure refreshToken is always stored if it exists in the response
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
      // ...existing code...
    } else {
      // ...existing code...
    }
    
    // ...existing code...
    return { idToken, accessToken, refreshToken };
  } catch (error) {
    // ...existing code...
    throw error;
  }
}


/**
 * Refreshes the user's session using the stored refresh token.
 * @returns {Promise<{idToken: string; accessToken: string} | null>} New ID and Access tokens, or null if refresh fails.
 */
export async function refreshSession(): Promise<{ idToken: string; accessToken: string } | null> {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) {
    // ...existing code...
    return null;
  }
  // ...existing code...

  try {
    const response = await fetch(`https://ptyql0y64k.execute-api.eu-west-2.amazonaws.com/default/RefreshSessionFunction`, { // New Lambda endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // ...existing code...
      await signOut(); // Clear tokens if refresh fails
      return null;
    }

    const { idToken, accessToken } = data;
    await AsyncStorage.setItem('idToken', idToken);
    await AsyncStorage.setItem('accessToken', accessToken);
    // ...existing code...
    return { idToken, accessToken };
  } catch (error) {
    // ...existing code...
    await signOut(); // Clear tokens on network/unexpected error
    return null;
  }
}


/**
 * Updates user attributes by calling a Lambda function.
 * @param {Record<string, string>} attributes A map of attribute names to their new values.
 * @returns {Promise<void>} A promise that resolves on successful update.
 */
export async function updateUserAttributes(attributes: Record<string, string>): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    // ...existing code...
    throw new Error('No access token available. Please log in.');
  }

  try {
    const response = await fetch(`https://trb1e74wd2.execute-api.eu-west-2.amazonaws.com/default/UpdateUserAttributesFunction`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(attributes),
    });

    // ...existing code...

    if (!response.ok) {
      const errorText = await response.text();
      // ...existing code...
      throw new Error(`Failed to update user attributes: ${errorText}`);
    }
    
    // CRITICAL FIX: Refresh the session after a successful update
    await refreshSession();
    // ...existing code...
  } catch (error) {
    // ...existing code...
    throw error;
  }
}
