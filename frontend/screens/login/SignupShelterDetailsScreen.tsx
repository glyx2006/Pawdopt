import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import {
  userPool,
  CognitoUserAttribute,
} from '../../services/CognitoService';

// Define the type for the route parameters for this screen
type SignupShelterDetailsScreenRouteProp = RouteProp<RootStackParamList, 'SignupShelterDetails'>;

const SignupShelterDetailsScreen: React.FC = () => {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
  const route = useRoute<SignupShelterDetailsScreenRouteProp>();
  const { email, password } = route.params; // Get email and password from previous screen

  // State for form fields
  const [shelterName, setShelterName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [postcode, setPostcode] = useState<string>('');
  const [phoneNo, setPhoneNo] = useState<string>('');

  const [nameError, setNameError] = useState<string>('');
  const [addressError, setAddressError] = useState<string>('');
  const [postcodeError, setPostcodeError] = useState<string>('');
  const [phoneNoError, setPhoneNoError] = useState<string>('');
  
  const formatPhoneNo = (text: string) => {
    // If the input starts with anything other than '+', prepend it.
    // This handles accidental deletion of '+' or initial paste without it.
    if (!text.startsWith('+')) {
      setPhoneNo('+' + text.replace(/\D/g, '')); // Ensure only digits follow the '+'
    } else {
      // Remove any non-digits after the '+'
      const cleaned = '+' + text.substring(1).replace(/\D/g, '');
      setPhoneNo(cleaned);
    }
  };

  const validateName = (nameString: string): boolean => {
    setNameError('');
    if (nameString.trim().length < 2) {
      setNameError('Name must be at least 2 characters.');
      return false;
    }
    //Optional: Add regex for only alphabetic characters if desired
    if (!/^[a-zA-Z\s]+$/.test(nameString)) {
      setNameError('Name can only contain letters and spaces.');
      return false;
    }
    return true;
  };
  const validateAddress = (addressString: string): boolean => {
    setAddressError('');
    if (addressString.trim().length < 5) {
      setAddressError('Address must be at least 5 characters.');
      return false;
    }
    return true;
  };

  const validatePostcode = (postcodeString: string): boolean => {
    setPostcodeError('');
    // Basic UK postcode regex, adjust as needed for other regions
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    if (!ukPostcodeRegex.test(postcodeString.trim())) {
      setPostcodeError('Please enter a valid postcode format (e.g., SW1A 0AA).');
      return false;
    }
    return true;
  };

  const validatePhoneNo = (phoneNoString: string): boolean => {
    setPhoneNoError('');
    // Basic phone number regex, allows digits, spaces, hyphens, and plus sign for international
    const phoneRegex = /^\+?[0-9\s-]{7,20}$/; // Example: 7 to 20 digits/symbols
    if (!phoneRegex.test(phoneNoString.trim())) {
      setPhoneNoError('Please enter a valid phone number (7-20 digits, may include +,-,spaces).');
      return false;
    }
    return true;
  };

  const handleNameChange = (text: string) => {
    setShelterName(text);
    validateName(text); // Validate as user types
  };

  const handleAddressChange = (text: string) => {
    setAddress(text);
    validateAddress(text); // Validate as user types
  };

  const handlePostcodeChange = (text: string) => {
    setPostcode(text);
    validatePostcode(text); // Validate as user types
  };

  const handlePhoneNoChange = (text: string) => {
    formatPhoneNo(text);
    validatePhoneNo(text); // Validate as user types
  };

  const handleNext = () => {
    const isNameValid = validateName(shelterName);
    const isAddressValid = validateAddress(address);
    const isPostcodeValid = validatePostcode(postcode);
    const isPhoneNoValid = validatePhoneNo(phoneNo);
    
    // Basic client-side validation
    if (!shelterName.trim || !address.trim || !postcode.trim || !phoneNo.trim) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    // Add more specific validation (e.g., phone number regex)
    if (!isNameValid || !isAddressValid || !isPostcodeValid || !isPhoneNoValid) {
      Alert.alert('Validation Error', 'Please correct the highlighted fields before proceeding.');
      return;
    }
    // Prepare Cognito attributes
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: shelterName }),
      new CognitoUserAttribute({ Name: 'address', Value: address }),
      new CognitoUserAttribute({ Name: 'phone_number', Value: phoneNo }),
      new CognitoUserAttribute({ Name: 'custom:postcode', Value: postcode }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: 'shelter' }),
    ];

    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        Alert.alert('Sign Up Error', err.message || JSON.stringify(err));
        return;
      }
      Alert.alert(
        "Shelter Account Created!", 
        "Please verify your email and login."
      );      
      navigation.navigate('Login'); 
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

        <Text style={styles.title}>Create Account</Text>

        {/* Shelter Name Input */}
        <Text style={styles.inputLabel}>Shelter Name</Text>
        <TextInput
          style={[styles.input, nameError ? styles.inputError : null]}
          placeholder="Enter Shelter Name"
          placeholderTextColor="#999"
          value={shelterName}
          onChangeText={handleNameChange}
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null} {/* <-- Used here to display the message */}
        

        {/* Address Input */}
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={[styles.input, addressError ? styles.inputError : null]}
          placeholder="Enter Your Location"
          placeholderTextColor="#999"
          value={address}
          onChangeText={handleAddressChange}
        />
        {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}

        {/* Postcode Input */}
        <Text style={styles.inputLabel}>Postcode</Text>
        <TextInput
          style={[styles.input, postcodeError ? styles.inputError : null]}
          placeholder="Enter Your Postcode"
          placeholderTextColor="#999"
          value={postcode}
          onChangeText={handlePostcodeChange}
        />
        {postcodeError ? <Text style={styles.errorText}>{postcodeError}</Text> : null}

        {/* Phone No. Input */}
        <Text style={styles.inputLabel}>Phone No.</Text>
        <TextInput
          style={[styles.input, phoneNoError ? styles.inputError : null]}
          placeholder="+44-"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phoneNo}
          onChangeText={handlePhoneNoChange}
        />
        {phoneNoError ? <Text style={styles.errorText}>{phoneNoError}</Text> : null}


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

export default SignupShelterDetailsScreen;
