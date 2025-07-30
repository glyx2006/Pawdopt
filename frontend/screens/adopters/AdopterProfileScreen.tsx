import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import the new components
import AppHeader from '../components/AppHeader'; // Adjust path
import AppFooter from '../components/AppFooter'; // Adjust path

// Mock data
const mockAdopterProfile = { /* ... (same as before) ... */
  adopterId: 'adopter-123',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  contact: '012-3456789',
  address: '123 Pet Friendly St, Pawville, 11900 Penang, Malaysia',
  iconUrl: 'https://via.placeholder.com/150/FFDDC1/000000?text=JD',
  preferences: {
    preferredBreeds: ['Golden Retriever', 'Labrador'],
    minAge: 1,
    maxAge: 5,
    preferredGenders: ['Female'],
    preferredPostcode: '11900',
  },
};

type AdopterProfileScreenProps = {
  navigation: any;
};

const AdopterProfileScreen: React.FC<AdopterProfileScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState(mockAdopterProfile);

  useEffect(() => {
    // TODO: Implement actual API call
  }, []);

  const handleEditProfile = () => {
    navigation.navigate('EditAdopterProfile', { profile: profile });
  };

  const handleMyRequests = () => {
    navigation.navigate('AdopterRequests'); // Make sure this route exists
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => {
            console.log('Logging out...');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  // --- Footer Navigation Handlers ---
  const goToProfile = () => {
    // Already on profile, do nothing or scroll to top
    // For navigation stack, you might use navigation.replace('AdopterProfile');
  };
  const goToHome = () => {
    navigation.navigate('AdopterDashboard'); // Assuming this is your main home
  };
  const goToChat = () => {
    navigation.navigate('ChatListScreen'); // Make sure this route exists
  };
  // -----------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        rightComponent={
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color="#555" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Picture */}
        <View style={styles.profilePicContainer}>
          <Image source={{ uri: profile.iconUrl }} style={styles.profilePic} />
          <Text style={styles.name}>{profile.name}</Text>
        </View>

        {/* Contact Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Email:</Text> {profile.email}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Contact:</Text> {profile.contact}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Address:</Text> {profile.address}</Text>
        </View>

        {/* Preferences */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Adoption Preferences</Text>
          {profile.preferences.preferredBreeds.length > 0 && (
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Breeds:</Text> {profile.preferences.preferredBreeds.join(', ')}
            </Text>
          )}
          {(profile.preferences.minAge || profile.preferences.maxAge) && (
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Age Range:</Text> {profile.preferences.minAge || 'Any'} - {profile.preferences.maxAge || 'Any'} years
            </Text>
          )}
          {profile.preferences.preferredGenders.length > 0 && (
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Gender:</Text> {profile.preferences.preferredGenders.join(', ')}
            </Text>
          )}
          {profile.preferences.preferredPostcode && (
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Postcode:</Text> {profile.preferences.preferredPostcode}
            </Text>
          )}
        </View>

        {/* Navigation/Actions */}
        <TouchableOpacity style={styles.actionButton} onPress={handleMyRequests}>
          <Ionicons name="list-circle-outline" size={20} color="#333" />
          <Text style={styles.actionButtonText}>My Adoption Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
      <AppFooter
        onPressProfile={goToProfile}
        onPressHome={goToHome}
        onPressChat={goToChat}
        activeScreen="profile" // Highlight the profile icon
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flexGrow: 1, // Ensure content can scroll if larger than screen
    padding: 20,
    alignItems: 'center',
    paddingBottom: 80, // Make space for the fixed footer
  },
  // Remove header styles as they are now in AppHeader.tsx
  editButton: {
    padding: 5,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20, // Add some top margin after header
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF6F61',
    marginBottom: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  infoSection: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F61',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#FF6F61',
  },
  // Remove footer styles as they are now in AppFooter.tsx
});

export default AdopterProfileScreen;