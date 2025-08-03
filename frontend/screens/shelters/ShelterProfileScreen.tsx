import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import { signOut, getCurrentUserAttributes } from '../../src/cognito';

// Define the shape of the shelter profile
export interface ShelterProfile {
  shelterId: string;
  shelterName: string;
  email: string;
  contact: string;
  address: string;
  postcode: string;
  iconUrl: string;
}

const initialProfileState: ShelterProfile = {
  shelterId: '',
  shelterName: '',
  email: '',
  contact: '',
  address: '',
  postcode: '',
  iconUrl: 'https://placehold.co/200x150/C1FFDD/000000?text=HP',
};

type ShelterProfileScreenNavigationProp = NavigationProp<RootStackParamList, 'ShelterProfile'>;

const ShelterProfileScreen: React.FC = () => {
  const navigation = useNavigation<ShelterProfileScreenNavigationProp>();
  const [profile, setProfile] = useState<ShelterProfile>(initialProfileState);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const attributes = await getCurrentUserAttributes();
      
      if (attributes) {
        const fetchedProfile: ShelterProfile = {
          shelterId: attributes['sub'] || '',
          shelterName: attributes['name'] || '',
          email: attributes['email'] || '',
          contact: attributes['phone_number'] || '',
          address: attributes['address'] || '',
          postcode: attributes['custom:postcode'] || '',
          iconUrl: attributes['custom:iconURL'] || 'https://placehold.co/200x150/C1FFDD/000000?text=HP',
        };
        setProfile(fetchedProfile);
      } else {
        // If attributes is null, it means no user is authenticated.
        // We will just let isLoading become false and show a message to the user.
        console.log("No authenticated user found after initial fetch.");
      }
    } catch (error) {
      // This catch block is for network or other unexpected errors, not unauthenticated users.
      console.error('Error fetching user attributes:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleEditProfile = () => {
    navigation.navigate('EditShelterProfile', { profile: profile });
  };

  const handleMyDogs = () => {
    navigation.navigate('ShelterDashboard', {});
  };

  const handleIncomingRequests = () => {
    // Navigate to the requests screen
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: () => {
            signOut();
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  const goToProfile = () => {};
  const goToHome = () => { navigation.navigate('ShelterDashboard', {}); };
  const goToChat = () => {
    if (profile.shelterId) {
      navigation.navigate('ChatListScreen', { role: 'shelter', userId: profile.shelterId });
    } else {
      Alert.alert('Error', 'User ID not found. Please log in again.');
    }
  };

  // --- Render Logic with Loading and Auth Check ---
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F61" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // After loading is complete, check if we have a valid shelterId.
  // If not, it means the user is not authenticated.
  if (!profile.shelterId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <Text style={styles.noAuthText}>You are not logged in.</Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={styles.profilePicContainer}>
          <Image 
            source={{ uri: profile.iconUrl }}
            style={styles.profilePic} 
          />
          <Text style={styles.name}>{profile.shelterName}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Email:</Text> {profile.email}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Contact:</Text> {profile.contact}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Address:</Text> {profile.address}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Postcode:</Text> {profile.postcode}</Text>
        </View>

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
        activeScreen="profile"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f8f8' },
  container: { flexGrow: 1, padding: 20, alignItems: 'center', paddingBottom: 80 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#555', marginTop: 10 },
  noAuthText: { fontSize: 18, color: '#FF6F61', textAlign: 'center', marginBottom: 20 },
  loginButton: { backgroundColor: '#FF6F61', padding: 15, borderRadius: 10 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  editButton: { padding: 5 },
  profilePicContainer: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  profilePic: { width: 150, height: 100, borderRadius: 10, borderWidth: 3, borderColor: '#FF6F61', marginBottom: 10 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  infoSection: { width: '100%', backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FF6F61', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  infoText: { fontSize: 16, color: '#555', marginBottom: 5 },
  infoLabel: { fontWeight: 'bold', color: '#333' },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, width: '100%', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 5 },
  actionButtonText: { fontSize: 18, fontWeight: '600', color: '#333', marginLeft: 10 },
  logoutButton: { backgroundColor: '#FF6F61' },
});

export default ShelterProfileScreen;
