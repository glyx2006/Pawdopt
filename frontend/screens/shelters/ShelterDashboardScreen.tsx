import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Image, RefreshControl, Platform } from 'react-native'; // Removed Pressable, added TouchableOpacity
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Dog } from '../../App'; // Import Dog interface and RootStackParamList
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView

type ShelterDashboardScreenNavigationProp = NavigationProp<RootStackParamList, 'ShelterDashboard'>;
type AddDogScreenNavigationProp = NavigationProp<RootStackParamList, 'AddDog'>;

import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';

import { DogsApi } from '../../generated/apis';
import { DogPage, DogSummary } from '../../generated/models';
import { Configuration } from '../../generated';

// Mock data for initial display
const initialMockDogs: Dog[] = [
  {
    id: 'mock-dog-1',
    name: 'Bella',
    breed: 'Labrador',
    age: 2,
    gender: 'Female',
    description: 'A playful and friendly Labrador, loves fetching!',
    photoURLs: ['https://placehold.co/120x120/FFD700/FFFFFF?text=Bella'],
    shelterId: 'mock-shelter-id-1', // This will be replaced by actual shelter ID
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-dog-2',
    name: 'Charlie',
    breed: 'German Shepherd',
    age: 4,
    gender: 'Male',
    description: 'Loyal and intelligent, needs an active family.',
    photoURLs: ['https://placehold.co/120x120/87CEEB/FFFFFF?text=Charlie'],
    shelterId: 'mock-shelter-id-1',
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
];

const ShelterDashboardScreen: React.FC = () => {
  const navigation = useNavigation<ShelterDashboardScreenNavigationProp>();
  const addDogNavigation = useNavigation<AddDogScreenNavigationProp>();

  // const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shelterId, setShelterId] = useState<string>('mock-shelter-id-1'); // Mock shelter ID for now
  const [shelterPostcode, setShelterPostcode] = useState<string>('SW1A 0AA'); // Mock shelter postcode

  // Config api
  const apiConfig = new Configuration({
    basePath: 'https://apirul',
    accessToken: async () => 'token'
  });

  const dogsApi = new DogsApi(apiConfig);

  // Simulate fetching dogs (replace with actual API call later)
  const [dogs, setDogs] = useState<DogSummary[]>([]);
  const fetchDogs = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    // In a real app, you'd fetch dogs specific to 'shelterId' from your backend
    // For now, we'll filter the mock data
    try {
      const response: DogPage = await dogsApi.listDogs({
        limit: 15,
      });
      
      if (response.dogs) {
        setDogs(response.dogs);
      }
    } catch (error) {
      console.error('Failed to fetch dogs:', error);
    }  

    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    // const filteredMockDogs = initialMockDogs.filter(dog => dog.shelterId === shelterId);
    // setDogs(filteredMockDogs);
    setLoading(false);
    setIsRefreshing(false);
  }, [shelterId]);

  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

  // Use useFocusEffect to refresh data when screen comes into focus (e.g., after adding a dog)
  useFocusEffect(
    useCallback(() => {
      fetchDogs();
    }, [fetchDogs])
  );

  const handleAddDog = useCallback((newDog: Dog) => {
    setDogs(prevDogs => [...prevDogs, newDog]);
    Alert.alert('Success', `${newDog.name} added to your list!`);
  }, []);

  const navigateToAddDog = () => {
    // Pass the callback to AddDogScreen
    addDogNavigation.navigate('AddDog', {
      onAddDog: handleAddDog,
      shelterId: shelterId, // Pass current mock shelter ID
      shelterPostcode: shelterPostcode, // Pass current mock shelter postcode
    });
  };

  const renderDogItem = ({ item }: { item: Dog }) => (
    <TouchableOpacity style={styles.dogCard} onPress={() => { /* Navigate to edit dog screen */ }}>
      {item.photoURLs && item.photoURLs.length > 0 && (
        <Image source={{ uri: item.photoURLs[0] }} style={styles.dogImage} />
      )}
      <View style={styles.dogInfo}>
        <Text style={styles.dogName}>{item.name}</Text>
        <Text style={styles.dogBreedAge}>{item.breed}, {item.age} years old</Text>
        <Text style={styles.dogStatus}>Status: {item.status}</Text>
        {/* Check if description exists before trying to substring */}
        {item.description && <Text style={styles.dogDescription}>{item.description.substring(0, 70)}...</Text>}
      </View>
      {/* Add Edit/Delete buttons here later */}
    </TouchableOpacity>
  );

  // --- Footer Navigation Functions ---
  const goToHome = () => {
    // Removed alert for smoother navigation
    navigation.navigate({ name: 'ShelterDashboard', params: {} }); // Stay on the current screen
  };

  const goToChat = () => {
    navigation.navigate('ChatListScreen', {role: "shelter", userId: ""}); // You'll create this screen later
  };

  const goToProfile = () => {
    navigation.navigate('ShelterProfile'); // You'll create this screen later
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}> {/* New container for loading spinner */}
        <ActivityIndicator size="large" color="#F7B781" />
      </View>
    );
  }

  return (
    // Wrap the entire screen content in SafeAreaView
    <SafeAreaView style={styles.safeArea}>
      <AppHeader /> {/* AppHeader will now automatically avoid the safe area */}

      <View style={styles.contentContainer}> {/* Scrollable content area */}
        <TouchableOpacity // Changed from Pressable to TouchableOpacity
          onPress={navigateToAddDog}
          style={styles.addDogButton} // Simplified style application
          activeOpacity={0.8} // Added activeOpacity for feedback
        >
          <Text style={styles.addDogButtonText}>+ Add New Dog</Text>
        </TouchableOpacity>

        {dogs.length === 0 ? (
          <Text style={styles.noDogsText}>You haven't added any dogs yet. Tap 'Add New Dog' to get started!</Text>
        ) : (
          <FlatList
            data={dogs}
            keyExtractor={(item) => item.id}
            renderItem={renderDogItem}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={fetchDogs} />
            }
            contentContainerStyle={styles.flatListContent} // Add padding for FlatList
          />
        )}
      </View>

      {/* AppFooter is positioned absolutely, so it will sit at the very bottom of SafeAreaView */}
      <AppFooter
        onPressProfile={goToProfile}
        onPressHome={goToHome}
        onPressChat={goToChat}
        activeScreen="home" // Highlight the home icon for Shelter Dashboard
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Background color for the whole screen
  },
  loadingContainer: { // Style for loading state
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  contentContainer: {
    flex: 1, // Takes up remaining space between header and footer
    paddingHorizontal: 20, // Apply horizontal padding here for the main content
  },
  flatListContent: {
    paddingBottom: 20, // Add padding at the bottom of the list for better scrolling above footer
  },
  addDogButton: {
    backgroundColor: '#F7B781',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  addDogButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  noDogsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 18,
    color: '#777',
  },
  dogCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  dogImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    resizeMode: 'cover',
  },
  dogInfo: {
    flex: 1,
    padding: 15,
  },
  dogName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dogBreedAge: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  dogStatus: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  dogDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  // --- Footer Styles (these should ideally be inside AppFooter.tsx now) ---
  // Removed these from here, as AppFooter now manages its own styles and touch feedback.
  // Keeping them here for reference if you haven't fully moved them.
});

export default ShelterDashboardScreen;