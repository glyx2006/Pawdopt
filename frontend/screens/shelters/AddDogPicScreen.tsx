import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import UploadModal from './UploadModal';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { RootStackParamList, Dog } from '../../App';

const MAX_PHOTOS = 6;
const windowWidth = Dimensions.get('window').width;
const gridPadding = 40; // total horizontal padding (container + margin)
const gridColumns = 3;
const cellMargin = 10;
const cellWidth = Math.floor((windowWidth - gridPadding - cellMargin * (gridColumns * 2)) / gridColumns);
const cellHeight = Math.floor(cellWidth * 1.5);

type AddDogPicRouteProp = RouteProp<RootStackParamList, 'AddDogPic'>;


const AddDogPicScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const route = useRoute<AddDogPicRouteProp>();
  const {
    onAddDog = () => {},
    shelterId = 'test-shelter',
    shelterPostcode = '00000',
    name = 'Test Dog',
    breed = 'Labrador',
    dob = '2022/01',
    gender = 'Male',
  } = route.params || {};

	const handleNext = () => {
		navigation.navigate('AddDogDescription', {
      onAddDog,
      shelterId,
      shelterPostcode,
      name,
      breed,
      dob,
      gender,
    });
	}
// Save image to the correct slot (1-6)
  const saveImage = async (image: string) => {
  try {
    setPhotos(prev =>
      prev.length < MAX_PHOTOS
        ? [...prev, image]
        : prev
    );

		sendToBackend();
  } catch (error) {
    console.error('Error saving image:', error);
  }
}
	const sendToBackend = () => {}
  // Placeholder for picking an image
  const handleAddPhoto = async () => {
    setModalVisible(true);
  };

  const handleCamera = async () => {
    
    try{
      await ImagePicker.requestCameraPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.back,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 1,
      });
      if (!result.canceled) {
        await saveImage(result.assets[0].uri);
      };
    } catch (error) {
      if (error instanceof Error) {
        alert('Error uploading image: ' + error.message);
      } else {
        alert('Error uploading image');
      }
      setModalVisible(false);
    };
    setModalVisible(false);
  };

  const handleGallery = async() => {
   try{
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let result = await ImagePicker.launchImageLibraryAsync({
        cameraType: ImagePicker.CameraType.back,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 1,
      });
      if (!result.canceled) {
        await saveImage(result.assets[0].uri);
      };
    } catch (error) {
      if (error instanceof Error) {
        alert('Error uploading image: ' + error.message);
      } else {
        alert('Error uploading image');
      }
      setModalVisible(false);
    };
    setModalVisible(false);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Render photo grid (2 rows x 3 columns, responsive)
  const renderPhotoCell = (index: number) => {
    const photo = photos[index];
    if (photo) {
      return (
        <View style={[styles.photoCell, { width: cellWidth, height: cellHeight }]} key={index}>
          <Image source={{ uri: photo }} style={styles.photoImage} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemovePhoto(index)}
          >
            <Ionicons name="close-circle" size={Math.floor(cellWidth * 0.28)} color="#F7B781" />
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          style={[styles.photoCell, { width: cellWidth, height: cellHeight }]}
          key={index}
          onPress={handleAddPhoto}
        >
          <View style={styles.addIconWrapper}>
            <Ionicons name="add-circle" size={Math.floor(cellWidth * 0.36)} color="#F7B781" />
          </View>
        </TouchableOpacity>
      );
    }
  };

  // Grid: always 6 cells
  const photoGrid = Array.from({ length: MAX_PHOTOS }, (_, i) => renderPhotoCell(i));

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Add photos</Text>
      <Text style={styles.subtitle}>Add at least 2 photos to continue</Text>
  <View style={[styles.gridContainer, { width: windowWidth - gridPadding }]}> {photoGrid} </View>
      {photos.length < 2 ? (
        <View style={[styles.continueButton, styles.continueButtonDisabled]}>
          <Text style={styles.continueButtonText}>CONTINUE</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.nextButtonWrapper} activeOpacity={0.8} onPress={handleNext}>
          <LinearGradient
            colors={["#F7B781", "#F7C98B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>CONTINUE</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
      <UploadModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCamera={handleCamera}
        onGallery={handleGallery}
        onRemove={() => {}}
      />
    </View>
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
  subtitle: {
    fontSize: 13,
    color: '#A3A3A3',
    marginBottom: 18,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    alignSelf: 'center',
  },
  photoCell: {
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    margin: cellMargin,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 11,
    padding: 0,
    zIndex: 2,
  },
  addIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  continueButton: {
    width: 270,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  continueButtonDisabled: {
    backgroundColor: '#E5E5E5',
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#A3A3A3',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default AddDogPicScreen;
  