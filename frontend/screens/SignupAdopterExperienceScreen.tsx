// nothing is stored in this file, but this screen will be accessed after login
//

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp, // <--- Import NavigationProp as well
} from "@react-navigation/native";

import { RootStackParamList } from "../App"; // Import your RootStackParamList type

import {
  userPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "../services/CognitoService";

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

const SignupAdopterExperienceScreen: React.FC<{
  navigation: SignupAdopterExperienceScreenNavigationProp;
  route: SignupAdopterExperienceScreenRouteProp;
}> = ({ navigation, route }) => {
  // Get all previously collected data - ENSURE THESE ARE DEFINED IN RootStackParamList IN App.tsx
  const { email, password } = route.params;

  const [experience, setExperience] = useState<string>("");

  const handleContinue = async () => {
    if (!experience) {
      Alert.alert("Error", "Please describe your experience with pets.");
      return;
    }

    // Get the current user from the user pool - requires user to be logged in
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      Alert.alert('Authentication Required', 'Please log in to update your profile.');
      navigation.navigate('Login'); // Redirect to login
      return;
    }

    // Get session to ensure user is authenticated and session is valid
    cognitoUser.getSession((err: any, session: any) => {
      if (err || !session.isValid()) {
        Alert.alert('Authentication Error', err?.message || 'Your session has expired. Please log in again.');
        navigation.navigate('Login');
        return;
      }

      // User is authenticated, proceed to update attributes
      const attributeList = [
        new CognitoUserAttribute({ Name: "custom:experience", Value: experience }),
      ];

      cognitoUser.updateAttributes(attributeList, (updateErr: any, result: any) => {
        if (updateErr) {
          Alert.alert("Update Error", updateErr.message || JSON.stringify(updateErr));
          return;
        }
        console.log('User experience updated successfully:', result);

        Alert.alert(
          "Profile Updated!",
          "Your experience details have been saved."
        );

        // Navigate to the user's main dashboard after all details are filled
        navigation.navigate("AdopterDashboard"); // Assuming AdopterDashboard is your main screen post-login
      });
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        {/* Back Arrow */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Experience with pets</Text>

        {/* Experience Input */}
        <Text style={styles.inputLabel}>Experience</Text>
        <TextInput
          style={styles.textAreaInput} // Use a different style for multi-line text
          placeholder="Enter your experience with pets
        (e.g. Any current pets? Have you ever had a dog?)"
          placeholderTextColor="#999"
          multiline={true} // Enable multi-line input
          numberOfLines={6} // Suggest initial height
          textAlignVertical="top" // Align text to top for multi-line
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
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 30,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: "#F7B781",
    fontWeight: "bold",
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
    height: 370, // Adjust height for multi-line input
    borderColor: "#ddd",
    borderWidth: 1, // Solid border for text area
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10, // Vertical padding for multi-line
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

// // Optional: signIn helper function if you need it elsewhere
// const signIn = (username, password) => {
//   const user = new CognitoUser({ Username: username, Pool: userPool });
//   const authDetails = new AuthenticationDetails({
//     Username: username,
//     Password: password,
//   });

//   user.authenticateUser(authDetails, {
//     onSuccess: (session) => {
//       console.log("Logged in:", session.getIdToken().getJwtToken());
//     },
//     onFailure: (err) => {
//       console.error("Login failed:", err);
//     },
//   });
// };

export default SignupAdopterExperienceScreen;
