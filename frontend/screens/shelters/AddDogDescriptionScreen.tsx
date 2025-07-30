import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { RootStackParamList, Dog } from '../../App';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';

type AddDogDescriptionRouteProp = RouteProp<RootStackParamList, 'AddDogDescription'>;

const AddDogDescriptionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<AddDogDescriptionRouteProp>();
  const [bio, setBio] = useState('');
  const {
    onAddDog = () => {},
    shelterId = 'test-shelter',
    shelterPostcode = '00000',
    name = 'Test Dog',
    breed = 'Labrador',
    dob = '2022/01',
    gender = 'Male',
  } = route.params || {};

  const canContinue = bio.trim().length > 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        {/* Back Arrow */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Enter dog description</Text>
        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          style={styles.textAreaInput}
          value={bio}
          onChangeText={setBio}
          placeholder=""
          multiline
          textAlignVertical="top"
        />
        <View style={styles.continueButtonWrapper}>
          <TouchableOpacity
            disabled={!canContinue}
            activeOpacity={canContinue ? 0.8 : 1}
            onPress={() => {/* handle continue */}}
          >
            <View style={[styles.continueButtonGradient, { backgroundColor: canContinue ? '#F7B781' : '#E5E5E5' }]}>
              <Text style={[styles.continueButtonText, { color: canContinue ? '#fff' : '#A3A3A3' }]}>CONTINUE</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 50,
    alignSelf: 'center',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: '#F7B781',
    marginBottom: 5,
    marginTop: 15,
  },
  textAreaInput: {
    width: '100%',
    height: 370,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  continueButtonWrapper: {
    width: '100%',
    marginTop: 50,
    borderRadius: 50,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AddDogDescriptionScreen;
