import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity, // Still useful for header buttons
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; // Import RootStackParamList
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import gesture-handler and reanimated components/hooks
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS, // To run JS functions from Reanimated worklets
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view'; // <-- Import MaskedView
import AdopterProfileScreen from './AdopterProfileScreen';
import { handleAlert } from '../utils/AlertUtils';

const { width } = Dimensions.get('window'); // Get screen width for responsive sizing

// Define the type for the navigation prop for this screen
type DogSwipeScreenNavigationProp = NavigationProp<RootStackParamList, 'AdopterDashboard'>; // <-- Use the correct screen name

// Define a simple interface for a Dog object
interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  description: string;
  photoURLs: string[]; // URL to the dog's image
}

async function fetchDogs(): Promise<Dog[]> {
  try {
    // Debug: Check all stored tokens
    const idToken = await AsyncStorage.getItem("idToken");
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    
    console.log('=== TOKEN DEBUG ===');
    console.log('ID Token:', idToken ? `${idToken.substring(0, 20)}...` : 'null');
    console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'null');
    console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null');
    
    // Helper function to decode base64url (JWT uses base64url encoding, not regular base64)
    const base64UrlDecode = (str: string) => {
      // Convert base64url to base64
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      while (str.length % 4) {
        str += '=';
      }
      
      // For React Native, we need to handle base64 decoding differently
      try {
        // Try browser atob first
        if (typeof atob !== 'undefined') {
          return atob(str);
        }
        // Fallback for React Native - simple manual base64 decode
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        let i = 0;
        
        while (i < str.length) {
          const a = chars.indexOf(str.charAt(i++));
          const b = chars.indexOf(str.charAt(i++));
          const c = chars.indexOf(str.charAt(i++));
          const d = chars.indexOf(str.charAt(i++));
          
          const bitmap = (a << 18) | (b << 12) | (c << 6) | d;
          
          result += String.fromCharCode((bitmap >> 16) & 255);
          if (c !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
          if (d !== 64) result += String.fromCharCode(bitmap & 255);
        }
        
        return result;
      } catch (e) {
        console.log('Base64 decode error:', e);
        return null;
      }
    };

    // Let's decode the JWT to see what's inside
    if (idToken) {
      console.log('🔍 Attempting to decode ID Token...');
      try {
        const tokenParts = idToken.split('.');
        console.log('ID Token parts:', tokenParts.length);
        
        if (tokenParts.length !== 3) {
          console.log('❌ Invalid ID Token format - should have 3 parts separated by dots');
        } else {
          const payloadB64 = tokenParts[1];
          console.log('ID Token payload (base64):', payloadB64.substring(0, 50) + '...');
          
          const decodedPayload = base64UrlDecode(payloadB64);
          if (decodedPayload) {
            const payload = JSON.parse(decodedPayload);
            console.log('🔍 ID Token payload decoded successfully:');
            console.log('  - Full payload:', JSON.stringify(payload, null, 2));
            console.log('  - sub:', payload.sub);
            console.log('  - aud:', payload.aud);
            console.log('  - iss:', payload.iss);
            console.log('  - token_use:', payload.token_use);
            console.log('  - exp:', payload.exp);
            console.log('  - iat:', payload.iat);
            
            // Check if audience matches API Gateway expectation
            if (payload.aud === '6gif7noadq6h4pcrg4aesumjqm') {
              console.log('✅ ID Token audience MATCHES API Gateway!');
            } else {
              console.log('❌ ID Token audience MISMATCH!');
              console.log('   Expected: 6gif7noadq6h4pcrg4aesumjqm');
              console.log('   Actual:', payload.aud);
            }
          } else {
            console.log('❌ Failed to decode ID token payload');
          }
        }
      } catch (e) {
        console.log('❌ Failed to decode ID token:', e);
      }
    }
    
    if (accessToken) {
      console.log('🔍 Attempting to decode Access Token...');
      try {
        const tokenParts = accessToken.split('.');
        console.log('Access Token parts:', tokenParts.length);
        
        if (tokenParts.length !== 3) {
          console.log('❌ Invalid Access Token format - should have 3 parts separated by dots');
        } else {
          const payloadB64 = tokenParts[1];
          console.log('Access Token payload (base64):', payloadB64.substring(0, 50) + '...');
          
          const decodedPayload = base64UrlDecode(payloadB64);
          if (decodedPayload) {
            const payload = JSON.parse(decodedPayload);
            console.log('🔍 Access Token payload decoded successfully:');
            console.log('  - Full payload:', JSON.stringify(payload, null, 2));
            console.log('  - sub:', payload.sub);
            console.log('  - aud:', payload.aud);
            console.log('  - iss:', payload.iss);
            console.log('  - token_use:', payload.token_use);
            console.log('  - client_id:', payload.client_id);
            console.log('  - exp:', payload.exp);
            console.log('  - iat:', payload.iat);
            
            // Check if client_id matches API Gateway expectation
            if (payload.client_id === '6gif7noadq6h4pcrg4aesumjqm') {
              console.log('✅ Access Token client_id MATCHES API Gateway!');
            } else {
              console.log('❌ Access Token client_id MISMATCH!');
              console.log('   Expected: 6gif7noadq6h4pcrg4aesumjqm');
              console.log('   Actual:', payload.client_id);
            }
          } else {
            console.log('❌ Failed to decode access token payload');
          }
        }
      } catch (e) {
        console.log('❌ Failed to decode access token:', e);
      }
    }
    
    console.log('=================');
    
    if (!idToken && !accessToken) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Try different token formats in order of preference
    // Based on our analysis: ID Token has correct audience, Access Token has aud=undefined
    // So prioritize ID Token since it matches API Gateway expectation (aud: 6gif7noadq6h4pcrg4aesumjqm)
    const tokenAttempts = [
      { name: 'Bearer ID Token', token: idToken, format: (t: string) => `Bearer ${t}` },
      { name: 'Direct ID Token', token: idToken, format: (t: string) => t },
      { name: 'Bearer Access Token', token: accessToken, format: (t: string) => `Bearer ${t}` },
      { name: 'Direct Access Token', token: accessToken, format: (t: string) => t },
    ].filter(attempt => attempt.token); // Only include attempts where token exists

    for (const attempt of tokenAttempts) {
      try {
        console.log(`\n🔄 Trying ${attempt.name}...`);
        console.log(`Token preview: ${attempt.token!.substring(0, 30)}...`);
        
        const res = await axios.get("https://52p1yd0ot6.execute-api.eu-west-2.amazonaws.com/default/NearestDogs", {
          headers: {
            Authorization: attempt.format(attempt.token!),
            'Content-Type': 'application/json',
          },
        });

        console.log(`✅ SUCCESS with ${attempt.name}!`);
        console.log('Response status:', res.status);
        console.log('Response data:', res.data);
        console.log('Dogs array:', res.data.dogs);
        console.log('Dogs array length:', res.data.dogs ? res.data.dogs.length : 'undefined');
        
        // Assuming your API returns an array of dogs or an object with a dogs array
        const dogsArray = res.data.dogs || res.data || [];
        console.log('Final dogs array to return:', dogsArray);
        console.log('Final dogs array length:', dogsArray.length);
        
        return dogsArray;
        
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(`❌ Failed with ${attempt.name}`);
          console.log('   Status:', error.response?.status);
          console.log('   Message:', error.response?.statusText);
          console.log('   Data:', JSON.stringify(error.response?.data, null, 2));
          console.log('   Headers:', JSON.stringify(error.response?.headers, null, 2));
        } else {
          console.log(`❌ Failed with ${attempt.name}:`, error);
        }
        
        // If this is not a 401 error, or if this is the last attempt, throw the error
        if (!axios.isAxiosError(error) || error.response?.status !== 401 || attempt === tokenAttempts[tokenAttempts.length - 1]) {
          if (attempt === tokenAttempts[tokenAttempts.length - 1]) {
            console.error('\n🚨 All token attempts failed');
            throw new Error('Authentication failed with all token formats. Please log in again.');
          } else if (axios.isAxiosError(error) && error.response?.status !== 401) {
            throw error; // Re-throw non-401 errors immediately
          }
        }
        // Continue to next attempt for 401 errors
        console.log('   Continuing to next token format...\n');
      }
    }
    
    // This should never be reached, but TypeScript needs a return statement
    throw new Error('Unexpected error: no token attempts were made');
    
  } catch (error) {
    console.error('Error fetching dogs:', error);
    throw error;
  }
}


