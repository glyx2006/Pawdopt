import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"; // Import necessary components
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient from expo-linear-gradient
import { NavigationProp } from '@react-navigation/native'; // <-- Import NavigationProp
import { RootStackParamList } from '../../App'; // <-- Import RootStackParamList

// Define the type for the navigation prop for this screen
type OnboardingScreenProps = NavigationProp<RootStackParamList, 'Onboarding'>; // <-- Define specific type


const OnboardingScreen: React.FC<{navigation: OnboardingScreenProps}> = ({ navigation }) => {
  return (
    <LinearGradient // Use LinearGradient for the background
      colors={["#F9E286", "#F48B7B"]} // Adjust these colors to match your Figma gradient
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Pawdopt Logo */}
        <Image
          source={require("../assets/pawdopt_logo_white.png")} // Make sure you have your logo in the assets folder
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
    width: 150, // Adjust size as needed
    height: 150, // Adjust size as needed
    resizeMode: "contain",
    marginBottom: 10,
  },
  logoText: {
    fontSize: 48, // Adjust font size
    fontWeight: "bold",
    color: "#fff", // White color for the text on the gradient
    marginBottom: 50, // Space below logo
  },
  button: {
    width: "80%", // Occupy 80% of screen width
    paddingVertical: 15,
    borderRadius: 50, // Make it pill-shaped
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1, // Add border to match Figma
  },
  adopterButton: {
    backgroundColor: "white", // White background
    borderColor: "transparent", // No border color as it's filled
  },
  shelterButton: {
    backgroundColor: "white", // White background
    borderColor: "transparent", // No border color as it's filled
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F5A27E", // Reddish color for text on white button
  },
  loginContainer: {
    flexDirection: "row", // Align text and link horizontally
    marginTop: 20,
  },
  loginText: {
    color: "#fff", // White text for "Already have an account?"
    fontSize: 16,
  },
  loginLink: {
    color: "#fff", // White color for the "Login" link
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline", // Underline the link
  },
});

export default OnboardingScreen;
