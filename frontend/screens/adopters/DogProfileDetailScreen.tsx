import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { RootStackParamList } from '../../App';
import { handleAlert } from '../utils/AlertUtils';
import { dogsApi } from '../../src/api';
import { Dog } from '../../generated';
import { swipe } from './DogSwipeScreen';

// Define types (assuming they are correct)
type DogProfileDetailScreenRouteProp = RouteProp<RootStackParamList, 'DogProfileDetail'>;
type DogProfileDetailScreenNavigationProp = NavigationProp<RootStackParamList, 'DogProfileDetail'>;

const DogProfileDetailScreen: React.FC<{
  navigation: DogProfileDetailScreenNavigationProp;
  route: DogProfileDetailScreenRouteProp;
}> = ({ navigation, route }) => {
  const { dogId, dogCreatedAt, distance, role = 'adopter', adopterId, fromChat = false } = route.params;
  const [dog, setDog] = useState<Dog | null>(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchDog = async () => {
      const request = {
        dogId: dogId,
        dogCreatedAt: dogCreatedAt,
      };

      try {
        const foundDog = await dogsApi.getDog(request);
        if (foundDog) {
          setDog(foundDog);
        } else {
          handleAlert('Error', 'Dog not found!');
          navigation.goBack();
        }
      } catch (e) {
        handleAlert('Error', 'Failed to fetch dog data.');
        navigation.goBack();
      }
    };
    fetchDog();
  }, [dogId, dogCreatedAt]);

  const handleApplyForAdoption = async () => {
    if (dog) {
      const success = await swipe(dogId, dogCreatedAt, 'right', dog.shelterId);
      try {
        if (success) {
          handleAlert(`Request Success`, `Applying for ${dog.name} from ${dog.shelterName}!`);
        }
      } catch (e) {
        handleAlert('Error', `${e}`);
      }
    }
    navigation.navigate('AdopterDashboard');
  };

  const handleAcceptAdopter = async () => {
    if (dog && adopterId) {
      try {
        // TODO: FOR SHELTER TO ACCEPT ADOPTER
        // Here you would call an API to accept the adoption request
        // For now, I'll create a placeholder
        handleAlert('Adoption Accepted', `You have accepted the adoption request for ${dog.name}!`);
        
        // Navigate back to shelter dashboard
        navigation.navigate('ShelterDashboard', {});
      } catch (e) {
        handleAlert('Error', `Failed to accept adoption request: ${e}`);
      }
    } else {
      handleAlert('Error', 'Missing adopter information');
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
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>

        {/* Horizontal Image Gallery */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={true}
          style={styles.imageGallery}
        >
          {dog.photoURLs.map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={[styles.dogImage, { width: screenWidth }]}
            />
          ))}
        </ScrollView>

        {/* Dog Information Section */}
        <View style={styles.infoContainer}>
          <View style={styles.nameAgeGender}>
            <Text style={styles.dogName}>{dog.name}</Text>
            <Text style={styles.dogAge}>, {dog.age}</Text>
            <Text style={styles.dogGender}> ({dog.gender})</Text>
          </View>
          <Text style={styles.dogBreed}>{dog.breed}</Text>
          <View style={{ flexDirection: "column", justifyContent: "space-between", alignItems: "baseline" }}>
            <View>
              <Text style={styles.sectionTitle}>About {dog.name}</Text>
              <Text style={styles.dogDescription}>{dog.description}</Text>
            </View>
            <View style={styles.shelterCard}>
              <Text style={styles.shelterTitle}>🏠 Shelter Information</Text>
              <Text style={styles.shelterDetail}>📍 {dog.shelterName}</Text>
              <Text style={styles.shelterDetail}>🛣️ {dog.shelterAddress} {dog.shelterPostcode}</Text>
              <Text style={styles.shelterDetail}>📏 Distance: {distance} km</Text>
              <Text style={styles.shelterDetail}>📧 {dog.shelterEmail}</Text>
              <Text style={styles.shelterDetail}>📞 {dog.shelterContact}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Apply for Adoption Button at the bottom - only show if not from chat or if shelter */}
      {(!fromChat || role === 'shelter') && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            onPress={role === 'shelter' ? handleAcceptAdopter : handleApplyForAdoption} 
            style={styles.applyButtonWrapper}
          >
            <LinearGradient
              colors={role === 'shelter' ? ['#90EE90', '#32CD32'] : ['#FFD194', '#FFACAC']}
              style={styles.applyButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.applyButtonText}>
                {role === 'shelter' ? 'Accept Adopter to Adopt' : `Request to Chat with ${dog.shelterName}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add padding at the bottom for the main scroll view
  },
  backButton: {
    position: 'absolute',
    top: 20, // Adjusted top for SafeAreaView
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FF7B7B',
    fontWeight: 'bold',
  },
  imageGallery: {
    height: Dimensions.get('window').height * 0.5, // Use a percentage of the screen height
  },
  dogImage: {
    height: '100%',
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
  shelterCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  shelterTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  shelterDetail: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
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
  bottomButtonContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyButtonWrapper: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    alignSelf: 'center',
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