// Mock Data for Dogs (replace with actual API calls later)
const mockDogs: Dog[] = [
  {
    id: 'dog1',
    name: 'Cooper',
    breed: 'Samoyed',
    age: 2,
    gender: 'Male',
    description: 'A fluffy, friendly, and playful Samoyed looking for a loving home. Loves belly rubs and long walks!',
    photoURLs: ['https://placehold.co/600x400/FFD194/FFF?text=Cooper'], // Placeholder image
  },
  {
    id: 'dog2',
    name: 'Luna',
    breed: 'Labradoodle',
    age: 1,
    gender: 'Female',
    description: 'Energetic and loves playing fetch. Great with kids and other pets.',
    photoURLs: ['https://placehold.co/600x400/FFACAC/FFF?text=Luna'], // Placeholder image
  },
  {
    id: 'dog3',
    name: 'Max',
    breed: 'German Shepherd',
    age: 3,
    gender: 'Male',
    description: 'Loyal and intelligent, Max is looking for an active family.',
    photoURLs: ['https://placehold.co/600x400/94D1FF/FFF?text=Max'],
  },
  {
    id: 'dog4',
    name: 'Daisy',
    breed: 'Beagle',
    age: 4,
    gender: 'Female',
    description: 'Sweet and curious, Daisy loves to explore and cuddle.',
    photoURLs: ['https://placehold.co/600x400/94FFD1/FFF?text=Daisy'],
  },
];

