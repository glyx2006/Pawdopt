import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Image, RefreshControl, Platform, Pressable } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Dog } from '../../App'; // Import Dog interface and RootStackParamList
type ShelterDashboardScreenNavigationProp = NavigationProp<RootStackParamList, 'ShelterDashboard'>;
type AddDogScreenNavigationProp = NavigationProp<RootStackParamList, 'AddDog'>;

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

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shelterId, setShelterId] = useState<string>('mock-shelter-id-1'); // Mock shelter ID for now
  const [shelterPostcode, setShelterPostcode] = useState<string>('SW1A 0AA'); // Mock shelter postcode

  // Simulate fetching dogs (replace with actual API call later)
  const fetchDogs = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    // In a real app, you'd fetch dogs specific to 'shelterId' from your backend
    // For now, we'll filter the mock data
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    const filteredMockDogs = initialMockDogs.filter(dog => dog.shelterId === shelterId);
    setDogs(filteredMockDogs);
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
        <Text style={styles.dogDescription}>{item.description.substring(0, 70)}...</Text>
      </View>
      {/* Add Edit/Delete buttons here later */}
    </TouchableOpacity>
  );

    // --- Footer Navigation Functions ---
  const goToHome = () => {
    Alert.alert('Navigate', 'Go to Shelter Dashboard Home (Current Screen)');
    navigation.navigate('ShelterDashboard', {}); // Stay on the current screen
  };

  const goToChat = () => {
    Alert.alert('Navigate', 'Go to Chat List (TODO)');
    // navigation.navigate('ChatListScreen'); // You'll create this screen later
  };

  const goToProfile = () => {
    Alert.alert('Navigate', 'Go to Shelter Profile (TODO)');
    // navigation.navigate('ShelterProfileScreen'); // You'll create this screen later
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#F7B781" style={styles.loading} />;
  }

  return (
    <View style={styles.fullScreenContainer}> {/* New container for full screen */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Dogs</Text>
      </View>

      <View style={styles.contentContainer}> {/* Scrollable content area */}
        <Pressable
          onPress={navigateToAddDog}
          style={({ pressed }) => [
            styles.addDogButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <Text style={styles.addDogButtonText}>+ Add New Dog</Text>
        </Pressable>

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

      {/* Fixed Footer Navigation */}
      <View style={styles.footer}>
        <Pressable onPress={goToChat} style={({ pressed }) => [styles.footerIcon, { opacity: pressed ? 0.7 : 1 }]}>
          <Text style={styles.footerIconEmoji}>💬</Text> {/* Chat Emoji */}
          <Text style={styles.footerIconText}>Chat</Text>
        </Pressable>
        <Pressable onPress={goToHome} style={({ pressed }) => [styles.footerIcon, { opacity: pressed ? 0.7 : 1 }]}>
          <Text style={styles.footerIconEmoji}>🏠</Text> {/* Home Emoji */}
          <Text style={styles.footerIconText}>Home</Text>
        </Pressable>
        <Pressable onPress={goToProfile} style={({ pressed }) => [styles.footerIcon, { opacity: pressed ? 0.7 : 1 }]}>
          <Text style={styles.footerIconEmoji}>👤</Text> {/* Profile Emoji */}
          <Text style={styles.footerIconText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20, // Adjust for status bar/notch
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#F7B781',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1, // Takes up remaining space
    paddingHorizontal: 20, // Apply horizontal padding here
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
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
  dogLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  dogDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  // --- Footer Styles ---
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff', // White background for the footer
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute', // Make it fixed at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Adjust for iPhone X safe area
  },
  footerIcon: {
    alignItems: 'center',
    padding: 5,
  },
   footerIconEmoji: { // New style for the emoji
    fontSize: 28, // Adjust size as needed
    // Emojis typically don't need color property as they are colored by default
  },
  footerIconText: {
    fontSize: 12,
    color: '#F7B781',
    marginTop: 4,
  },
});


export default ShelterDashboardScreen