import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { handleAlert } from '../utils/AlertUtils'; 
import { jwtDecode, JwtPayload } from 'jwt-decode'; // Make sure to install this package for decoding JWT tokens
type LoginScreenProps = NavigationProp<RootStackParamList, 'Login'>;
interface CustomJwtPayload extends JwtPayload {
  'custom:role': 'shelter' | 'adopter';
}


const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenProps>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false); // State to toggle password visibility


  // Handle Login button press
  const handleLogin = async () => {
    if (!email || !password) {
      handleAlert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      const apiGatewayUrl = 'https://55kq17gfi7.execute-api.eu-west-2.amazonaws.com/default/CognitoLoginFunction'; // Paste your URL here

      const response = await fetch(apiGatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { idToken, accessToken } = data; 
        await AsyncStorage.setItem('idToken', idToken);
        await AsyncStorage.setItem('accessToken', accessToken);

        // Decode the token locally to get the user role
        // You'll need a library like `jwt-decode` for this.
        const decodedToken = jwtDecode<CustomJwtPayload>(idToken);
        const userRole = decodedToken['custom:role']; 

        if (userRole === 'shelter') {
          handleAlert('Login Success', 'Welcome, Shelter User!');
          navigation.navigate('ShelterDashboard', {});
        } else {
          handleAlert('Login Success', 'Welcome, Adopter!');
          navigation.navigate('AdopterDashboard');
        }
      } else {
        handleAlert('Login Failed', data.error || 'Something went wrong.');
      }
    } catch (err) {
      handleAlert('Network Error', 'Could not connect to the server.');
    }
  };

  // Navigate to the Onboarding/Signup page
  const handleCreateAccount = () => {
    navigation.navigate('Onboarding'); // Navigate back to the Onboarding screen for signup options
  };

  return (
    <View style={styles.container}>
      {/* "Log in" and "Hi! Welcome to" Text */}
      <Text style={styles.greetingTitle}>Log in</Text>
      <Text style={styles.greetingSubtitle}>Hi! Welcome to</Text>

      {/* Pawdopt Logo and Name */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/pawdopt_logo.png')} // Make sure you have your logo in the assets folder
          style={styles.logo}
        />
        <Text style={styles.appName}>Pawdopt</Text>
      </View>

      {/* Email Input */}
      <Text style={styles.inputLabel}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Your Email"
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
          placeholder="Enter Your Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword} // Toggle based on showPassword state
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          {/* Simple eye icon placeholder. You can use an actual icon library like react-native-vector-icons */}
          <Text style={styles.passwordToggleText}>{showPassword ? '👁️' : '🔒'}</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity onPress={handleLogin} style={styles.loginButtonWrapper}>
        <LinearGradient
          colors={['#F9E286', '#F48B7B']} // Matching your Onboarding gradient
          style={styles.loginButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* "Forgotten your password?" - Skipping for MVP */}
      {/* <TouchableOpacity style={styles.forgotPasswordButton}>
        <Text style={styles.forgotPasswordText}>Forgotten your password ?</Text>
      </TouchableOpacity> */}

      {/* "Don't have an account? Create an Account" */}
      <View style={styles.createAccountContainer}>
        <Text style={styles.createAccountText}>Don't have an account? </Text>
        <TouchableOpacity onPress={handleCreateAccount}>
          <Text style={styles.createAccountLink}>Create an Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
    alignItems: 'center',
    paddingHorizontal: 30, 
    paddingTop: 80, 
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F7B781',
    marginBottom: 5,
  },
  greetingSubtitle: {
    fontSize: 20,
    color: '#aaa',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row', // Align logo and text horizontally
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 60, 
    height: 60, 
    resizeMode: 'contain',
    marginRight: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F7B781', 
  },
  inputLabel: {
    alignSelf: 'flex-start', // Align label to the left
    fontSize: 16,
    color: '#F7B781',
    marginBottom: 5,
    marginTop: 15, // Space between inputs
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderBottomWidth: 1, // Only bottom border 
    paddingHorizontal: 0, // No horizontal padding for input text
    fontSize: 18,
    color: '#333',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderColor: '#ddd',
    borderBottomWidth: 1, // Only bottom border
    marginBottom: 20, // Space below password input
  },
  passwordInput: {
    flex: 1, // Take up remaining space
    height: 50,
    paddingHorizontal: 0,
    fontSize: 18,
    color: '#333',
  },
  passwordToggle: {
    padding: 10,
  },
  passwordToggleText: {
    fontSize: 20, // Adjust icon size
  },
  loginButtonWrapper: {
    width: '100%',
    marginTop: 30, // Space above the button
    borderRadius: 50, // Make button wrapper rounded
    overflow: 'hidden', // Clip gradient to rounded corners
  },
  loginButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // White text on gradient button
  },
  forgotPasswordButton: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#FF7B7B', // Reddish color for forgotten password link
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  createAccountContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 150, // Large space to push it to bottom as per Figma
    // Use position: 'absolute' and bottom: X if you want it fixed at the very bottom
  },
  createAccountText: {
    color: '#999', // Greyish color for "Don't have an account?"
    fontSize: 16,
  },
  createAccountLink: {
    color: '#F7B781', // Reddish color for "Create an Account" link
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
