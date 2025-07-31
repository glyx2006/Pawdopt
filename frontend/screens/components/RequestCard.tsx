// frontend/components/RequestCard.tsx

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AdoptionRequest } from '../types'; // Ensure this path is correct for your types file
import { Ionicons } from '@expo/vector-icons';

interface RequestCardProps {
  request: AdoptionRequest;
  // Now passes the entire AdoptionRequest object to allow ChatScreen to get all needed params
  onChatNow: (request: AdoptionRequest) => void; 
  onWithdrawRequest: (requestId: string) => void;
  onRemoveRequest: (requestId: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onChatNow, onWithdrawRequest, onRemoveRequest }) => {
  const { dog_details, status, requestId, chatid } = request; // Destructure properties from the request object

  // Helper function to determine status color
  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Approved':
        return '#4CAF50'; // Green for approved
      case 'Rejected':
        return '#F44336'; // Red for rejected
      case 'Withdrawn': // <--- Added 'Withdrawn' here for color, assuming client-side state
        return '#9E9E9E'; // Gray for withdrawn
      case 'Pending':
      default:
        return '#FFC107'; // Yellow/Orange for pending
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {/* Display dog image or a placeholder icon if no photo */}
        {dog_details.photoURLs && dog_details.photoURLs.length > 0 ? (
          <Image source={{ uri: dog_details.photoURLs[0] }} style={styles.dogImage} />
        ) : (
          <View style={styles.noImageIcon}>
            <Ionicons name="image-outline" size={50} color="#ccc" />
            <Text style={{color: '#ccc', fontSize: 12}}>No Image</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.dogName}>{dog_details.name}</Text>
        <Text style={styles.dogInfo}>{dog_details.breed} | {dog_details.gender}</Text>
        <Text style={styles.dogInfo}>Age: {dog_details.age} years</Text> {/* Display age in years */}
        <Text style={[styles.statusText, { color: getStatusColor(status) }]}>Status: {status}</Text>

        <View style={styles.actionsContainer}>
          {/* "Chat Now" button for Approved requests that have a chatid */}
          {status === 'Approved' && chatid && (
            <TouchableOpacity onPress={() => onChatNow(request)} style={styles.buttonWrapper}>
              <LinearGradient
                colors={['#F9E286', '#F48B7B']}
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Chat Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* "Withdraw" button for Pending requests */}
          {status === 'Pending' && (
            <TouchableOpacity onPress={() => onWithdrawRequest(requestId)} style={styles.buttonWrapper}>
               <LinearGradient
                colors={['#FFD700', '#FFA500']} // Yellow/Orange gradient for withdraw
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Withdraw</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* "Remove" button for Rejected or client-side Withdrawn requests */}
          {/* CORRECTED CONDITION: Only show Remove if status is Rejected OR if it's client-side Withdrawn */}
          {(status === 'Rejected' || status === 'Withdrawn') && ( 
            <TouchableOpacity onPress={() => onRemoveRequest(requestId)} style={styles.buttonWrapper}>
                <LinearGradient
                colors={['#E0E0E0', '#B0B0B0']} // Gray gradient for remove
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Remove</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  dogImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImageIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  dogName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dogInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  statusText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  buttonWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RequestCard;