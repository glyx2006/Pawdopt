import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Make sure this is installed: npx expo install expo-linear-gradient
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'; // Import hooks for navigation and route params
import { RootStackParamList } from '../../App'; // Import your RootStackParamList type

// Define the type for the route parameters for this screen
type UniversalCreateAccountScreenRouteProp = RouteProp<RootStackParamList, 'UniversalCreateAccount'>;

const UniversalCreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
  const route = useRoute<UniversalCreateAccountScreenRouteProp>();
  const { role } = route.params; // Get the 'role' parameter passed from OnboardingScreen

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rePassword, setRePassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false); // For password visibility toggle

  const handleNext = () => {
    // Basic client-side validation
    if (!email || !password || !rePassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (password !== rePassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) { // Example: Minimum password length
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    // Add more complex regex for email/password strength if needed

    console.log(`Universal Account creation for ${role}:`, { email, password });

    // Navigate to the next specific screen based on the role
    if (role === 'adopter') {
      navigation.navigate('SignupAdopterDetails', { email, password }); // Pass credentials to next screen
    } else if (role === 'shelter') {
      navigation.navigate('SignupShelterDetails', { email, password }); // Pass credentials to next screen
    } else {
      Alert.alert('Error', 'Invalid role specified for signup.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{'<'}</Text> {/* Simple arrow, can be an icon */}
      </TouchableOpacity>

      <Text style={styles.title}>Create Account</Text>

      {/* Email Input */}
      <Text style={styles.inputLabel}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <Text style={styles.inputLabel}>Password</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.passwordToggleText}>{showPassword ? '👁️' : '🔒'}</Text>
        </TouchableOpacity>
      </View>

      {/* Re-enter Password Input */}
      <Text style={styles.inputLabel}>Re-enter password</Text>
      <TextInput
        style={styles.input}
        placeholder="Re-enter your password"
        placeholderTextColor="#999"
        secureTextEntry={true} // Always secure for re-entry
        value={rePassword}
        onChangeText={setRePassword}
      />

      {/* Next Button */}
      <TouchableOpacity onPress={handleNext} style={styles.nextButtonWrapper}>
        <LinearGradient
          colors={['#F48B7B', '#F9E286']} // Matching your Figma gradient
          style={styles.nextButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop: 60, // Adjust for top bar content
  },
  backButton: {
    alignSelf: 'flex-start', // Align to top-left
    marginBottom: 30,
    padding: 5, // Make it easier to tap
  },
  backButtonText: {
    fontSize: 24,
    color: '#F7B781', // Matching your app's accent color
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F7B781',
    marginBottom: 40, // Space below title
    alignSelf: 'center', // Align to left
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
    marginBottom: 10, // Space below input
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 0,
    fontSize: 18,
    color: '#333',
  },
  passwordToggle: {
    padding: 10,
  },
  passwordToggleText: {
    fontSize: 20,
  },
  nextButtonWrapper: {
    width: '100%',
    marginTop: 50, // Space above the button
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

export default UniversalCreateAccountScreen;