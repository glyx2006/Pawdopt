// src/screens/AddDogScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Pressable, // Use Pressable instead of TouchableOpacity
  Platform, // Import Platform for KeyboardAvoidingView
  KeyboardAvoidingView // Import KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, Dog } from '../../App';
import { Ionicons } from '@expo/vector-icons'; // Ensure this is installed: expo install @expo/vector-icons

type AddDogRouteProp = RouteProp<RootStackParamList, 'AddDog'>;

const AddDogScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddDogRouteProp>();
  const { onAddDog, shelterId, shelterPostcode } = route.params;

  // State for dog details
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState('Available');
  const [loading, setLoading] = useState(false);

  const handleAddDog = () => {
    // Basic validation
    if (!name || !breed || !age || !gender || !description || !photoUrl) {
      Alert.alert('Missing Info', 'Please fill in all required dog details.');
      return;
    }

    const dogAge = parseInt(age);
    if (isNaN(dogAge) || dogAge <= 0) {
      Alert.alert('Invalid Age', 'Please enter a valid positive number for age.');
      return;
    }

    setLoading(true);

    try {
      const newDog: Dog = {
        id: `mock-dog-${Date.now()}`,
        name,
        breed,
        age: dogAge,
        gender,
        description,
        photoURLs: [photoUrl],
        shelterId: shelterId || 'default-shelter-id',
        status,
        createdAt: new Date().toISOString(),
      };

      // Call the callback function passed from ShelterDashboardScreen
      onAddDog(newDog);

      setLoading(false);
      navigation.goBack(); // Go back to the dashboard
    } catch (error) {
      console.error('Error adding mock dog:', error);
      Alert.alert('Error', 'An unexpected error occurred while adding the dog.');
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack(); // Simply go back without adding anything
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // 'padding' for iOS, 'height' for Android
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust offset if needed
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.innerContainer}> {/* Use innerContainer for content inside scroll view */}
          {/* Back Button */}
          <Pressable onPress={handleGoBack} style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}>
            <Ionicons name="arrow-back" size={24} color="#F7B781" />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          <Text style={styles.title}>Add New Dog</Text>

          <Text style={styles.inputLabel}>Name</Text>
          <TextInput style={styles.textInput} placeholder="e.g., Max" value={name} onChangeText={setName} />

          <Text style={styles.inputLabel}>Breed</Text>
          <TextInput style={styles.textInput} placeholder="e.g., Labrador" value={breed} onChangeText={setBreed} />

          <Text style={styles.inputLabel}>Age (Years)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 2"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <Text style={styles.inputLabel}>Gender</Text>
          <TextInput style={styles.textInput} placeholder="e.g., Male/Female" value={gender} onChangeText={setGender} />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textAreaInput}
            placeholder="Tell us about the dog..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.inputLabel}>Photo URL (Temporary)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., https://example.com/dog.jpg"
            value={photoUrl}
            onChangeText={setPhotoUrl}
          />
          {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.previewImage} /> : null}

          {/* Status (can be a picker later) */}
          <Text style={styles.inputLabel}>Status</Text>
          <TextInput style={styles.textInput} value={status} onChangeText={setStatus} />

          <View style={styles.buttonWrapper}>
            <Pressable onPress={handleAddDog} disabled={loading} style={({ pressed }) => [
              styles.addButtonGradient,
              { opacity: pressed ? 0.8 : 1 }
            ]}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Add Dog</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1, // Ensures content takes up all available space
    paddingBottom: 40, // Add some padding at the bottom for scrollability
  },
  innerContainer: { // New container for content inside ScrollView
    flex: 1, // Allows content to grow
    backgroundColor: '#f0f2f5', // Background color for the whole screen
    paddingHorizontal: 20, // Horizontal padding for content
    paddingTop: 60, // Adjust for header/notch
    alignItems: 'center', // Center content horizontally
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 18,
    color: '#F7B781',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F7B781',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    marginTop: 15,
    alignSelf: 'flex-start', // Align labels to the left within innerContainer
    width: '100%', // Ensure label takes full width for alignment
  },
  textInput: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 10, // Add margin bottom for spacing
  },
  textAreaInput: {
    width: '100%',
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    marginBottom: 10, // Add margin bottom for spacing
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 30,
    borderRadius: 50,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 50,
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AddDogScreen;