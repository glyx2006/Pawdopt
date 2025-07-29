import React, { useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { userPool, CognitoUserAttribute } from '../../services/CognitoService'; 


import { RootStackParamList } from '../../App';

type SignupAdopterDetailsScreenRouteProp = RouteProp<RootStackParamList, 'SignupAdopterDetails'>;
type SignupAdopterDetailsScreenNavigationProp = NavigationProp<RootStackParamList, 'SignupAdopterDetails'>;

const SignupAdopterDetailsScreen: React.FC<{
  navigation: SignupAdopterDetailsScreenNavigationProp;
  route: SignupAdopterDetailsScreenRouteProp;
}> = ({ navigation, route }) => {
  const { email = '', password = '' } = route.params || {};

  const [name, setName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [gender, setGender] = useState<string>(''); 
  const [address, setAddress] = useState<string>('');
  const [postcode, setPostcode] = useState<string>('');
  const [phoneNo, setPhoneNo] = useState<string>('');

  const [nameError, setNameError] = useState<string>('');
  const [dobError, setDobError] = useState<string>('');
  const [genderError, setGenderError] = useState<string>('');
  const [addressError, setAddressError] = useState<string>('');
  const [postcodeError, setPostcodeError] = useState<string>('');
  const [phoneNoError, setPhoneNoError] = useState<string>('');

  const formatDob = (text: string) => {
    // Remove all non-digit characters
    let cleanedText = text.replace(/\D/g, '');

    // Apply YYYY/MM/DD format
    let formattedText = '';
    if (cleanedText.length > 0) {
      formattedText = cleanedText.substring(0, 4); // Year
      if (cleanedText.length >= 5) {
        formattedText += '/' + cleanedText.substring(4, 6); // Month
      }
      if (cleanedText.length >= 7) {
        formattedText += '/' + cleanedText.substring(6, 8); // Day
      }
    }
    setDob(formattedText);
  };

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

  const validateDob = (dobString: string): boolean => {
    setDobError(''); // Clear previous error at the start of validation
    const parts = dobString.split('/');

    // Allow empty string to pass validation when not yet complete
    if (dobString.length === 0) {
      return true;
    }

    // Check for correct YYYY/MM/DD format structure
    if (parts.length !== 3 || parts.some(part => part === '')) {
      setDobError('Format: YYYY/MM/DD');
      return false;
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    // Check if parsed parts are valid numbers
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      setDobError('Invalid date components (not numbers).');
      return false;
    }

    // Basic range checks for year, month, day
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) { // Adjust 1900 if your minimum birth year is different
      setDobError('Year must be between 1900 and ' + currentYear + '.');
      return false;
    }
    if (month < 1 || month > 12) {
      setDobError('Month must be between 01 and 12.');
      return false;
    }
    if (day < 1 || day > 31) { // Initial day check, more precise check follows
      setDobError('Day must be between 01 and 31.');
      return false;
    }

    // Comprehensive date validation using Date object to handle month-day limits (e.g., Feb 30th)
    // Month is 0-indexed in Date object (e.g., January is 0, December is 11)
    const date = new Date(year, month - 1, day);
    // If the Date object "corrects" the date (e.g., turns Feb 30 into March 2), it means it was invalid
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
      setDobError('Please enter a valid calendar date (e.g., February 30th is invalid).');
      return false;
    }

    // Check if the date is not in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day for accurate comparison
    if (date > today) {
      setDobError('Date of Birth cannot be in the future.');
      return false;
    }

    return true; // Date is valid
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
    setName(text);
    validateName(text); // Validate as user types
  };

  const handleDobChange = (text: string) => {
    formatDob(text);
    validateDob(text); // Validate as user types
  };

  const handleGenderChange = (text: string) => {
    setGender(text);
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
    const isNameValid = validateName(name);
    const isDobValid = validateDob(dob);
    const isAddressValid = validateAddress(address);
    const isPostcodeValid = validatePostcode(postcode);
    const isPhoneNoValid = validatePhoneNo(phoneNo);

    // Check if any field is empty (required check)
    if (!name.trim() || !dob.trim() || !gender.trim() || !address.trim() || !postcode.trim() || !phoneNo.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    // Check if all individual validations passed
    if (!isNameValid || !isDobValid  || !isAddressValid || !isPostcodeValid || !isPhoneNoValid) {
      Alert.alert('Validation Error', 'Please correct the highlighted fields before proceeding.');
      return;
    }

    // Pass all collected info to experience screen for final sign-up
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
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Back Arrow */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>

          {/* Name Input */}
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            placeholder="Enter Your Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={handleNameChange}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null} {/* <-- Used here to display the message */}


          {/* Date of Birth Input */}
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TextInput
            style={[styles.input, dobError ? styles.inputError : null]}
            placeholder="YYYY/MM/DD"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={dob}
            onChangeText={handleDobChange}
            maxLength={10} 
          />
          {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null} {/* <-- Used here to display the message */}


          {/* Gender Dropdown */}
          <Text style={styles.inputLabel}>Gender</Text>
          <Dropdown
            style={[styles.input, genderError ? styles.inputError : null]}
            data={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Non-binary', value: 'Non-binary' },
              { label: 'Prefer not to say', value: 'Prefer not to say' },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Gender"
            placeholderStyle={{ color: '#999' }}
            value={gender}
            onChange={item => handleGenderChange(item.value)}
            selectedTextStyle={{ color: '#333', fontSize: 18 }}
            itemTextStyle={{ color: '#333', fontSize: 18 }}
            containerStyle={{ borderRadius: 8 }}
            activeColor="#F7B781"
            renderLeftIcon={() => null}
          />
          {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}

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
    paddingBottom: 100,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop: 60,
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
    marginBottom: 100,
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

export default SignupAdopterDetailsScreen;
