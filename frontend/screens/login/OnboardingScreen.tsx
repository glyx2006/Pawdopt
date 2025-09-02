import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"; 
import { LinearGradient } from "expo-linear-gradient"; 
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; 
import { colors } from "../components/GlobalStyles";

// Define the type for the navigation prop for this screen
type OnboardingScreenProps = NavigationProp<RootStackParamList, 'Onboarding'>; 

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenProps>();
  return (
    <LinearGradient // Use LinearGradient for the background
      colors={[colors.yellow, colors.red]} 
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Pawdopt Logo */}
        <Image
          source={require("../../assets/pawdopt_logo_white.png")} 
          style={styles.logo}
        />
        <Text style={styles.logoText}>Pawdopt</Text> {/* Text for 'Pawdopt' */}
        {/* Buttons */}
        <TouchableOpacity
          style={[styles.button, styles.adopterButton]}
          onPress={() =>
            navigation.navigate("UniversalCreateAccount", { role: "adopter" })
          } // Pass role
        >
          <Text style={styles.buttonText}>SIGN UP AS ADOPTER</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.shelterButton]}
          onPress={() =>
            navigation.navigate("UniversalCreateAccount", { role: "shelter" })
          } // Pass role
        >
          <Text style={styles.buttonText}>SIGN UP AS SHELTER</Text>
        </TouchableOpacity>
        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            {/* Navigate to your Login screen */}
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 150, 
    height: 150, 
    resizeMode: "contain",
    marginBottom: 10,
  },
  logoText: {
    fontSize: 48, 
    fontWeight: "bold",
    color: "white", 
    marginBottom: 50, 
  },
  button: {
    width: "80%", 
    paddingVertical: 15,
    borderRadius: 50, // Make it pill-shaped
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1, // Add border to match Figma
  },
  adopterButton: {
    backgroundColor: "white", 
    borderColor: "transparent", 
  },
  shelterButton: {
    backgroundColor: "white", 
    borderColor: "transparent", 
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.orange, 
  },
  loginContainer: {
    flexDirection: "row", // Align text and link horizontally
    marginTop: 20,
    alignItems: "center", // Center the text and link
  },
  loginText: {
    color: "white", // White text for "Already have an account?"
    fontSize: 16,
  },
  loginLink: {
    color: "white", 
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline", 
  },
});

export default OnboardingScreen;
