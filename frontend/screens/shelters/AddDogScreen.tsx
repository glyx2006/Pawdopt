// src/screens/AddDogScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Pressable, // Use Pressable instead of TouchableOpacity
  Platform, // Import Platform for KeyboardAvoidingView
  KeyboardAvoidingView // Import KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, Dog } from '../../App';
import { Dropdown } from 'react-native-element-dropdown';

type AddDogRouteProp = RouteProp<RootStackParamList, 'AddDog'>;

const AddDogScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddDogRouteProp>();
  const { onAddDog, shelterId, shelterPostcode } = route.params;

  // State for dog details
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  // const [description, setDescription] = useState('');
  // const [photoUrl, setPhotoUrl] = useState('');
  // const [status, setStatus] = useState('Available');
  const [loading, setLoading] = useState(false);

  const handleAddDog = () => {
    // Basic validation
    if (!name || !breed || !dob || !gender) {
      Alert.alert('Missing Info', 'Please fill in all required dog details.');
      return;
    }
    if (!/^\d{4}\/\d{2}$/.test(dob)) {
      Alert.alert('Invalid Date of Birth', 'Please enter DOB in YYYY/MM format.');
      return;
    }
    setLoading(true);


  //   try {
  //     const newDog: Dog = {
  //       id: `mock-dog-${Date.now()}`,
  //       name,
  //       breed,
  //       age: dogAge,
  //       gender,
  //       description,
  //       photoURLs: [photoUrl],
  //       shelterId: shelterId || 'default-shelter-id',
  //       status,
  //       createdAt: new Date().toISOString(),
  //     };

  //     // Call the callback function passed from ShelterDashboardScreen
  //     onAddDog(newDog);

  //     setLoading(false);
  //     navigation.goBack(); // Go back to the dashboard
  //   } catch (error) {
  //     console.error('Error adding mock dog:', error);
  //     Alert.alert('Error', 'An unexpected error occurred while adding the dog.');
  //     setLoading(false);
  //   }
   };

  const handleGoBack = () => {
    navigation.goBack(); // Simply go back without adding anything
  };

  const handleNext = () => {
    // Validate required fields before navigating
    if (!name || !breed || !dob || !gender) {
      Alert.alert('Missing Info', 'Please fill in all required dog details.');
      return;
    }
    if (!/^\d{4}\/\d{2}$/.test(dob)) {
      Alert.alert('Invalid Date of Birth', 'Please enter DOB in YYYY/MM format.');
      return;
    }
    navigation.navigate('AddDogPic', {
      onAddDog,
      shelterId,
      shelterPostcode,
      name,
      breed,
      dob,
      gender,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          {/* Back Arrow */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Enter dog details</Text>

          {/* Dog Name Input */}
          <Text style={styles.inputLabel}>Dog Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Dog Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

          {/* Dog DOB Input */}
          <Text style={styles.inputLabel}>Date of Birth (YYYY/MM)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2021/05"
            placeholderTextColor="#999"
            value={dob}
            onChangeText={setDob}
            keyboardType="numeric"
            maxLength={7}
          />

          {/* Dog Breed Input */}
          <Text style={styles.inputLabel}>Breed</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Dog Breed"
            placeholderTextColor="#999"
            value={breed}
            onChangeText={setBreed}
          />

          {/* Dog Gender Dropdown */}
          <Text style={styles.inputLabel}>Gender</Text>
          <Dropdown
            style={styles.input}
            data={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Gender"
            placeholderStyle={{ color: '#999' }}
            value={gender}
            onChange={item => setGender(item.value)}
            selectedTextStyle={{ color: '#333', fontSize: 18 }}
            itemTextStyle={{ color: '#333', fontSize: 18 }}
            containerStyle={{ borderRadius: 8 }}
            activeColor="#F7B781"
            renderLeftIcon={() => null}
          />

          {/* Next Button */}
          <TouchableOpacity onPress={handleNext} style={styles.nextButtonWrapper}>
            <LinearGradient
              colors={['#F48B7B', '#F9E286']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#F7B781',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F7B781',
    marginBottom: 40,
    alignSelf: 'center',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: '#F7B781',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderBottomWidth: 1,
    paddingHorizontal: 0,
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  nextButtonWrapper: {
    width: '100%',
    marginTop: 50,
    borderRadius: 50,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputError: {
    borderColor: '#FF6F61', 
  },
  errorText: {
    color: '#FF6F61',
    fontSize: 14,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
});

export default AddDogScreen;