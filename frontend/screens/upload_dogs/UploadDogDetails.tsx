import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';

const UploadDogDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [dogName, setDogName] = useState('');
  const [dogAge, setDogAge] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogGender, setDogGender] = useState('');

  const handleNext = () => {
    // You can add validation or navigation here
    // navigation.navigate('NextScreen');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          {/* Back Arrow */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Enter dog details</Text>

          {/* Dog Name Input */}
          <Text style={styles.inputLabel}>Dog Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Dog Name"
            placeholderTextColor="#999"
            value={dogName}
            onChangeText={setDogName}
          />

          {/* Dog Age Input */}
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Dog Age"
            placeholderTextColor="#999"
            value={dogAge}
            onChangeText={setDogAge}
            keyboardType="numeric"
          />

          {/* Dog Breed Input */}
          <Text style={styles.inputLabel}>Breed</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Dog Breed"
            placeholderTextColor="#999"
            value={dogBreed}
            onChangeText={setDogBreed}
          />

          {/* Dog Gender Dropdown */}
          <Text style={styles.inputLabel}>Gender</Text>
          <Dropdown
            style={styles.input}
            data={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Gender"
            placeholderStyle={{ color: '#999' }}
            value={dogGender}
            onChange={item => setDogGender(item.value)}
            selectedTextStyle={{ color: '#333', fontSize: 18 }}
            itemTextStyle={{ color: '#333', fontSize: 18 }}
            containerStyle={{ borderRadius: 8 }}
            activeColor="#F7B781"
            renderLeftIcon={() => null}
          />

          {/* Next Button */}
          <TouchableOpacity onPress={handleNext} style={styles.nextButtonWrapper}>
            <LinearGradient
              colors={['#F48B7B', '#F9E286']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};



const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#F7B781',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F7B781',
    marginBottom: 40,
    alignSelf: 'center',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: '#F7B781',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderBottomWidth: 1,
    paddingHorizontal: 0,
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  nextButtonWrapper: {
    width: '100%',
    marginTop: 50,
    borderRadius: 50,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputError: {
    borderColor: '#FF6F61', 
  },
  errorText: {
    color: '#FF6F61',
    fontSize: 14,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
});

export default UploadDogDetailsScreen;