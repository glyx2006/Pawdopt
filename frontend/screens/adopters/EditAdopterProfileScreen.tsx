import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import { Ionicons } from '@expo/vector-icons';

import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import { RootStackParamList } from '../../App'; // Import your RootStackParamList type
import { SafeAreaView } from 'react-native-safe-area-context';

// Define AdopterProfile interface (ensure this matches your actual data structure)
interface AdopterProfile {
  adopterId: string;
  name: string;
  email: string; // Assuming email is not editable
  contact: string; // This maps to phoneNo
  address: string;
  postcode: string;
  dob: string; // YYYY/MM/DD
  gender: string;
  iconUrl: string; // URL for the profile picture
  preferences: {
    preferredBreeds: string[];
    minAge: number;
    maxAge: number;
    preferredGenders: string[];
    preferredPostcode: string;
    experience?: string; // Assuming this is also part of preferences for editing
  };
}

// Define the type for the route parameters for this screen
type EditAdopterProfileScreenRouteProp = RouteProp<RootStackParamList, 'EditAdopterProfile'>;
type EditAdopterProfileScreenNavigationProp = NavigationProp<RootStackParamList, 'EditAdopterProfile'>;

const EditAdopterProfileScreen: React.FC<{
  navigation: EditAdopterProfileScreenNavigationProp;
  route: EditAdopterProfileScreenRouteProp;
}> = ({ navigation, route }) => {
  const { profile: initialProfile } = route.params;

  const [name, setName] = useState<string>(initialProfile.name || '');
  const [dob, setDob] = useState<string>(initialProfile.dob || '');
  const [gender, setGender] = useState<string>(initialProfile.gender || '');
  const [address, setAddress] = useState<string>(initialProfile.address || '');
  const [postcode, setPostcode] = useState<string>(initialProfile.postcode || '');
  const [phoneNo, setPhoneNo] = useState<string>(initialProfile.contact || ''); // Map contact to phoneNo
  const [profileImageUri, setProfileImageUri] = useState<string | null>(initialProfile.iconUrl || null);

  // Preferences state
  const [preferredBreeds, setPreferredBreeds] = useState<string>(initialProfile.preferences.preferredBreeds.join(', ') || '');
  const [minAge, setMinAge] = useState<string>(String(initialProfile.preferences.minAge) || '');
  const [maxAge, setMaxAge] = useState<string>(String(initialProfile.preferences.maxAge) || '');
  const [preferredGenders, setPreferredGenders] = useState<string>(initialProfile.preferences.preferredGenders.join(', ') || '');
  const [prefPostcode, setPrefPostcode] = useState<string>(initialProfile.preferences.preferredPostcode || '');
  const [experience, setExperience] = useState<string>(initialProfile.preferences.experience || '');


  // Error states for personal details
  const [nameError, setNameError] = useState<string>('');
  const [dobError, setDobError] = useState<string>('');
  const [genderError, setGenderError] = useState<string>('');
  const [addressError, setAddressError] = useState<string>('');
  const [postcodeError, setPostcodeError] = useState<string>('');
  const [phoneNoError, setPhoneNoError] = useState<string>('');

  // Error states for preferences
  const [prefBreedsError, setPrefBreedsError] = useState<string>('');
  const [minAgeError, setMinAgeError] = useState<string>('');
  const [maxAgeError, setMaxAgeError] = useState<string>('');
  const [prefGendersError, setPrefGendersError] = useState<string>('');
  const [prefPostcodeError, setPrefPostcodeError] = useState<string>('');
  const [experienceError, setExperienceError] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);

  // --- Image Picker Functionality ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant media library permissions to upload a profile picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // In a real app, you would upload result.assets[0].uri to S3 here
      // and then update profileImageUri with the returned S3 URL.
      setProfileImageUri(result.assets[0].uri);
      Alert.alert('Image Selected', 'Image selected successfully. It will be uploaded on save.');
    }
  };

  // --- Validation Functions (adapted from SignupAdopterDetailsScreen) ---
  const formatDob = (text: string) => {
    let cleanedText = text.replace(/\D/g, '');
    let formattedText = '';
    if (cleanedText.length > 0) {
      formattedText = cleanedText.substring(0, 4);
      if (cleanedText.length >= 5) {
        formattedText += '/' + cleanedText.substring(4, 6);
      }
      if (cleanedText.length >= 7) {
        formattedText += '/' + cleanedText.substring(6, 8);
      }
    }
    setDob(formattedText);
  };

  const formatPhoneNo = (text: string) => {
    if (!text.startsWith('+')) {
      setPhoneNo('+' + text.replace(/\D/g, ''));
    } else {
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
    if (!/^[a-zA-Z\s]+$/.test(nameString)) {
      setNameError('Name can only contain letters and spaces.');
      return false;
    }
    return true;
  };

  const validateDob = (dobString: string): boolean => {
    setDobError('');
    const parts = dobString.split('/');
    if (dobString.length === 0) return true; // Allow empty for initial state

    if (parts.length !== 3 || parts.some(part => part === '')) {
      setDobError('Format: YYYY/MM/DD');
      return false;
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      setDobError('Invalid date components (not numbers).');
      return false;
    }

    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      setDobError('Year must be between 1900 and ' + currentYear + '.');
      return false;
    }
    if (month < 1 || month > 12) {
      setDobError('Month must be between 01 and 12.');
      return false;
    }
    if (day < 1 || day > 31) {
      setDobError('Day must be between 01 and 31.');
      return false;
    }

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
      setDobError('Please enter a valid calendar date.');
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) {
      setDobError('Date of Birth cannot be in the future.');
      return false;
    }

    return true;
  };

  const validateGender = (genderString: string): boolean => {
    setGenderError('');
    const validGenders = ['Male', 'Female', 'Non-binary', 'Prefer not to say', '']; // Allow empty as it might not be mandatory on edit
    if (!validGenders.includes(genderString.trim())) {
      setGenderError('Invalid gender (Male, Female, Non-binary, Prefer not to say)');
      return false;
    }
    return true;
  };

  const validateAddress = (addressString: string): boolean => {
    setAddressError('');
    if (addressString.trim().length < 5 && addressString.trim().length > 0) { // Allow empty, but if typed, min 5
      setAddressError('Address must be at least 5 characters.');
      return false;
    }
    return true;
  };

  const validatePostcode = (postcodeString: string): boolean => {
    setPostcodeError('');
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    if (postcodeString.trim().length > 0 && !ukPostcodeRegex.test(postcodeString.trim())) {
      setPostcodeError('Please enter a valid UK postcode format.');
      return false;
    }
    return true;
  };

  const validatePhoneNo = (phoneNoString: string): boolean => {
    setPhoneNoError('');
    const phoneRegex = /^\+?[0-9\s-]{7,20}$/;
    if (phoneNoString.trim().length > 0 && !phoneRegex.test(phoneNoString.trim())) {
      setPhoneNoError('Please enter a valid phone number (7-20 digits).');
      return false;
    }
    return true;
  };

  // --- Preference Validations ---
  const validatePreferredBreeds = (breedsString: string): boolean => {
    setPrefBreedsError('');
    // Simple validation: allow empty or non-empty string
    return true;
  };

  const validateMinAge = (ageString: string): boolean => {
    setMinAgeError('');
    if (ageString.trim() === '') return true; // Allow empty
    const age = parseInt(ageString, 10);
    if (isNaN(age) || age < 0 || age > 20) { // Example range
      setMinAgeError('Min age must be 0-20.');
      return false;
    }
    if (maxAge.trim() !== '') {
      const max = parseInt(maxAge, 10);
      if (!isNaN(max) && age > max) {
        setMinAgeError('Min age cannot be greater than max age.');
        return false;
      }
    }
    return true;
  };

  const validateMaxAge = (ageString: string): boolean => {
    setMaxAgeError('');
    if (ageString.trim() === '') return true; // Allow empty
    const age = parseInt(ageString, 10);
    if (isNaN(age) || age < 0 || age > 20) { // Example range
      setMaxAgeError('Max age must be 0-20.');
      return false;
    }
    if (minAge.trim() !== '') {
      const min = parseInt(minAge, 10);
      if (!isNaN(min) && age < min) {
        setMaxAgeError('Max age cannot be less than min age.');
        return false;
      }
    }
    return true;
  };

  const validatePreferredGenders = (gendersString: string): boolean => {
    setPrefGendersError('');
    // Simple validation
    return true;
  };

  const validatePrefPostcode = (postcodeString: string): boolean => {
    setPrefPostcodeError('');
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    if (postcodeString.trim().length > 0 && !ukPostcodeRegex.test(postcodeString.trim())) {
      setPrefPostcodeError('Please enter a valid UK postcode format.');
      return false;
    }
    return true;
  };

  const validateExperience = (expString: string): boolean => {
    setExperienceError('');
    if (expString.trim().length < 10 && expString.trim().length > 0) {
      setExperienceError('Experience must be at least 10 characters.');
      return false;
    }
    return true;
  };

  // --- Change Handlers (with real-time validation) ---
  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, validator: (text: string) => boolean) => (text: string) => {
    setter(text);
    validator(text);
  };

  const handleDobChange = (text: string) => {
    formatDob(text);
    validateDob(text);
  };

  const handlePhoneNoChange = (text: string) => {
    formatPhoneNo(text);
    validatePhoneNo(text);
  };


  const handleSave = async () => {
    setIsSaving(true);
    // Validate all fields
    const isNameValid = validateName(name);
    const isDobValid = validateDob(dob);
    const isGenderValid = validateGender(gender);
    const isAddressValid = validateAddress(address);
    const isPostcodeValid = validatePostcode(postcode);
    const isPhoneNoValid = validatePhoneNo(phoneNo);

    const isPrefBreedsValid = validatePreferredBreeds(preferredBreeds);
    const isMinAgeValid = validateMinAge(minAge);
    const isMaxAgeValid = validateMaxAge(maxAge);
    const isPrefGendersValid = validatePreferredGenders(preferredGenders);
    const isPrefPostcodeValid = validatePrefPostcode(prefPostcode);
    const isExperienceValid = validateExperience(experience);

    if (
      !isNameValid || !isDobValid || !isGenderValid || !isAddressValid || !isPostcodeValid || !isPhoneNoValid ||
      !isPrefBreedsValid || !isMinAgeValid || !isMaxAgeValid || !isPrefGendersValid || !isPrefPostcodeValid || !isExperienceValid
    ) {
      Alert.alert('Validation Error', 'Please correct the highlighted fields before saving.');
      setIsSaving(false);
      return;
    }

    // Prepare updated profile object
    const updatedProfile: AdopterProfile = {
      ...initialProfile, // Keep existing ID, email, etc.
      name: name.trim(),
      dob: dob.trim(),
      gender: gender.trim(),
      address: address.trim(),
      postcode: postcode.trim(),
      contact: phoneNo.trim(), // Map phoneNo back to contact
      iconUrl: profileImageUri || 'https://via.placeholder.com/150/FFDDC1/000000?text=JD', // Use selected URI or fallback

      preferences: {
        preferredBreeds: preferredBreeds.split(',').map(s => s.trim()).filter(s => s.length > 0),
        minAge: parseInt(minAge, 10) || 0, // Default to 0 if empty
        maxAge: parseInt(maxAge, 10) || 99, // Default to 99 if empty
        preferredGenders: preferredGenders.split(',').map(s => s.trim()).filter(s => s.length > 0),
        preferredPostcode: prefPostcode.trim(),
        experience: experience.trim(),
      },
    };

    try {
      // Simulate API call to update profile
      console.log('Saving profile:', updatedProfile);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request

      Alert.alert('Success', 'Profile updated successfully!');
      // Navigate back to AdopterProfileScreen, passing updated profile to refresh
      navigation.navigate('AdopterProfile', { refreshProfile: updatedProfile });

    } catch (error: any) {
      Alert.alert('Save Error', error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style = {styles.safeArea}>
        <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
        
        <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
        >
            <AppHeader
            leftComponent={
            <BackButton onPress={() => navigation.goBack()} />
            }
            />
            <View style={styles.container}>
            <Text style={styles.title}>Edit Profile</Text>

            {/* Profile Picture Section */}
            <TouchableOpacity onPress={pickImage} style={styles.profilePicContainer}>
                <Image
                source={{ uri: profileImageUri || 'https://via.placeholder.com/150/FFDDC1/000000?text=ADOPTER' }}
                style={styles.profilePic}
                />
                <Ionicons name="camera-reverse" size={28} color="#F7B781" style={styles.cameraIcon} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>

            {/* Personal Details */}
            <Text style={styles.sectionHeading}>Personal Details</Text>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                placeholder="Enter Your Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={handleChange(setName, validateName)}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

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
            {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null}

            <Text style={styles.inputLabel}>Gender</Text>
            <TextInput
                style={[styles.input, genderError ? styles.inputError : null]}
                placeholder="Male, Female, Non-binary, Prefer not to say"
                placeholderTextColor="#999"
                value={gender}
                onChangeText={handleChange(setGender, validateGender)}
            />
            {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
                style={[styles.input, addressError ? styles.inputError : null]}
                placeholder="Enter Your Location"
                placeholderTextColor="#999"
                value={address}
                onChangeText={handleChange(setAddress, validateAddress)}
            />
            {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}

            <Text style={styles.inputLabel}>Postcode</Text>
            <TextInput
                style={[styles.input, postcodeError ? styles.inputError : null]}
                placeholder="Enter Your Postcode (e.g., SW1A 0AA)"
                placeholderTextColor="#999"
                value={postcode}
                onChangeText={handleChange(setPostcode, validatePostcode)}
            />
            {postcodeError ? <Text style={styles.errorText}>{postcodeError}</Text> : null}

            <Text style={styles.inputLabel}>Phone No.</Text>
            <TextInput
                style={[styles.input, phoneNoError ? styles.inputError : null]}
                placeholder="+60123456789"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phoneNo}
                onChangeText={handlePhoneNoChange}
            />
            {phoneNoError ? <Text style={styles.errorText}>{phoneNoError}</Text> : null}


            {/* Adoption Preferences */}
            <Text style={styles.sectionHeading}>Adoption Preferences</Text>

            <Text style={styles.inputLabel}>Preferred Breeds (comma separated)</Text>
            <TextInput
                style={[styles.input, prefBreedsError ? styles.inputError : null]}
                placeholder="e.g., Golden Retriever, Labrador"
                placeholderTextColor="#999"
                value={preferredBreeds}
                onChangeText={handleChange(setPreferredBreeds, validatePreferredBreeds)}
            />
            {prefBreedsError ? <Text style={styles.errorText}>{prefBreedsError}</Text> : null}

            <Text style={styles.inputLabel}>Minimum Age (years)</Text>
            <TextInput
                style={[styles.input, minAgeError ? styles.inputError : null]}
                placeholder="e.g., 1"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={minAge}
                onChangeText={handleChange(setMinAge, validateMinAge)}
            />
            {minAgeError ? <Text style={styles.errorText}>{minAgeError}</Text> : null}

            <Text style={styles.inputLabel}>Maximum Age (years)</Text>
            <TextInput
                style={[styles.input, maxAgeError ? styles.inputError : null]}
                placeholder="e.g., 5"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={maxAge}
                onChangeText={handleChange(setMaxAge, validateMaxAge)}
            />
            {maxAgeError ? <Text style={styles.errorText}>{maxAgeError}</Text> : null}

            <Text style={styles.inputLabel}>Preferred Genders (comma separated)</Text>
            <TextInput
                style={[styles.input, prefGendersError ? styles.inputError : null]}
                placeholder="e.g., Male, Female"
                placeholderTextColor="#999"
                value={preferredGenders}
                onChangeText={handleChange(setPreferredGenders, validatePreferredGenders)}
            />
            {prefGendersError ? <Text style={styles.errorText}>{prefGendersError}</Text> : null}

            <Text style={styles.inputLabel}>Preferred Postcode</Text>
            <TextInput
                style={[styles.input, prefPostcodeError ? styles.inputError : null]}
                placeholder="e.g., SW1A 0AA"
                placeholderTextColor="#999"
                value={prefPostcode}
                onChangeText={handleChange(setPrefPostcode, validatePrefPostcode)}
            />
            {prefPostcodeError ? <Text style={styles.errorText}>{prefPostcodeError}</Text> : null}

            <Text style={styles.inputLabel}>Experience with Pets</Text>
            <TextInput
                style={[styles.textAreaInput, experienceError ? styles.inputError : null]}
                placeholder="Describe your experience with pets (e.g., owned dogs before, current pets, etc.)"
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                value={experience}
                onChangeText={handleChange(setExperience, validateExperience)}
            />
            {experienceError ? <Text style={styles.errorText}>{experienceError}</Text> : null}

            {/* Save Button */}
            <TouchableOpacity onPress={handleSave} style={styles.saveButtonWrapper} disabled={isSaving}>
                <LinearGradient
                colors={['#F48B7B', '#F9E286']}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                >
                {isSaving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
                </LinearGradient>
            </TouchableOpacity>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for the keyboard
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop: 20, // Adjusted to account for AppHeader
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F7B781',
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6F61',
    marginTop: 30,
    marginBottom: 15,
    alignSelf: 'flex-start',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  profilePicContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FF6F61',
    position: 'relative',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    resizeMode: 'cover',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    padding: 2,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#F7B781',
    marginTop: 5,
    marginBottom: 20,
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
  textAreaInput: {
    width: '100%',
    height: 120, // Adjusted height for better multi-line input
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  saveButtonWrapper: {
    width: '100%',
    marginTop: 40,
    marginBottom: 50, // More space at the bottom for scroll
    borderRadius: 50,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputError: {
    borderColor: '#FF6F61',
    borderWidth: 1, // Make border visible for error
  },
  errorText: {
    color: '#FF6F61',
    fontSize: 14,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
});

export default EditAdopterProfileScreen;