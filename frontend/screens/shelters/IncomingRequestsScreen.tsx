import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppHeader from '../components/AppHeader';
import { RootStackParamList } from '../../App';
import BackButton from '../components/BackButton';

// Types for incoming adoption requests from shelter perspective
interface IncomingAdoptionRequest {
  requestId: string;
  dogId: string;
  adopterId: string;
  shelterId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  respondedAt?: string;
  chatid?: string;
  dog_details: {
    dogId: string;
    name: string;
    breed: string;
    age: number;
    gender: string;
    description: string;
    photoURLs: string[];
    shelterId: string;
    status: string;
    createdAt: string;
  };
  adopter_details: {
    adopterId: string;
    adopterName: string;
    email: string;
    contact: string;
    address: { formatted: string };
    postcode: string;
    iconUrl: string;
    experience?: string;
    dateOfBirth?: string;
    gender?: string;
  };
}

type IncomingRequestsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'IncomingRequests'>;
type IncomingRequestsScreenRouteProp = RouteProp<RootStackParamList, 'IncomingRequests'>;

interface IncomingRequestsScreenProps {
  navigation: IncomingRequestsScreenNavigationProp;
  route: IncomingRequestsScreenRouteProp;
}

const IncomingRequestsScreen: React.FC<IncomingRequestsScreenProps> = ({ navigation }) => {
  const [requests, setRequests] = useState<IncomingAdoptionRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock current shelter ID - REPLACE with actual authentication context
  const currentShelterId = 'mock-shelter-id-1';

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const fetchIncomingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for incoming requests
      const mockRequests: IncomingAdoptionRequest[] = [
        {
          requestId: 'req1',
          dogId: 'dog1',
          adopterId: 'adopter1',
          shelterId: currentShelterId,
          status: 'Pending',
          createdAt: '2025-08-15T10:00:00Z',
          dog_details: {
            dogId: 'dog1',
            name: 'Buddy',
            breed: 'Golden Retriever',
            age: 3,
            gender: 'Male',
            description: 'Friendly and playful.',
            photoURLs: ['https://via.placeholder.com/150/FFC107/FFFFFF?text=Buddy'],
            shelterId: currentShelterId,
            status: 'Available',
            createdAt: '2024-01-01T00:00:00Z'
          },
          adopter_details: {
            adopterId: 'adopter1',
            adopterName: 'John Smith',
            email: 'john.smith@email.com',
            contact: '+44 7123 456789',
            address: { formatted: '123 Main Street, London, UK' },
            postcode: 'SW1A 1AA',
            iconUrl: 'https://via.placeholder.com/100/2196F3/FFFFFF?text=JS',
            experience: 'I have had dogs for over 10 years. Currently have a cat and looking to add a dog to our family.',
            dateOfBirth: '1985-06-15',
            gender: 'Male'
          }
        },
        {
          requestId: 'req2',
          dogId: 'dog2',
          adopterId: 'adopter2',
          shelterId: currentShelterId,
          status: 'Pending',
          createdAt: '2025-08-14T15:30:00Z',
          dog_details: {
            dogId: 'dog2',
            name: 'Luna',
            breed: 'Labrador',
            age: 2,
            gender: 'Female',
            description: 'Loves to run.',
            photoURLs: ['https://via.placeholder.com/150/4CAF50/FFFFFF?text=Luna'],
            shelterId: currentShelterId,
            status: 'Available',
            createdAt: '2024-02-01T00:00:00Z'
          },
          adopter_details: {
            adopterId: 'adopter2',
            adopterName: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            contact: '+44 7987 654321',
            address: { formatted: '456 Oak Avenue, Manchester, UK' },
            postcode: 'M1 1AA',
            iconUrl: 'https://via.placeholder.com/100/E91E63/FFFFFF?text=SJ',
            experience: 'First-time dog owner but have done extensive research. Have a large garden and work from home.',
            dateOfBirth: '1990-03-22',
            gender: 'Female'
          }
        }
      ];

      setRequests(mockRequests);
    } catch (err) {
      console.error("Failed to fetch incoming requests:", err);
      setError("Failed to load incoming requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request: IncomingAdoptionRequest) => {
    Alert.alert(
      "Approve Request",
      `Are you sure you want to approve ${request.adopter_details.adopterName}'s application for ${request.dog_details.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              // TODO: API call to approve request and create chat
              // const chatId = await approveAdoptionRequest(request.requestId);
              
              setRequests(prev =>
                prev.map(req =>
                  req.requestId === request.requestId 
                    ? { 
                        ...req, 
                        status: 'Approved', 
                        respondedAt: new Date().toISOString(),
                        chatid: `chat_${request.requestId}_${Date.now()}`
                      } 
                    : req
                )
              );
              
              Alert.alert("Success", "Request approved! A chat has been created with the adopter.");
            } catch (error) {
              console.error("Failed to approve request:", error);
              Alert.alert("Error", "Failed to approve request. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleRejectRequest = async (request: IncomingAdoptionRequest) => {
    Alert.alert(
      "Reject Request",
      `Are you sure you want to reject ${request.adopter_details.adopterName}'s application for ${request.dog_details.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: API call to reject request
              // await rejectAdoptionRequest(request.requestId);
              
              setRequests(prev =>
                prev.map(req =>
                  req.requestId === request.requestId 
                    ? { 
                        ...req, 
                        status: 'Rejected', 
                        respondedAt: new Date().toISOString()
                      } 
                    : req
                )
              );
              
              Alert.alert("Request rejected", "The adopter has been notified.");
            } catch (error) {
              console.error("Failed to reject request:", error);
              Alert.alert("Error", "Failed to reject request. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleViewAdopterProfile = (adopter: IncomingAdoptionRequest['adopter_details']) => {
    navigation.navigate('AdopterProfileTemplate', { adopter });
  };

  const handleOpenChat = (request: IncomingAdoptionRequest) => {
    if (request.status === 'Approved' && request.chatid) {
      navigation.navigate('ChatScreen', {
        chatId: request.chatid,
        dogId: request.dogId,
        dogName: request.dog_details.name,
        senderId: request.shelterId,
        receipientId: request.adopterId,
        role: 'shelter',
        chatStatus: 'active',
      });
    }
  };

  const renderRequestCard = ({ item }: { item: IncomingAdoptionRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dogInfo}>
          <Image source={{ uri: item.dog_details.photoURLs[0] }} style={styles.dogImage} />
          <View style={styles.dogDetails}>
            <Text style={styles.dogName}>{item.dog_details.name}</Text>
            <Text style={styles.dogBreed}>{item.dog_details.breed}</Text>
            <Text style={styles.requestDate}>
              Applied: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.adopterInfo}>
        <Image source={{ uri: item.adopter_details.iconUrl }} style={styles.adopterImage} />
        <View style={styles.adopterDetails}>
          <Text style={styles.adopterName}>{item.adopter_details.adopterName}</Text>
          <Text style={styles.adopterEmail}>{item.adopter_details.email}</Text>
          <Text style={styles.adopterContact}>{item.adopter_details.contact}</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewProfileButton}
          onPress={() => handleViewAdopterProfile(item.adopter_details)}
        >
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
      </View>

      {item.status === 'Pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => handleRejectRequest(item)}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.approveButtonWrapper}
            onPress={() => handleApproveRequest(item)}
          >
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.approveButton}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'Approved' && item.chatid && (
        <TouchableOpacity 
          style={styles.chatButtonWrapper}
          onPress={() => handleOpenChat(item)}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.chatButton}
          >
            <Text style={styles.chatButtonText}>Open Chat</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F48B7B" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchIncomingRequests}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={
          <>
            <AppHeader
              leftComponent={<BackButton onPress={() => navigation.goBack()} />}
            />
            <Text style={styles.pageTitle}>Incoming Adoption Requests</Text>
          </>
        }
        data={requests}
        keyExtractor={(item) => item.requestId}
        renderItem={renderRequestCard}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No adoption requests yet.</Text>
          </View>
        }
        contentContainerStyle={requests.length === 0 ? styles.flatListEmptyContent : styles.flatListContent}
      />
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
  },
  requestCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  dogInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  dogImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  dogDetails: {
    flex: 1,
  },
  dogName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dogBreed: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
  },
  statusApproved: {
    backgroundColor: '#D4EDDA',
  },
  statusRejected: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  adopterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  adopterImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  adopterDetails: {
    flex: 1,
  },
  adopterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  adopterEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  adopterContact: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  viewProfileButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewProfileText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  approveButtonWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  approveButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatButtonWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  chatButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IncomingRequestsScreen;