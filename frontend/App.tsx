import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import all your screen components
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import UniversalCreateAccountScreen from './screens/UniversalCreateAccountScreen';
import SignupAdopterDetailsScreen from './screens/SignupAdopterDetailsScreen';
import SignupShelterDetailsScreen from './screens/SignupShelterDetailsScreen';
import SignupAdopterExperienceScreen from './screens/SignupAdopterExperienceScreen';
import DogSwipeScreen from './screens/DogSwipeScreen';
import DogProfileDetailScreen from './screens/DogProfileDetailScreen';


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
  DogSwipe: undefined;
  DogProfileDetail: {dogId: string};
  AdopterDashboard: undefined; // No parameters expected for the dashboard (for now)
  ShelterDashboard: undefined; // No parameters expected for the dashboard (for now)
  // Add other screens here as you create them (e.g., DogSwipe, DogProfile, Chat)
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- Dummy Dashboard Components (to avoid inline function warnings) ---
// These will be replaced by your actual dashboard screens later
const AdopterDashboardScreen: React.FC = () => {
  return (
    <View style={dashboardStyles.container}>
      <Text style={dashboardStyles.text}>Adopter Dashboard</Text>
    </View>
  );
};

const ShelterDashboardScreen: React.FC = () => {
  return (
    <View style={dashboardStyles.container}>
      <Text style={dashboardStyles.text}>Shelter Dashboard</Text>
    </View>
  );
};

const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Light grey background
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
// --- End Dummy Dashboard Components ---


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
            name="DogSwipe" // <-- NEW SCREEN
            component={DogSwipeScreen}
            options={{ headerShown: false }} // Hide header for full control
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




          {/* Add more Stack.Screen components here as you develop new pages */}

        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}