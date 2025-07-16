import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

// Define the type for the route parameters for this screen
type SignupShelterDetailsScreenRouteProp = RouteProp<RootStackParamList, 'SignupShelterDetails'>;

const SignupShelterDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SignupShelterDetailsScreenRouteProp>();
  const { email, password } = route.params; // Get email and password from previous screen

  // State for form fields
  const [shelterName, setShelterName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [postcode, setPostcode] = useState<string>('');
  const [phoneNo, setPhoneNo] = useState<string>('');

  const handleNext = () => {
    // Basic client-side validation
    if (!shelterName || !address || !postcode || !phoneNo) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    // Add more specific validation (e.g., phone number regex)

    console.log('Shelter Details:', { email, password, shelterName, address, postcode, phoneNo });

    // TODO: This is the final step for shelter signup.
    // Here you would make the actual API call to your backend to register the shelter.
    Alert.alert('Shelter Signup Complete!', 'Your shelter account has been created.');
    // On successful API call, navigate to the Shelter Dashboard
    navigation.navigate('ShelterDashboard');
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

        <Text style={styles.title}>Create Account</Text>

        {/* Shelter Name Input */}
        <Text style={styles.inputLabel}>Shelter Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Shelter Name"
          placeholderTextColor="#999"
          value={shelterName}
          onChangeText={setShelterName}
        />

        {/* Address Input */}
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Shelter Location"
          placeholderTextColor="#999"
          value={address}
          onChangeText={setAddress}
        />

        {/* Postcode Input */}
        <Text style={styles.inputLabel}>Postcode</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Shelter Postcode"
          placeholderTextColor="#999"
          value={postcode}
          onChangeText={setPostcode}
        />

        {/* Phone No. Input */}
        <Text style={styles.inputLabel}>Phone No.</Text>
        <TextInput
          style={styles.input}
          placeholder="+44-"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phoneNo}
          onChangeText={setPhoneNo}
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
});

export default SignupShelterDetailsScreen;
