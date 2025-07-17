import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App'; // Import RootStackParamList

// Import gesture-handler and reanimated components/hooks
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS, // To run JS functions from Reanimated worklets
} from 'react-native-reanimated';

const { width } = Dimensions.get('window'); // Get screen width for responsive sizing

// Define the type for the navigation prop for this screen
type DogSwipeScreenNavigationProp = NavigationProp<RootStackParamList, 'DogSwipe'>;

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
      Alert.alert('No More Dogs', 'You\'ve seen all available dogs for now!');
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

  // Define the Pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Update shared values as user drags
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swiped right (like)
        translateX.value = withTiming(width * 1.5, { duration: SWIPE_OUT_DURATION }, () => {
          runOnJS(onSwipeCompleteJS)('right'); // Run JS function on completion
        });
        translateY.value = withTiming(event.translationY, { duration: SWIPE_OUT_DURATION }); // Animate Y as well
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swiped left (dislike)
        translateX.value = withTiming(-width * 1.5, { duration: SWIPE_OUT_DURATION }, () => {
          runOnJS(onSwipeCompleteJS)('left'); // Run JS function on completion
        });
        translateY.value = withTiming(event.translationY, { duration: SWIPE_OUT_DURATION }); // Animate Y as well
      } else {
        // Not a full swipe, snap back to origin
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    })
    .onStart(() => {
        // Optional: Could add logic here if needed when gesture starts
    })
    // MODIFICATION START: Refined onTouchesUp logic
    .onTouchesUp((event, success) => {
        // If the pan gesture was NOT successfully recognized (i.e., it was a tap-like action)
        // and it was a single touch, then navigate to dog details.
        // `success` here indicates if the gesture (Pan in this case) was activated.
        if (!success && event.numberOfTouches === 1) {
            runOnJS(goToDogDetails)(); // Trigger the detail view
        }
    });
    // MODIFICATION END

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
      transform: [{ rotate: '-20deg' }], // Keep fixed rotation
    };
  });

  const nopeLabelStyle = useAnimatedStyle(() => {
    const opacity = -translateX.value / SWIPE_THRESHOLD;
    return {
      opacity: opacity,
      transform: [{ rotate: '20deg' }], // Keep fixed rotation
    };
  });

  // Navigate to user profile (placeholder for now)
  const goToProfile = () => {
    Alert.alert('Profile', 'Navigating to User Profile (TODO)');
    // navigation.navigate('UserProfileScreen'); // You'll create this screen later
  };

  // Navigate to chat list (placeholder for now)
  const goToChat = () => {
    Alert.alert('Chat', 'Navigating to Chat List (TODO)');
    // navigation.navigate('ChatListScreen'); // You'll create this screen later
  };

  // Navigate to DogProfileDetailScreen (runs on JS thread)
  const goToDogDetails = () => {
    if (currentDog) {
      // No need to reset position.value directly here as it's handled by gesture.onEnd
      navigation.navigate('DogProfileDetail', { dogId: currentDog.id });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToProfile} style={styles.headerIcon}>
          <Text style={styles.iconText}>👤</Text> {/* Placeholder for profile icon */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pawdopt</Text>
        <TouchableOpacity onPress={goToChat} style={styles.headerIcon}>
          <Text style={styles.iconText}>💬</Text> {/* Placeholder for chat icon */}
        </TouchableOpacity>
      </View>

      {/* Dog Card Area */}
      <View style={styles.cardContainer}>
        {currentDog ? (
          <GestureDetector gesture={panGesture}>
            <Animated.View
              key={currentDog.id} // Important: Forces re-render/re-mount for new dog, resetting animations
              style={[styles.dogCard, animatedCardStyle]}
            >
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
            </Animated.View>
          </GestureDetector>
        ) : (
          <View style={styles.noDogsContainer}>
            <Text style={styles.noDogsText}>No dogs available right now. Check back later!</Text>
          </View>
        )}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7B7B',
  },
  headerIcon: {
    padding: 10,
  },
  iconText: {
    fontSize: 24,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  dogCard: {
    width: width * 0.9,
    height: width * 1.2,
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
  noDogsContainer: {
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
