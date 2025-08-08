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
  console.log("--> getCurrentUserAttributes called.");
  try {
    let idToken = await AsyncStorage.getItem('idToken');
    let accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!idToken || !accessToken) {
      console.warn("No ID token or access token found. Attempting to refresh session.");
      const refreshedTokens = await refreshSession();
      if (refreshedTokens) {
        idToken = refreshedTokens.idToken;
        accessToken = refreshedTokens.accessToken;
        console.log("Successfully refreshed session and got new tokens.");
      } else {
        console.error("Failed to refresh session, no user is currently logged in.");
        return null;
      }
    }
    
    console.log("Decoding ID token:", idToken);
    const decodedToken = jwtDecode<CustomJwtPayload>(idToken);
    console.log("Decoded Token Data:", decodedToken);

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
    console.log("User attributes to be returned:", attributes);
    console.log("<-- getCurrentUserAttributes finished.");
    return attributes;
  } catch (e) {
    console.error("Error decoding token or fetching attributes:", e);
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
  console.log("--> getAccessToken called.");
  const token = await AsyncStorage.getItem('accessToken');
  if (!token || isTokenExpired(token)) {
    console.warn("Access token expired or not found, refreshing session...");
    const refreshedTokens = await refreshSession();
    console.log("<-- getAccessToken returning refreshed token.");
    return refreshedTokens ? refreshedTokens.accessToken : null;
  }
  console.log("<-- getAccessToken returning stored token.");
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
    if (isExpired) {
      console.log("Token is expired.");
    } else {
      console.log("Token is not expired.");
    }
    return isExpired;
  } catch (e) {
    console.error("Error decoding token for expiration check:", e);
    return true; // Assume expired on error
  }
};


/**
 * Logs the user out by clearing the stored tokens.
 * @returns {Promise<void>}
 */
export const signOut = async (): Promise<void> => {
  try {
    console.log("--> signOut called, clearing tokens.");
    await AsyncStorage.removeItem('idToken');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    console.log("<-- User logged out successfully.");
  } catch (e) {
    console.error("Error signing out:", e);
  }
};

/**
 * Handles user sign-in by calling the Lambda login function.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves with the ID token and access token on success.
 */
export async function signIn(email: string, password: string): Promise<{ idToken: string; accessToken: string; refreshToken?: string }> {
  console.log("--> signIn called.");
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
      console.log("Refresh token successfully stored.");
    } else {
      console.warn("No refresh token received during sign-in.");
    }
    
    console.log("<-- Sign-in successful, tokens stored.");
    return { idToken, accessToken, refreshToken };
  } catch (error) {
    console.error("Sign-in failed:", error);
    throw error;
  }
}


/**
 * Refreshes the user's session using the stored refresh token.
 * @returns {Promise<{idToken: string; accessToken: string} | null>} New ID and Access tokens, or null if refresh fails.
 */
export async function refreshSession(): Promise<{ idToken: string; accessToken: string } | null> {
  console.log("--> refreshSession called.");
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.log("No refresh token found. Cannot refresh session.");
    return null;
  }
  console.log("Using refresh token to get new session.");

  try {
    const response = await fetch(`https://ptyql0y64k.execute-api.eu-west-2.amazonaws.com/default/RefreshSessionFunction`, { // New Lambda endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Session refresh failed:", data.error || 'Unknown error');
      await signOut(); // Clear tokens if refresh fails
      return null;
    }

    const { idToken, accessToken } = data;
    await AsyncStorage.setItem('idToken', idToken);
    await AsyncStorage.setItem('accessToken', accessToken);
    
    console.log("<-- Session refreshed successfully. New tokens stored.");
    return { idToken, accessToken };
  } catch (error) {
    console.error("Error during session refresh:", error);
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
  console.log("--> updateUserAttributes called.");
  const token = await getAccessToken();
  if (!token) {
    console.error("No access token available. Please log in.");
    throw new Error('No access token available. Please log in.');
  }

  try {
    console.log("Calling backend to update attributes with payload:", attributes);
    const response = await fetch(`https://trb1e74wd2.execute-api.eu-west-2.amazonaws.com/default/UpdateUserAttributesFunction`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(attributes),
    });

    console.log(`Backend response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error updating attributes:", errorText);
      throw new Error(`Failed to update user attributes: ${errorText}`);
    }
    
    console.log("User attributes updated successfully via backend. Now refreshing session to get new tokens.");
    // CRITICAL FIX: Refresh the session after a successful update
    await refreshSession();
    console.log("<-- Session refreshed after attribute update.");
  } catch (error) {
    console.error("Error updating user attributes:", error);
    throw error;
  }
}
