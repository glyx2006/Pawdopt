import React, { useState } from 'react';
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
import { userPool, CognitoUserAttribute } from '../services/CognitoService'; 


import { RootStackParamList } from '../App';

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

  const handleNext = () => {
    if (!name || !dob || !gender || !address || !postcode || !phoneNo) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const attributeList = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "name", Value: name }),
      new CognitoUserAttribute({ Name: "address", Value: address }),
      new CognitoUserAttribute({ Name: "birthdate", Value: dob }),
      new CognitoUserAttribute({ Name: "phone_number", Value: phoneNo }),
      new CognitoUserAttribute({ Name: "custom:postcode", Value: postcode }),
      new CognitoUserAttribute({ Name: "custom:role", Value: "adopter" }), // Custom role attribute
      // Removed 'custom:experience' from here
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        Alert.alert("Sign Up Error", err.message || JSON.stringify(err));
        return;
      }
      // User created successfully, now navigate to the experience screen
      Alert.alert(
        "Adopter Account Created!", // Changed message slightly
        "Please provide your pet experience. You will also need to verify your email."
      );

      // Pass relevant data to the next screen if needed (e.g., email for direct update)
      // Or if you only want to update once they are logged in, just navigate.
      // For now, let's navigate to the experience screen which will handle the update.
      navigation.navigate("SignupAdopterExperience", {
        email,
        password,
      });
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
            keyboardType="numeric"
            value={dob}
            onChangeText={formatDob}
          />

          {/* Gender Input (as TextInput) */}
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
    paddingBottom: 100,
    paddingTop: 0,
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
});

export default SignupAdopterDetailsScreen;
