import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Make sure this is installed: npx expo install expo-linear-gradient
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
const ShelterDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shelter Dashboard</Text>
      <Button
        title="Go to Dog Swipe"
        onPress={() => navigation.navigate('AdopterDashboard')}
      />
      {/* Add more functionality as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});

export default ShelterDashboardScreen;