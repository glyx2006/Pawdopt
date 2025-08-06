// services/CognitoService.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

/**
 * Retrieves the currently authenticated user's attributes by decoding the stored ID token.
 * @returns {Promise<Object | null>} A promise that resolves to an object of user attributes,
 * or null if no user is authenticated.
 */
export const getCurrentUserAttributes = async () => {
    try {
        const idToken = await AsyncStorage.getItem('idToken');
        if (!idToken) {
            console.log("No ID token found in storage.");
            return null;
        }

        const decodedToken = jwtDecode(idToken);

        // The user attributes are stored in the ID token.
        // The 'custom:role' and other custom attributes are also available here.
        // We can map these to a more usable format if needed.
        const attributes = {
            'sub': decodedToken.sub,
            'email': decodedToken.email,
            'name': decodedToken.name,
            'phone_number': decodedToken.phone_number,
            'address': decodedToken.address,
            'custom:postcode': decodedToken['custom:postcode'],
            'custom:iconURL': decodedToken['custom:iconURL'],
            'custom:role': decodedToken['custom:role'],
        };
        console.log("User attributes successfully retrieved from ID token.");
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
export const getIdToken = async () => {
    return await AsyncStorage.getItem('idToken');
};

/**
 * Retrieves the stored Access Token.
 * @returns {Promise<string | null>} The Access Token string, or null if not found.
 */
export const getAccessToken = async () => {
    return await AsyncStorage.getItem('accessToken');
};

/**
 * Logs the user out by clearing the stored tokens.
 * @returns {Promise<void>}
 */
export const signOut = async () => {
    try {
        await AsyncStorage.removeItem('idToken');
        await AsyncStorage.removeItem('accessToken');
        console.log("User logged out successfully.");
    } catch (e) {
        console.error("Error signing out:", e);
    }
};