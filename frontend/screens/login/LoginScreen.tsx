import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App';
import { handleAlert } from '../utils/AlertUtils'; 
import { signIn } from '../../services/CognitoService';
import { jwtDecode } from 'jwt-decode';
import { colors } from '../components/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '../components/Buttons';

type LoginScreenProps = NavigationProp<RootStackParamList, 'Login'>;

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
      // IMPORTANT CHANGE: Call the signIn function from CognitoService
      // This function handles the API call, token storage (including refreshToken),
      // and returns the tokens or throws an error.
      const { idToken } = await signIn(email, password); 

      // Additional explicit storage of idToken (redundant but for confirmation)
      await AsyncStorage.setItem("idToken", idToken);

      // Now, decode the token to get the user role.
      // You still need jwtDecode here if you want to determine role immediately after login.
      // If you prefer, you can modify the signIn function in CognitoService to also return the userRole.
      const decodedToken: { 'custom:role': 'shelter' | 'adopter' } = jwtDecode(idToken);
      const userRole = decodedToken['custom:role']; 

      if (userRole === 'shelter') {
        handleAlert('Login Success', 'Welcome, Shelter User!');
        navigation.navigate('ShelterDashboard', {});
      } else {
        handleAlert('Login Success', 'Welcome, Adopter!');
        navigation.navigate('AdopterDashboard');
      }
    } catch (err: any) {
      // The error message comes from the signIn function now
      handleAlert('Login Failed', err.message || 'Something went wrong.');
    }
  };

  // Navigate to the Onboarding/Signup page
  const handleCreateAccount = () => {
    navigation.navigate('Onboarding'); // Navigate back to the Onboarding screen for signup options
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greetingTitle}>Log in</Text>
      <Text style={styles.greetingSubtitle}>Hi! Welcome to</Text>

      {/* Pawdopt Logo and Name */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/pawdopt_logo.png')} 
          style={styles.logo}
        />
        <Text style={styles.appName}>Pawdopt</Text>
      </View>

      {/* Email Input */}
      <Text style={styles.inputLabel}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Your Email"
        placeholderTextColor={colors.grey}
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
          placeholderTextColor={colors.grey}
          secureTextEntry={!showPassword} // Toggle based on showPassword state
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={colors.grey} />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      {/* <TouchableOpacity onPress={handleLogin} style={styles.loginButtonWrapper}>
        <LinearGradient
          colors={[colors.yellow, colors.red]}
          style={styles.loginButtonGradient}
          start={gradient.start}
          end={gradient.end}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </LinearGradient>
      </TouchableOpacity> */}

      <GradientButton 
        onPress={handleLogin} 
        title="Log In"
        style={styles.loginButtonWrapper}
      />

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
    backgroundColor: 'white', 
    alignItems: 'center',
    paddingHorizontal: 30, 
    paddingTop: 80, 
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.orange,
    marginBottom: 5,
  },
  greetingSubtitle: {
    fontSize: 20,
    color: colors.grey,
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
    color: colors.orange, 
  },
  inputLabel: {
    alignSelf: 'flex-start', // Align label to the left
    fontSize: 16,
    color: colors.orange,
    marginBottom: 5,
    marginTop: 15, // Space between inputs
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: colors.lightGrey,
    borderBottomWidth: 1, // Only bottom border
    paddingHorizontal: 0, // No horizontal padding for input text
    fontSize: 18,
    color: colors.darkGrey,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderColor: colors.lightGrey,
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
    marginTop: 30, // Space above the button
  },
  forgotPasswordButton: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: colors.red, // Reddish color for forgotten password link
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
    color: colors.grey, // Greyish color for "Don't have an account?"
    fontSize: 16,
  },
  createAccountLink: {
    color: colors.orange, // Reddish color for "Create an Account" link
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
