import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import all your screen components
import OnboardingScreen from './screens/login/OnboardingScreen';
import LoginScreen from './screens/login/LoginScreen';
import UniversalCreateAccountScreen from './screens/login/UniversalCreateAccountScreen';
import SignupAdopterDetailsScreen from './screens/login/SignupAdopterDetailsScreen';
import SignupShelterDetailsScreen from './screens/login/SignupShelterDetailsScreen';
import SignupAdopterExperienceScreen from './screens/login/SignupAdopterExperienceScreen';
import DogSwipeScreen from './screens/adopters/DogSwipeScreen';
import DogProfileDetailScreen from './screens/adopters/DogProfileDetailScreen';
import ShelterDashboardScreen from './screens/shelters/ShelterDashboardScreen';
import AddDogScreen from './screens/shelters/AddDogScreen'; 
import AddDogPicScreen from './screens/shelters/AddDogPicScreen';
import ShelterProfileScreen from './screens/shelters/ShelterProfileScreen';
import AdopterProfileScreen from './screens/adopters/AdopterProfileScreen';

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  description: string;
  photoURLs: string[];
  shelterId: string;
  status: string; // e.g., "Available", "Adopted", "Pending"
  createdAt: string; // Using string for simplicity with mock data
}


// --- Define the type for your navigation stack parameters ---
// This is crucial for TypeScript to understand what parameters each screen expects
export type RootStackParamList = {
  Onboarding: undefined; // No parameters expected for the Onboarding screen
  Login: undefined; // No parameters expected for the Login screen
  UniversalCreateAccount: { role: 'adopter' | 'shelter' }; // Expects a 'role' parameter
  SignupAdopterDetails: { email: string; password: string }; // Expects email and password
  SignupShelterDetails: { email: string; password: string }; // Expects email and password
  SignupAdopterExperience: { // Expects all previously collected adopter details
    email: string;
    password: string;
    name: string;
    dob: string;
    gender: string;
    address: string;
    postcode: string;
    phoneNo: string;
  };
  DogProfileDetail: {dogId: string};
  AdopterDashboard: undefined; // No parameters expected for the dashboard (for now)
  ShelterDashboard: {
    // When navigating to ShelterDashboard, we might pass a newDog if coming from AddDogScreen
    newDog?: Dog;
  };
  AddDog: {
    // Pass a callback function to AddDogScreen to update the list on the dashboard
    onAddDog: (newDog: Dog) => void;
    // You might also pass shelter details here if needed for pre-filling
    shelterId?: string;
    shelterPostcode?: string;
  };
  AddDogPic:{
    onAddDog: (newDog: Dog) => void;
    shelterId?: string;
    shelterPostcode?: string;
    name: string;
    breed: string;
    dob: string;
    gender: string;
  }
  ShelterProfile: undefined; 
  AdopterProfile: undefined; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();




export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Onboarding">
          {/* Onboarding Screen */}
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }} // Hides the header for a clean onboarding look
          />

          {/* Login Screen */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }} // Hides the header for the login page
          />

          {/* Universal Create Account Screen (Email, Password) */}
          <Stack.Screen
            name="UniversalCreateAccount"
            component={UniversalCreateAccountScreen}
            options={{ headerShown: false }} // Hides the header for signup steps
          />

          {/* Adopter Signup Flow */}
          <Stack.Screen
            name="SignupAdopterDetails"
            component={SignupAdopterDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignupAdopterExperience"
            component={SignupAdopterExperienceScreen}
            options={{ headerShown: false }}
          />

          {/* Shelter Signup Flow */}
          <Stack.Screen
            name="SignupShelterDetails"
            component={SignupShelterDetailsScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="DogProfileDetail" // <-- NEW SCREEN (placeholder)
            component={DogProfileDetailScreen}
            options={{ headerShown: false }} // Hide header for full control
          />

          {/* Update AdopterDashboard to navigate to DogSwipe */}
          {/* You can remove the old AdopterDashboard screen if DogSwipe is its replacement */}
          <Stack.Screen
            name="AdopterDashboard"
            component={DogSwipeScreen} // <-- DIRECTLY USE DOGSWIPESCREEN FOR ADOPTER DASHBOARD
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ShelterDashboard"
            component={ShelterDashboardScreen} // Use the separate dummy component
            options={{ headerShown: false }} // Or customize header for dashboard
          />
          <Stack.Screen 
            name="AddDog" 
            component={AddDogScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen
            name="AddDogPic"
            component={AddDogPicScreen} // Use the separate dummy component
            options={{ headerShown: false }} // Or customize header for dashboard
          />
          <Stack.Screen
            name="ShelterProfile"
            component={ShelterProfileScreen} // Use the separate dummy component
            options={{ headerShown: false }} // Or customize header for dashboard
          />
          <Stack.Screen
            name="AdopterProfile"
            component={AdopterProfileScreen} // Use the separate dummy component
            options={{ headerShown: false }} // Or customize header for dashboard
          />
          {/* Add more Stack.Screen components here as you develop new pages */}

        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}