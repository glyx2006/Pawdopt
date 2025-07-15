import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
// You'll create these next
// import SignupAdopterScreen from './screens/SignupAdopterScreen';
// import SignupShelterScreen from './screens/SignupShelterScreen';

// Define the type for your navigation stack parameters
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignupAdopter: undefined;
  SignupShelter: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        {/* Add your other signup screens here once you create them */}
        {/* <Stack.Screen name="SignupAdopter" component={SignupAdopterScreen} /> */}
        {/* <Stack.Screen name="SignupShelter" component={SignupShelterScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}