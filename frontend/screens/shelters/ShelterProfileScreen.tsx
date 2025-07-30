import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import the new components
import AppHeader from '../components/AppHeader'; // Adjust path
import AppFooter from '../components/AppFooter'; // Adjust path

// Mock data
const mockShelterProfile = { /* ... (same as before) ... */
  shelterId: 'mock-shelter-id-1',
  shelterName: 'Happy Paws Rescue',
  email: 'contact@happypaws.com',
  contact: '017-9876543',
  address: '456 Dog Lovers Lane, Petville, 11900 Penang, Malaysia',
  about: 'Happy Paws Rescue is dedicated to finding loving forever homes for abandoned and neglected animals. We believe every paw deserves a chance at happiness.',
  iconUrl: 'https://via.placeholder.com/200x150/C1FFDD/000000?text=HP',
};

type ShelterProfileScreenProps = {
  navigation: any;
};

const ShelterProfileScreen: React.FC<ShelterProfileScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState(mockShelterProfile);

  useEffect(() => {
    // TODO: Implement actual API call
  }, []);

  const handleEditProfile = () => {
    navigation.navigate('EditShelterProfile', { profile: profile });
  };

  const handleMyDogs = () => {
    navigation.navigate('ShelterDashboard');
  };

  const handleIncomingRequests = () => {
    navigation.navigate('ShelterRequests'); // Make sure this route exists
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
    // Already on profile
  };
  const goToHome = () => {
    navigation.navigate('ShelterDashboard'); // Assuming shelter's home is their dashboard
  };
  const goToChat = () => {
    navigation.navigate('ChatListScreen', { userRole: 'shelter', userId: profile.shelterId });
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
        {/* Shelter Logo/Picture */}
        <View style={styles.profilePicContainer}>
          <Image source={{ uri: profile.iconUrl }} style={styles.profilePic} />
          <Text style={styles.name}>{profile.shelterName}</Text>
        </View>

        {/* Contact Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Email:</Text> {profile.email}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Contact:</Text> {profile.contact}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Address:</Text> {profile.address}</Text>
        </View>

        {/* About Section */}
        {profile.about && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>About Us</Text>
            <Text style={styles.infoText}>{profile.about}</Text>
          </View>
        )}

        {/* Navigation/Actions */}
        <TouchableOpacity style={styles.actionButton} onPress={handleMyDogs}>
          <Ionicons name="paw-outline" size={20} color="#333" />
          <Text style={styles.actionButtonText}>My Listed Dogs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleIncomingRequests}>
          <Ionicons name="mail-outline" size={20} color="#333" />
          <Text style={styles.actionButtonText}>Incoming Adoption Requests</Text>
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
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    paddingBottom: 80, // Space for the fixed footer
  },
  // Remove header styles
  editButton: {
    padding: 5,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  profilePic: {
    width: 150,
    height: 100,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FF6F61',
    marginBottom: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
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
  // Remove footer styles
});

export default ShelterProfileScreen;