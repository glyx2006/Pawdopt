import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import { signOut, getCurrentUserAttributes, getAccessToken, UserAttributes } from '../../services/CognitoService';

export interface AdopterProfile {
  adopterId: string;
  adopterName: string;
  email: string;
  contact: string;
  address: { formatted: string }; 
  postcode: string;
  iconUrl: string;
  // Preferences
}
const initialProfileState: AdopterProfile = {
  adopterId: '',
  adopterName: '',
  email: '',
  contact: '',
  address: { formatted: ''},
  postcode: '',
  iconUrl: 'default-avatar-icon.jpg',
};
const PUBLIC_DEFAULT_IMAGE = 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';

type AdopterProfileScreenNavigationProp = NavigationProp<RootStackParamList, 'AdopterProfile'>;


const AdopterProfileScreen: React.FC = () => {
  const navigation = useNavigation<AdopterProfileScreenNavigationProp>();
  const [profile, setProfile] = useState<AdopterProfile>(initialProfileState);
  const [isLoading, setIsLoading] = useState(true);
  const [signedIconUrl, setSignedIconUrl] = useState(PUBLIC_DEFAULT_IMAGE);
  const fetchSignedUrl = async (s3key: string) => {
    if (!s3key || s3key === 'default-avatar-icon.jpg') {
      setSignedIconUrl(PUBLIC_DEFAULT_IMAGE);
      return PUBLIC_DEFAULT_IMAGE;
    }

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No access token found');

      console.log("Fetching signed URL for S3 key:", s3key); 
      const response = await fetch('https://n1854t96wc.execute-api.eu-west-2.amazonaws.com/default/getSignedImageUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key: s3key, bucket: 'icon-images-uploads' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch signed URL: ${response.status}`);
      }

      const data = await response.json();
      console.log("Successfully fetched signed URL.");
      return data.signedUrl;
    } catch (error) {
      console.error('Error fetching signed URL:', error);
      Alert.alert('Error', 'Failed to load profile image. Using default image.');
      return PUBLIC_DEFAULT_IMAGE;
    }
  };

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const attributes = await getCurrentUserAttributes();

      if (!attributes) {
        console.log("No authenticated user found.");
        setIsLoading(false);
        return;
      }


      const fetchedProfile: AdopterProfile = {
        adopterId: attributes.sub,
        adopterName: attributes.name,
        email: attributes.email,
        contact: attributes.phone_number,
        address: attributes.address, // Correctly assigned as an object
        postcode: attributes['custom:postcode'],
        iconUrl: attributes['custom:iconURL'] || 'default-avatar-icon.jpg',
      };
      setProfile(fetchedProfile);

      const iconUrlToFetch = fetchedProfile.iconUrl;
      const url = await fetchSignedUrl(iconUrlToFetch);
      setSignedIconUrl(url);

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [fetchAllData]) // Re-run effect when fetchAllData changes
  );

  const handleEditProfile = () => {
    Alert.alert(
      "Edit Profile",
      "What would you like to edit?",
      [
        {
          text: "Edit Contact Info",
          onPress: () => navigation.navigate('EditAdopterProfile', { profile: profile }),
        },
        {
          text: "Edit Preferences",
          onPress: () => navigation.navigate('EditAdopterPreference'),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleMyRequests = () => {
    navigation.navigate('AdoptionRequests'); // Make sure this route exists
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
  const goToHome = () => { navigation.navigate('AdopterDashboard'); };
  const goToChat = () => {
    if (profile.adopterId) {
      navigation.navigate('ChatListScreen', { role: 'adopter', userId: profile.adopterId });
    } else {
      Alert.alert('Error', 'User ID not found. Please log in again.');
    }
  };

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

  if (!profile.adopterId) {
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

  console.log("Profile Data:", profile);

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
          <View style={styles.profilePicWrapper}>
            <Image
              key={signedIconUrl}
              source={{ uri: signedIconUrl }}
              style={styles.profilePic}
              resizeMode='cover'
              onError={(e) => console.error("Image load failed:", e.nativeEvent.error)}
            />
          </View>
          <Text style={styles.name}>{profile.adopterName}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Email:</Text> {profile.email}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Contact:</Text> {profile.contact}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Address:</Text> {profile.address.formatted}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Postcode:</Text> {profile.postcode}</Text>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={handleMyRequests}>
          <Ionicons name="list-circle-outline" size={20} color="#333" />
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
  profilePicWrapper: { width: 150, height: 150, borderRadius: 100, borderWidth: 3, borderColor: '#FF6F61', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' },
  profilePic: { width: '100%', height: '100%', borderRadius: 100 },
  imageLoader: { position: 'absolute' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 10 },
  infoSection: { width: '100%', backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FF6F61', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  infoText: { fontSize: 16, color: '#555', marginBottom: 5 },
  infoLabel: { fontWeight: 'bold', color: '#333' },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, width: '100%', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 5 },
  actionButtonText: { fontSize: 18, fontWeight: '600', color: '#333', marginLeft: 10 },
  logoutButton: { backgroundColor: '#FF6F61' },
});

export default AdopterProfileScreen;