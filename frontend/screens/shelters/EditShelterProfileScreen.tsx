import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';

import { updateUserAttributes } from '../../src/cognito'; // Adjust the import path as necessary
import BackButton from '../components/BackButton';

type EditShelterProfileScreenProps = {
  navigation: any;
  route: any;
};

const EditShelterProfileScreen: React.FC<EditShelterProfileScreenProps> = ({ navigation, route }) => {
  const { profile } = route.params;

  const [shelterName, setShelterName] = useState(profile.shelterName);
  const [contact, setContact] = useState(profile.contact);
  const [address, setAddress] = useState(profile.address);
  const [postcode, setPostcode] = useState(profile.postcode);
  const [iconUrl, setIconUrl] = useState(profile.iconUrl); // <-- New state for iconUrl

  const handleSave = async () => {
    // Create an object with the attribute keys and new values
    const updatedAttributes = {
      name: shelterName,
      phone_number: contact,
      address: address,
      'custom:postcode': postcode,
      'custom:iconURL': iconUrl, // <-- New attribute to be updated
    };

    try {
      await updateUserAttributes(updatedAttributes);
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating attributes:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleImageUpload = () => {
    // This function can be used to select a new image, upload it to S3,
    // and then set the new URL in the `iconUrl` state variable.
    Alert.alert('Image Upload', 'This functionality is not yet implemented.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        leftComponent={
          <BackButton
            onPress={() => navigation.goBack()}
            ></BackButton>
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Edit Shelter Information</Text>

        <TouchableOpacity onPress={handleImageUpload} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>Change Shelter Icon</Text>
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

        {/*
          This input field is for the image URL itself. In a real app,
          you'd likely hide this and just use the button to handle the upload.
        */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Icon URL</Text>
          <TextInput
            style={styles.input}
            value={iconUrl}
            onChangeText={setIconUrl}
            placeholder="e.g., https://example.com/shelter_icon.png"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f8f8' },
  container: { flexGrow: 1, padding: 20, paddingBottom: 80 },
  backButton: { padding: 5 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  imageButton: { backgroundColor: '#FF6F61', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  imageButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 16, color: '#555', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#FF6F61', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default EditShelterProfileScreen;
