//TODO: alerts on web

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AppHeader from '../components/AppHeader';
import RequestCard from '../components/RequestCard';
import { AdoptionRequest, Dog } from '../types'; // Import both interfaces
import { RootStackParamList } from '../../App'; // Ensure this path is correct
import BackButton from '../components/BackButton';

// Assume you have a mock or real API service for requests
// import { fetchAdoptionRequests, withdrawAdoptionRequest, removeAdoptionRequest } from '../services/api';

type AdoptionRequestsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdoptionRequests'>;
type AdoptionRequestsScreenRouteProp = RouteProp<RootStackParamList, 'AdoptionRequests'>;

interface AdoptionRequestsScreenProps {
  navigation: AdoptionRequestsScreenNavigationProp;
  route: AdoptionRequestsScreenRouteProp;
}

const AdoptionRequestsScreen: React.FC<AdoptionRequestsScreenProps> = ({ navigation }) => {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock current user ID and role - REPLACE with actual authentication context
  // This is crucial for filtering requests relevant to the logged-in adopter
  const currentAdopterId = 'mock-adopter-id-1'; // Example adopter ID
  const currentRole = 'adopter'; // Example role

  useEffect(() => {
    fetchRequests();
  }, []);

  // Function to simulate fetching adoption requests
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock Dog data adhering to the Dog interface
      const mockDogs: { [key: string]: Dog } = {
        'dog1': {
          dogId: 'dog1', name: 'Buddy', breed: 'Golden Retriever', age: 3, gender: 'Male',
          description: 'Friendly and playful.', photoURLs: ['https://via.placeholder.com/150/FFC107/FFFFFF?text=Buddy'],
          shelterId: 'shelterA', status: 'Available', createdAt: '2024-01-01T00:00:00Z'
        },
        'dog2': {
          dogId: 'dog2', name: 'Lucy', breed: 'Labrador', age: 2, gender: 'Female',
          description: 'Loves to run.', photoURLs: ['https://via.placeholder.com/150/4CAF50/FFFFFF?text=Lucy'],
          shelterId: 'shelterB', status: 'Available', createdAt: '2024-02-01T00:00:00Z'
        },
        'dog3': {
          dogId: 'dog3', name: 'Max', breed: 'German Shepherd', age: 4, gender: 'Male',
          description: 'Protective and loyal.', photoURLs: ['https://via.placeholder.com/150/F44336/FFFFFF?text=Max'],
          shelterId: 'shelterA', status: 'Available', createdAt: '2024-03-01T00:00:00Z'
        },
        'dog4': {
          dogId: 'dog4', name: 'Daisy', breed: 'Poodle', age: 1.5, gender: 'Female',
          description: 'Energetic and smart.', photoURLs: ['https://via.placeholder.com/150/9E9E9E/FFFFFF?text=Daisy'],
          shelterId: 'shelterC', status: 'Available', createdAt: '2024-04-01T00:00:00Z'
        },
      };

      // Mock AdoptionRequest data using the updated interface and DB statuses
      const mockRequests: AdoptionRequest[] = [
        {
          requestId: 'req1', dogId: 'dog1', adopterId: currentAdopterId, shelterId: 'shelterA',
          status: 'Pending', createdAt: '2025-08-15T10:00:00Z',
          dog_details: mockDogs['dog1']
        },
        {
          requestId: 'req2', dogId: 'dog2', adopterId: currentAdopterId, shelterId: 'shelterB',
          status: 'Approved', createdAt: '2025-08-12T11:00:00Z', respondedAt: '2025-08-13T09:00:00Z', chatid: 'chat123',
          dog_details: mockDogs['dog2']
        },
        {
          requestId: 'req3', dogId: 'dog3', adopterId: currentAdopterId, shelterId: 'shelterA',
          status: 'Rejected', createdAt: '2025-08-10T09:00:00Z', respondedAt: '2025-08-11T14:00:00Z',
          dog_details: mockDogs['dog3']
        },
        // This request will initially be Pending, and if "Withdraw" is clicked,
        // its client-side status will change to 'Withdrawn' to show the "Remove" button.
        {
            requestId: 'req4_pending_to_withdrawn', dogId: 'dog4', adopterId: currentAdopterId, shelterId: 'shelterC',
            status: 'Pending', createdAt: '2025-08-08T14:00:00Z',
            dog_details: mockDogs['dog4']
        }
      ];
      // In a real app: const fetchedRequests = await fetchAdoptionRequests(currentAdopterId);
      setRequests(mockRequests); // Use fetchedRequests when API is ready
    } catch (err) {
      console.error("Failed to fetch adoption requests:", err);
      setError("Failed to load adoption requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handles navigation to the ChatScreen
  const handleChatNow = (request: AdoptionRequest) => {
    // Ensure chatid exists for Approved requests before navigating
    if (request.status === 'Approved' && request.chatid) {
      navigation.navigate('ChatScreen', {
        chatId: request.chatid,
        dogId: request.dogId,
        dogName: request.dog_details.name,
        senderId: request.adopterId, // The adopter is the sender in this context
        receipientId: request.shelterId, // The shelter is the recipient
        role: currentRole, // The role of the currently logged-in user
        chatStatus: 'active', // Assuming chat is active if request is Approved
      });
    } else {
      Alert.alert("Error", "Chat is not available for this request yet.");
    }
  };

  // Handles withdrawing a pending request
  const handleWithdrawRequest = async (requestId: string) => {
    Alert.alert(
      "Withdraw Request",
      "Are you sure you want to withdraw this adoption request? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          onPress: async () => {
            try {
              // In a real app, you'd send an API call to update the request status on the backend.
              // The backend might set the status to 'Rejected' or a specific 'Withdrawn' status.
              // For client-side demonstration, we'll update the local state.
              // Example API call: await withdrawAdoptionRequest(requestId);
              setRequests(prev =>
                prev.map(req =>
                  req.requestId === requestId ? { ...req, status: 'Withdrawn' as any } : req // Cast to any for client-side 'Withdrawn' status
                )
              );
              Alert.alert("Success", "Request withdrawn successfully.");
            } catch (error) {
              console.error("Failed to withdraw request:", error);
              Alert.alert("Error", "Failed to withdraw request. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Handles removing a rejected or withdrawn request from the list (client-side)
  const handleRemoveRequest = async (requestId: string) => {
    Alert.alert(
      "Remove from List",
      "Are you sure you want to remove this request from your list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            try {
              // This would likely be an API call to soft-delete or remove the request from the user's view.
              // Example API call: await removeAdoptionRequest(requestId);
              setRequests(prev => prev.filter(req => req.requestId !== requestId));
              Alert.alert("Success", "Request removed from list.");
            } catch (error) {
              console.error("Failed to remove request:", error);
              Alert.alert("Error", "Failed to remove request. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F48B7B" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRequests}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList // Using FlatList for efficient rendering of scrollable lists
        ListHeaderComponent={
          <>
            {/* AppHeader is placed inside ListHeaderComponent, so it scrolls with the list */}
            <AppHeader
              leftComponent={
                // You can add a BackButton here if this screen is not a main tab,
                // otherwise, it might be null or a different icon (e.g., menu icon)
                <BackButton onPress={() => navigation.goBack()} />
              
              }
              // You can add a simple text component as a title in the header if needed
              // rightComponent={<Text style={{ color: '#F7B781', fontSize: 18, fontWeight: 'bold' }}>Settings</Text>}
            />
            {/* Main title for the page, also scrolls with the list */}
            <Text style={styles.pageTitle}>My Adoption Requests</Text>
          </>
        }
        data={requests}
        keyExtractor={(item) => item.requestId} // Use requestId as the unique key
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onChatNow={handleChatNow}
            onWithdrawRequest={handleWithdrawRequest}
            onRemoveRequest={handleRemoveRequest}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>You haven't made any adoption requests yet.</Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('AdopterDashboard')}>
                <Text style={styles.browseButtonText}>Browse Dogs</Text>
            </TouchableOpacity>
          </View>
        }
        // contentContainerStyle ensures proper padding and centering for empty lists
        contentContainerStyle={requests.length === 0 ? styles.flatListEmptyContent : styles.flatListContent}
      />
      {/* AppFooter would typically be fixed at the bottom, outside the FlatList */}
      {/* <AppFooter navigation={navigation} /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#F48B7B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  flatListEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F7B781',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#F7B781',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdoptionRequestsScreen;