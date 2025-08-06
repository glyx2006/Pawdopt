import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { updateUserAttributes, getAccessToken } from '../../src/cognito';
import BackButton from '../components/BackButton';
import AppHeader from '../components/AppHeader';
import UploadModal from './UploadModal';
import { RootStackParamList } from '../../App';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';

// Utility functions for S3 interaction
const getPresignedUrlForIcon = async (token: string) => {
  try {
    const response = await fetch('https://teg3n5fne0.execute-api.eu-west-2.amazonaws.com/default/PreSignIconUrl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        count: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    return { signedUrl: data.uploadUrls[0], key: data.keys[0] };
  } catch (error) {
    console.error('Error fetching presigned URL:', error);
    throw error;
  }
};

const uploadImageToS3 = async (uri: string, signedUrl: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const result = await fetch(signedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    if (!result.ok) {
      throw new Error('Image upload to S3 failed.');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};


type EditShelterProfileScreenNavigationProp = NavigationProp<RootStackParamList, 'EditShelterProfile'>;
type EditShelterProfileScreenRouteProp = RouteProp<RootStackParamList, 'EditShelterProfile'>;

const EditShelterProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditShelterProfileScreenNavigationProp>();
  const route = useRoute<EditShelterProfileScreenRouteProp>();
  const { profile } = route.params;

  const [shelterName, setShelterName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New state to hold the local URI of the image before saving
  const [imageFileUri, setImageFileUri] = useState<string | null>(null);

  // Set initial state from the profile object on component mount
  useEffect(() => {
    setShelterName(profile.shelterName);
    setContact(profile.contact);
    setAddress(profile.address);
    setPostcode(profile.postcode);
    setIconUrl(profile.iconUrl);
    setIsLoading(false);
  }, [profile]);

  const handleSave = async () => {
    setIsUploading(true);
    let newIconUrl = iconUrl;

    try {
      if (imageFileUri) {
        // Only upload to S3 if a new image was selected
        const token = await getAccessToken();
        if (!token) {
          Alert.alert('Authentication Error', 'Could not get access token. Please sign in again.');
          setIsUploading(false);
          return;
        }

        const { signedUrl, key } = await getPresignedUrlForIcon(token);
        await uploadImageToS3(imageFileUri, signedUrl);
        newIconUrl = key;
      }

      const attributesToUpdate = {
        name: shelterName,
        phone_number: contact,
        address: address,
        'custom:postcode': postcode,
        'custom:iconURL': newIconUrl,
      };

      await updateUserAttributes(attributesToUpdate);
      setImageFileUri(null); // Reset the temporary URI
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating attributes:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagePicker = (source: 'camera' | 'gallery') => {
    // Delay ensures modal closes before picker launches
    setTimeout(async () => {
      let result;

      try {
        if (source === 'camera') {
          const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
          if (!permissionResult.granted) {
            Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
            return;
          }

          console.log('Opening camera...');
          result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });
        } else {
          const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permissionResult.granted) {
            Alert.alert('Permission Denied', 'Photo library access is required to choose an image.');
            return;
          }

          console.log('Opening image library...');
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });
        }

        console.log('Image picker result:', result);

        if (result?.canceled) return;

        const imageUri = result.assets[0].uri;
        setImageFileUri(imageUri); // Used for upload
        setIconUrl(imageUri); // Display immediately
        Alert.alert('Image Selected', 'Press "Save Changes" to finalize your profile update.');

      } catch (error) {
        console.error('Image selection failed:', error);
        Alert.alert('Error', 'An error occurred while selecting the image.');
      } finally {
        // Always close modal after picker finishes
        setModalVisible(false);
      }
    }, 150); // Small delay improves picker launch reliability
  };

  const handleCamera = () => handleImagePicker('camera');
  const handleGallery = () => handleImagePicker('gallery');

  const PUBLIC_DEFAULT_IMAGE = 'https://icon-images-uploads.s3.eu-west-2.amazonaws.com/default-avatar-icon.jpg';
  const displayImageUrl = iconUrl === 'default-avatar-icon.jpg'
    ? PUBLIC_DEFAULT_IMAGE
    : (imageFileUri || `https://icon-images-uploads.s3.eu-west-2.amazonaws.com/${iconUrl}`);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6F61" />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        leftComponent={
          <BackButton onPress={() => navigation.goBack()} />
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Edit Shelter Information</Text>

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.imageContainer}>
          {isUploading ? (
            <View style={[styles.profilePic, styles.uploadingOverlay]}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <Image
              source={{ uri: displayImageUrl }}
              style={styles.profilePic}
            />
          )}
          <View style={styles.changeIconOverlay}>
            <Ionicons name="camera" size={30} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shelter Name</Text>
          <TextInput
            style={styles.input}
            value={shelterName}
            onChangeText={setShelterName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            value={contact}
            onChangeText={setContact}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Postcode</Text>
          <TextInput
            style={styles.input}
            value={postcode}
            onChangeText={setPostcode}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <UploadModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCamera={handleCamera}
        onGallery={handleGallery}
        onRemove={() => {
          throw new Error('Function not implemented.');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f8f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
  container: { flexGrow: 1, padding: 20, paddingBottom: 80, alignItems: 'center' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  imageContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#FF6F61',
    backgroundColor: '#eee',
  },
  uploadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  changeIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(255, 111, 97, 0.8)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 2,
  },
  inputGroup: { width: '100%', marginBottom: 15 },
  label: { fontSize: 16, color: '#555', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
  saveButton: { backgroundColor: '#FF6F61', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, width: '100%' },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default EditShelterProfileScreen;