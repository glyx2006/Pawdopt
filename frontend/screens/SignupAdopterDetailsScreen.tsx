import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

// Define the type for the route parameters for this screen
type SignupAdopterDetailsScreenRouteProp = RouteProp<RootStackParamList, 'SignupAdopterDetails'>;

const SignupAdopterDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SignupAdopterDetailsScreenRouteProp>();
  const { email, password } = route.params; // Get email and password from previous screen

  // State for form fields
  const [name, setName] = useState<string>('');
  const [dob, setDob] = useState<string>(''); // Format: YYYY/MM/DD
  const [gender, setGender] = useState<string>(''); // Could be a dropdown/picker later
  const [address, setAddress] = useState<string>('');
  const [postcode, setPostcode] = useState<string>('');
  const [phoneNo, setPhoneNo] = useState<string>('');

  const handleNext = () => {
    // Basic client-side validation
    if (!name || !dob || !gender || !address || !postcode || !phoneNo) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    // Add more specific validation (e.g., DOB format, phone number regex)

    console.log('Adopter Details:', { email, password, name, dob, gender, address, postcode, phoneNo });

    // Navigate to the next screen for Adopter: Experience with pets
    navigation.navigate('SignupAdopterExperience', {
      email,
      password,
      name,
      dob,
      gender,
      address,
      postcode,
      phoneNo,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        {/* Back Arrow */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>

        {/* Name Input */}
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        {/* Date of Birth Input */}
        <Text style={styles.inputLabel}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY/MM/DD"
          placeholderTextColor="#999"
          keyboardType="numeric" // Suggest numeric keyboard
          value={dob}
          onChangeText={setDob}
        />

        {/* Gender Input (Placeholder for now, could be Picker/Dropdown) */}
        <Text style={styles.inputLabel}>Gender</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Gender"
          placeholderTextColor="#999"
          value={gender}
          onChangeText={setGender}
        />

        {/* Address Input */}
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Location"
          placeholderTextColor="#999"
          value={address}
          onChangeText={setAddress}
        />

        {/* Postcode Input */}
        <Text style={styles.inputLabel}>Postcode</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Postcode"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={postcode}
          onChangeText={setPostcode}
        />

        {/* Phone No. Input */}
        <Text style={styles.inputLabel}>Phone No.</Text>
        <TextInput
          style={styles.input}
          placeholder="+44-" // Placeholder for international format
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phoneNo}
          onChangeText={setPhoneNo}
        />

        {/* Next Button */}
        <TouchableOpacity onPress={handleNext} style={styles.nextButtonWrapper}>
          <LinearGradient
            colors={['#FFD194', '#FFACAC']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1, // Allows content to grow and scroll
    justifyContent: 'center', // Center content vertically if it doesn't fill screen
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40, // Add some bottom padding for scroll
    alignItems: 'center', // Center content horizontally
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FF7B7B',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    alignSelf: 'flex-start',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: '#555',
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
});

export default SignupAdopterDetailsScreen;
