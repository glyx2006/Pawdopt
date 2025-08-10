// AdopterEditPreferencesScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { getAccessToken } from '../../services/CognitoService';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';

// Define the structure for adopter preferences
interface Preferences {
  minAge: string;
  maxAge: string;
  size: string;
  color: string;
  preferredBreeds: string[];
}

type EditAdopterPreferencesScreenNavigationProp = NavigationProp<RootStackParamList, 'EditAdopterPreference'>;

const EditAdopterPreferencesScreen: React.FC = () => {
  const navigation = useNavigation<EditAdopterPreferencesScreenNavigationProp>();
  
  const [preferences, setPreferences] = useState<Preferences>({
    minAge: '',
    maxAge: '',
    size: '',
    color: '',
    preferredBreeds: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Function to fetch preferences from your API
  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Authentication Error', 'Could not get access token.');
        navigation.goBack();
        return;
      }

      // Replace with your actual API Gateway URL for fetching preferences
      const response = await fetch('https://YOUR_API_GATEWAY_URL/adopter-preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences({
        minAge: data.minAge?.toString() || '',
        maxAge: data.maxAge?.toString() || '',
        size: data.size || '',
        color: data.color || '',
        preferredBreeds: data.preferredBreeds || [],
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      Alert.alert('Error', 'Failed to load preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  // Function to save preferences to your API
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Authentication Error', 'Could not get access token.');
        return;
      }
      
      const preferencesToSave = {
        ...preferences,
        minAge: preferences.minAge ? parseInt(preferences.minAge) : null,
        maxAge: preferences.maxAge ? parseInt(preferences.maxAge) : null,
      };

      // Replace with your actual API Gateway URL for updating preferences
      const response = await fetch('https://YOUR_API_GATEWAY_URL/adopter-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferencesToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      Alert.alert('Success', 'Preferences updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6F61" />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        leftComponent={<BackButton onPress={() => navigation.goBack()} />}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Edit Pet Preferences</Text>

          {/* Min Age Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Minimum Age (years)</Text>
            <TextInput
              style={styles.input}
              value={preferences.minAge}
              onChangeText={(text) => setPreferences({ ...preferences, minAge: text })}
              keyboardType="numeric"
              placeholder="e.g., 1"
              placeholderTextColor="#999"
            />
          </View>
          
          {/* Max Age Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maximum Age (years)</Text>
            <TextInput
              style={styles.input}
              value={preferences.maxAge}
              onChangeText={(text) => setPreferences({ ...preferences, maxAge: text })}
              keyboardType="numeric"
              placeholder="e.g., 5"
              placeholderTextColor="#999"
            />
          </View>

          {/* Size Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Size</Text>
            <TextInput
              style={styles.input}
              value={preferences.size}
              onChangeText={(text) => setPreferences({ ...preferences, size: text })}
              placeholder="e.g., Small, Medium, Large"
              placeholderTextColor="#999"
            />
          </View>
          
          {/* Color Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={preferences.color}
              onChangeText={(text) => setPreferences({ ...preferences, color: text })}
              placeholder="e.g., Black, Brown, White"
              placeholderTextColor="#999"
            />
          </View>

          {/* Preferred Breeds Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Breeds (separate with comma)</Text>
            <TextInput
              style={styles.input}
              value={preferences.preferredBreeds.join(', ')}
              onChangeText={(text) => setPreferences({ ...preferences, preferredBreeds: text.split(',').map(s => s.trim()) })}
              placeholder="e.g., Labrador, German Shepherd"
              placeholderTextColor="#999"
            />
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            )}
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f8f8' },
  keyboardAvoidingContainer: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
  container: { flexGrow: 1, padding: 20, paddingBottom: 80 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  inputGroup: { width: '100%', marginBottom: 15 },
  label: { fontSize: 16, color: '#555', marginBottom: 5 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#FF6F61',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default EditAdopterPreferencesScreen;