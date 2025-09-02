import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { signUp } from "../../services/CognitoService";
import AppHeader from "../components/AppHeader";
import { BackButton } from "../components/Buttons";
import { handleAlert } from "../utils/AlertUtils";

// Define the type for the route parameters for this screen
type SignupAdopterExperienceScreenRouteProp = RouteProp<
  RootStackParamList,
  "SignupAdopterExperience"
>;

// Define the type for the navigation prop for this screen
type SignupAdopterExperienceScreenNavigationProp = NavigationProp<
  RootStackParamList,
  "SignupAdopterExperience"
>;

const SignupAdopterExperienceScreen: React.FC = () => {
  const navigation = useNavigation<SignupAdopterExperienceScreenNavigationProp>();
  const route = useRoute<SignupAdopterExperienceScreenRouteProp>();

  const { email, password, name, dob, gender, address, postcode, phoneNo, latitude, longitude } = route.params;
  
  console.log('Received coordinates in experience screen:', { latitude, longitude });
  
  const [experience, setExperience] = useState<string>('');

  const handleContinue = async () => {
    if (!experience) {
      handleAlert("Error", "Please describe your experience with pets.");
      return;
    }

    // Use coordinates already fetched from previous screen
    try {
      console.log('About to call signUp with coordinates:', { latitude, longitude });
      console.log('Coordinates are empty?', { latEmpty: !latitude, lngEmpty: !longitude });
      
      const signUpData = {
        email,
        password,
        name,
        dob,
        gender,
        address,
        postcode,
        phoneNo,
        role: "adopter",
        experience,
        latitude: latitude || "",
        longitude: longitude || "",
      };
      
      console.log('Complete signUp data:', JSON.stringify(signUpData, null, 2));
      
      await signUp(signUpData);
      handleAlert("Adopter Account Created!", "Please verify your email and login.");
      navigation.navigate("Login");
    } catch (err: any) {
      handleAlert("Sign Up Error", err.message || "Something went wrong.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader
          leftComponent={
            <BackButton
              onPress={() => navigation.goBack()}
            />
          }
        />
        <View style={styles.container}>
          <Text style={styles.title}>Experience with pets</Text>

          {/* Experience Input */}
          <Text style={styles.inputLabel}>Experience</Text>
          <TextInput
            style={styles.textAreaInput}
            placeholder="Enter your experience with pets&#10;(e.g. Any current pets? Have you ever had a dog?)"
            placeholderTextColor="#999"
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
            value={experience}
            onChangeText={setExperience}
          />

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            style={styles.continueButtonWrapper}
          >
            <LinearGradient
              colors={["#F48B7B", "#F9E286"]}
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueButtonText}>CONTINUE</Text>
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
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingBottom: 40, // Added padding to bottom to prevent cutoff
    paddingTop: Platform.OS === "ios" ? 60 : 0, // Adjust for iOS
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingTop: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F7B781",
    marginBottom: 50,
    alignSelf: "center",
  },
  inputLabel: {
    alignSelf: "flex-start",
    fontSize: 16,
    color: "#F7B781",
    marginBottom: 5,
    marginTop: 15,
  },
  textAreaInput: {
    width: "100%",
    height: 370,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
  },
  continueButtonWrapper: {
    width: "100%",
    marginTop: 50,
    borderRadius: 50,
    overflow: "hidden",
  },
  continueButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default SignupAdopterExperienceScreen;