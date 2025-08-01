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
  photoUrl: string; // URL to the dog's image
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
    photoUrl: 'https://placehold.co/600x400/FFD194/FFF?text=Cooper', // Placeholder image
  },
  {
    id: 'dog2',
    name: 'Luna',
    breed: 'Labradoodle',
    age: 1,
    gender: 'Female',
    description: 'Energetic and loves playing fetch. Great with kids and other pets.',
    photoUrl: 'https://placehold.co/600x400/FFACAC/FFF?text=Luna', // Placeholder image
  },
  {
    id: 'dog3',
    name: 'Max',
    breed: 'German Shepherd',
    age: 3,
    gender: 'Male',
    description: 'Loyal and intelligent, Max is looking for an active family.',
    photoUrl: 'https://placehold.co/600x400/94D1FF/FFF?text=Max',
  },
  {
    id: 'dog4',
    name: 'Daisy',
    breed: 'Beagle',
    age: 4,
    gender: 'Female',
    description: 'Sweet and curious, Daisy loves to explore and cuddle.',
    photoUrl: 'https://placehold.co/600x400/94FFD1/FFF?text=Daisy',
  },
];

// Threshold for a successful swipe (e.g., move 1/4 of screen width)
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DURATION = 250; // milliseconds

const DogSwipeScreen: React.FC = () => {
  const navigation = useNavigation<DogSwipeScreenNavigationProp>();
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [currentDog, setCurrentDog] = useState<Dog | null>(null);

  // Reanimated shared values for card position
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Load the first dog when the component mounts or index changes
  useEffect(() => {
    if (mockDogs.length > currentDogIndex) {
      setCurrentDog(mockDogs[currentDogIndex]);
      // Reset animated values for the new card
      translateX.value = 0;
      translateY.value = 0;
    } else {
      setCurrentDog(null); // No more dogs available
      handleAlert('No More Dogs', 'You\'ve seen all available dogs for now!');
    }
  }, [currentDogIndex]);

  // Function to handle swipe completion (runs on JS thread)
  const onSwipeCompleteJS = (direction: 'left' | 'right') => {
    if (!currentDog) return;

    console.log(`Swiped ${direction} on ${currentDog.name}`);
    // TODO: Send swipe data to backend (Swipes table)
    // You'd typically make an API call here: POST /api/swipes { adopterId, dogId, direction }

    setCurrentDogIndex(prevIndex => prevIndex + 1); // Move to the next dog
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
    navigation.navigate('AdopterProfile', {}); // You'll create this screen later
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

                <Image source={{ uri: currentDog.photoUrl }} style={styles.dogImage} />
                <View style={styles.dogInfo}>
                    <View style={styles.dogNameAge}>
                        <Text style={styles.dogName}>{currentDog.name}</Text>
                        <Text style={styles.dogAge}>, {currentDog.age}</Text>
                    </View>
                    <Text style={styles.dogBreed}>{currentDog.breed}</Text>
                </View>
              </>
            ) : (
              <View style={styles.noDogsContent}> {/* New style for content inside the card */}
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
