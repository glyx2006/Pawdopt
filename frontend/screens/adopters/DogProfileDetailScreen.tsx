import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // For the Apply button

import { RootStackParamList } from '../../App'; // Import RootStackParamList
import { handleAlert } from '../utils/AlertUtils';

// Define the type for the route parameters for this screen
type DogProfileDetailScreenRouteProp = RouteProp<RootStackParamList, 'DogProfileDetail'>;
// Define the type for the navigation prop for this screen
type DogProfileDetailScreenNavigationProp = NavigationProp<RootStackParamList, 'DogProfileDetail'>;

// Re-defining Dog interface for clarity, ensure it matches mockDogs in DogSwipeScreen
interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  description: string;
  photoUrl: string;
}

// Mock Data for Dogs (should ideally be fetched from a central place or backend)
// This is a copy from DogSwipeScreen for standalone testing.
const mockDogs: Dog[] = [
  {
    id: 'dog1',
    name: 'Cooper',
    breed: 'Samoyed',
    age: 2,
    gender: 'Male',
    description: 'Cooper is a fluffy, friendly, and playful Samoyed looking for a loving home. He loves belly rubs, long walks in the park, and playing fetch. Cooper is great with kids and other dogs, making him a perfect family companion. He is fully vaccinated and house-trained. Come meet Cooper and let him steal your heart!',
    photoUrl: 'https://placehold.co/600x400/FFD194/FFF?text=Cooper',
  },
  {
    id: 'dog2',
    name: 'Luna',
    breed: 'Labradoodle',
    age: 1,
    gender: 'Female',
    description: 'Luna is an energetic and intelligent Labradoodle. She loves to learn new tricks and enjoys active playtime. Luna is very affectionate and thrives on human companionship. She is looking for a home where she can get plenty of exercise and mental stimulation. Luna is spayed and up-to-date on all her vaccinations.',
    photoUrl: 'https://placehold.co/600x400/FFACAC/FFF?text=Luna',
  },
  {
    id: 'dog3',
    name: 'Max',
    breed: 'German Shepherd',
    age: 3,
    gender: 'Male',
    description: 'Max is a loyal and intelligent German Shepherd. He is well-trained and has a protective but gentle nature. Max enjoys outdoor adventures and would thrive in a home with a large yard or access to open spaces. He is looking for an experienced owner who can continue his training and provide him with plenty of love and attention.',
    photoUrl: 'https://placehold.co/600x400/94D1FF/FFF?text=Max',
  },
  {
    id: 'dog4',
    name: 'Daisy',
    breed: 'Beagle',
    age: 4,
    gender: 'Female',
    description: 'Daisy is a sweet and curious Beagle with an excellent nose! She loves to explore new scents and enjoys long walks. Daisy is very affectionate and loves to cuddle up on the couch. She would do well in a home where she is the center of attention or with another calm dog. Daisy is spayed and ready for her new adventure.',
    photoUrl: 'https://placehold.co/600x400/94FFD1/FFF?text=Daisy',
  },
];


const DogProfileDetailScreen: React.FC<{
  navigation: DogProfileDetailScreenNavigationProp;
  route: DogProfileDetailScreenRouteProp;
}> = ({ navigation, route }) => {
  const { dogId } = route.params; // Get the dogId passed from the previous screen
  const [dog, setDog] = useState<Dog | null>(null);

  useEffect(() => {
    // In a real app, you'd fetch dog details from your backend using dogId
    // For now, find the dog from mock data
    const foundDog = mockDogs.find(d => d.id === dogId);
    if (foundDog) {
      setDog(foundDog);
    } else {
      handleAlert('Error', 'Dog not found!');
      navigation.goBack(); // Go back if dog not found
    }
  }, [dogId]); // Re-run effect if dogId changes

  const handleApplyForAdoption = () => {
    if (dog) {
      Alert.alert(
        'Apply for Adoption', 
        `Submit an adoption application for ${dog.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Apply',
            onPress: () => {
              // TODO: Implement actual adoption application logic (API call to backend)
              // This would create an adoption request entry
              Alert.alert(
                'Application Sent!', 
                `Your adoption application for ${dog.name} has been sent to the shelter. You can check its status in your requests.`,
                [
                  { 
                    text: 'View My Requests', 
                    onPress: () => navigation.navigate('AdoptionRequests')
                  },
                  { text: 'OK' }
                ]
              );
            }
          }
        ]
      );
    }
  };

  if (!dog) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dog profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{'<'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Image source={{ uri: dog.photoUrl }} style={styles.dogImage} />

        <View style={styles.infoContainer}>
          <View style={styles.nameAgeGender}>
            <Text style={styles.dogName}>{dog.name}</Text>
            <Text style={styles.dogAge}>, {dog.age}</Text>
            <Text style={styles.dogGender}> ({dog.gender})</Text>
          </View>
          <Text style={styles.dogBreed}>{dog.breed}</Text>

          <Text style={styles.sectionTitle}>About {dog.name}</Text>
          <Text style={styles.dogDescription}>{dog.description}</Text>

          {/* Apply for Adoption Button */}
          <TouchableOpacity onPress={handleApplyForAdoption} style={styles.applyButtonWrapper}>
            <LinearGradient
              colors={['#FFD194', '#FFACAC']}
              style={styles.applyButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.applyButtonText}>Apply for Adoption</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjust for status bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  backButton: {
    position: 'absolute', // Position absolutely to overlay content
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10, // Ensure it's above other content
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FF7B7B',
    fontWeight: 'bold',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40, // Space for the bottom of the scroll view
  },
  dogImage: {
    width: '100%',
    height: 350, // Fixed height for the image
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
  },
  nameAgeGender: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  dogName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  dogAge: {
    fontSize: 24,
    color: '#666',
    marginLeft: 5,
  },
  dogGender: {
    fontSize: 20,
    color: '#888',
    marginLeft: 5,
  },
  dogBreed: {
    fontSize: 20,
    color: '#888',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  dogDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  applyButtonWrapper: {
    width: '100%',
    marginTop: 30,
    borderRadius: 50,
    overflow: 'hidden',
    alignSelf: 'center', // Center the button
  },
  applyButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default DogProfileDetailScreen;