// Threshold for a successful swipe (e.g., move 1/4 of screen width)
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DURATION = 250; // milliseconds

const DogSwipeScreen: React.FC = () => {
  const navigation = useNavigation<DogSwipeScreenNavigationProp>();
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [currentDog, setCurrentDog] = useState<Dog | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]); // State to store fetched dogs
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Reanimated shared values for card position
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Fetch dogs when component mounts
  useEffect(() => {
    const loadDogs = async () => {
      try {
        console.log('🐕 Starting to load dogs...');
        setIsLoading(true);
        const fetchedDogs = await fetchDogs();
        console.log('🐕 Fetched dogs result:', fetchedDogs);
        console.log('🐕 Fetched dogs length:', fetchedDogs ? fetchedDogs.length : 'null/undefined');
        
        const finalDogs = fetchedDogs || mockDogs;
        console.log('🐕 Final dogs to set:', finalDogs);
        console.log('🐕 Final dogs length:', finalDogs.length);
        
        setDogs(finalDogs); // Fallback to mock data if API fails
      } catch (error) {
        console.error('❌ Failed to fetch dogs:', error);
        console.log('🐕 Using mock data due to error. Mock dogs length:', mockDogs.length);
        setDogs(mockDogs); // Use mock data as fallback
        handleAlert('Error', 'Failed to load dogs. Using sample data.');
      } finally {
        setIsLoading(false);
        console.log('🐕 Loading completed');
      }
    };

    loadDogs();
  }, []);

  // Load the first dog when the component mounts or index changes
  useEffect(() => {
    console.log('🔄 Dogs effect triggered:');
    console.log('   - dogs.length:', dogs.length);
    console.log('   - currentDogIndex:', currentDogIndex);
    console.log('   - isLoading:', isLoading);
    
    if (dogs.length > currentDogIndex) {
      const dogToShow = dogs[currentDogIndex];
      console.log('✅ Setting current dog:', dogToShow);
      setCurrentDog(dogToShow);
      // Reset animated values for the new card
      translateX.value = 0;
      translateY.value = 0;
    } else if (!isLoading) {
      console.log('❌ No more dogs available');
      setCurrentDog(null); // No more dogs available
      handleAlert('No More Dogs', 'You\'ve seen all available dogs for now!');
    }
  }, [currentDogIndex, dogs, isLoading]);

  // Function to handle swipe completion (runs on JS thread)
  const onSwipeCompleteJS = async (direction: 'left' | 'right') => {
    if (!currentDog) return;

    console.log(`Swiped ${direction} on ${currentDog.name}`);
    // TODO: Send swipe data to backend (Swipes table)
    // You'd typically make an API call here: POST /api/swipes { adopterId, dogId, direction }

    const nextIndex = currentDogIndex + 1;
    setCurrentDogIndex(nextIndex);

    // If we're running low on dogs (e.g., only 2 left), fetch more
    if (dogs.length - nextIndex <= 2 && !isLoading) {
      try {
        setIsLoading(true);
        const moreDogs = await fetchDogs();
        if (moreDogs && moreDogs.length > 0) {
          setDogs(prevDogs => [...prevDogs, ...moreDogs]);
        }
      } catch (error) {
        console.error('Failed to fetch more dogs:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Navigate to DogProfileDetailScreen (runs on JS thread)
  const goToDogDetailsJS = () => {
    if (currentDog) {
      navigation.navigate('DogProfileDetail', { dogId: currentDog.id });
    }
  };

  // Define the Pan gesture for swiping
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swiped right (like)
        translateX.value = withTiming(width * 1.5, { duration: SWIPE_OUT_DURATION }, () => {
          runOnJS(onSwipeCompleteJS)('right');
        });
        translateY.value = withTiming(event.translationY, { duration: SWIPE_OUT_DURATION });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swiped left (dislike)
        translateX.value = withTiming(-width * 1.5, { duration: SWIPE_OUT_DURATION }, () => {
          runOnJS(onSwipeCompleteJS)('left');
        });
        translateY.value = withTiming(event.translationY, { duration: SWIPE_OUT_DURATION });
      } else {
        // Not a full swipe, snap back to origin
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // Define the Tap gesture for viewing details
  const tapGesture = Gesture.Tap()
    .onEnd((event, success) => {
      // Only trigger if the tap gesture was successful (i.e., not overridden by pan)
      if (success) {
        runOnJS(goToDogDetailsJS)();
      }
    });

  // Combine Pan and Tap gestures using Gesture.Exclusive
  // Exclusive means only one of them will be recognized.
  // If Pan starts, Tap is cancelled. If Pan doesn't start, Tap can be recognized.
  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);


  // Define animated style for the card
  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = translateX.value / width * 20; // Adjust rotation sensitivity
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  // Calculate opacity for "LIKE" and "NOPE" labels based on translateX
  const likeLabelStyle = useAnimatedStyle(() => {
    const opacity = translateX.value / SWIPE_THRESHOLD;
    return {
      opacity: opacity,
      transform: [{ rotate: '-20deg' }],
    };
  });

  const nopeLabelStyle = useAnimatedStyle(() => {
    const opacity = -translateX.value / SWIPE_THRESHOLD;
    return {
      opacity: opacity,
      transform: [{ rotate: '20deg' }],
    };
  });

  // Navigate to user profile (placeholder for now)
  const goToProfile = () => {
    navigation.navigate('AdopterProfile'); // You'll create this screen later
  };

  // Navigate to chat list (placeholder for now)
  const goToChat = () => {
    navigation.navigate('ChatListScreen', {role: "adopter", userId: "hi"}); // You'll create this screen later
  };

  // Navigate to home (placeholder for now)
  const goToHome = () => {
    navigation.navigate('AdopterDashboard'); // Assuming this is your main home
  };

  return (
    <View style={styles.container}>
      <AppHeader></AppHeader>

      {/* Dog Card Area */}
      <View style={styles.cardContainer}>
        {/*
          Moved GestureDetector outside the conditional rendering.
          It now always wraps a single Animated.View.
          The content inside Animated.View is conditionally rendered.
        */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            // Key is still important here if you want the card to reset its animation
            // when a new dog appears, but it's on the Animated.View, not GestureDetector.
            key={currentDog ? currentDog.id : 'no-dog'}
            style={[styles.dogCard, animatedCardStyle]}
          >
            {currentDog ? (
              <>
                {/* "LIKE" and "NOPE" labels */}
                <Animated.Text style={[styles.likeLabel, likeLabelStyle]}>LIKE</Animated.Text>
                <Animated.Text style={[styles.nopeLabel, nopeLabelStyle]}>NOPE</Animated.Text>

                <Image source={{ uri: currentDog.photoURLs[0] }} style={styles.dogImage} />
                <View style={styles.dogInfo}>
                    <View style={styles.dogNameAge}>
                        <Text style={styles.dogName}>{currentDog.name}</Text>
                        <Text style={styles.dogAge}>, {currentDog.age}</Text>
                    </View>
                    <Text style={styles.dogBreed}>{currentDog.breed}</Text>
                </View>
              </>
            ) : isLoading ? (
              <View style={styles.noDogsContent}>
                <Text style={styles.noDogsText}>Loading dogs near you...</Text>
              </View>
            ) : (
              <View style={styles.noDogsContent}>
                <Text style={styles.noDogsText}>No dogs available right now. Check back later!</Text>
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      </View>
      {/* Footer */}
      <AppFooter
        onPressHome={goToHome}
        onPressChat={goToChat}
        onPressProfile={goToProfile}
        activeScreen="home"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    marginTop: 30,
    backgroundColor: '#fff',
  },
  logoTitleContainer: {
    flexDirection: 'row', // Arrange logo and text horizontally
    alignItems: 'center', // Align them vertically in the middle
    flex: 1, // Allow this container to take up available space
    justifyContent: 'center', // Center the logo and text within this container
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
   headerTitleMaskedView: {
    width: 150,
    height: 40, // Adjust height to fit the text size
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGradientBackground: {
    flex: 1,
    width: '100%', // Ensure gradient covers the mask area
  },
  headerIcon: {
    padding: 15,
  },
  iconText: {
    fontSize: 30,
  },
  logo: {
    width: 40, // Adjust size as needed
    height: 40, // Adjust size as needed
    resizeMode: 'contain',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    marginBottom: 50,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dogCard: {
    width: width * 1,
    height: width * 1.4,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    position: 'absolute', // Important for stacking cards if you add more
  },
  noDogsContent: { // New style for the "No dogs available" message inside the card
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Add padding to prevent text from touching edges
  },
  dogImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
  },
  dogInfo: {
    padding: 15,
    height: '25%',
    justifyContent: 'flex-end',
  },
  dogNameAge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  dogName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  dogAge: {
    fontSize: 22,
    color: '#666',
    marginLeft: 5,
  },
  dogBreed: {
    fontSize: 18,
    color: '#888',
    marginBottom: 5,
  },
  noDogsContainer: { // This style is now redundant, but keeping for reference if needed elsewhere
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDogsText: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    left: 40,
    fontSize: 35,
    fontWeight: 'bold',
    color: '#4CAF50',
    zIndex: 1,
    borderWidth: 4,
    borderColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    right: 40,
    fontSize: 35,
    fontWeight: 'bold',
    color: '#F44336',
    zIndex: 1,
    borderWidth: 4,
    borderColor: '#F44336',
    padding: 10,
    borderRadius: 5,
  },
});

export default DogSwipeScreen;
