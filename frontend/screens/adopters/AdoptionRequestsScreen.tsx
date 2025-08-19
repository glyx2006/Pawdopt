import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AppHeader from '../components/AppHeader';
import RequestCard from '../components/RequestCard';
import { Dog, RootStackParamList } from '../../App';
import BackButton from '../components/BackButton';
import { AdoptionRequest, getAdoptionRequests } from '../../services/RequestService';
import { getDogsByIds } from '../../src/api'; // NEW: Import the function to get dog details

// Define the new interface for a combined request and dog object
interface FullAdoptionRequest extends AdoptionRequest {
  dog_details: Dog;
}

type AdoptionRequestsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdoptionRequests'>;
type AdoptionRequestsScreenRouteProp = RouteProp<RootStackParamList, 'AdoptionRequests'>;

interface AdoptionRequestsScreenProps {
  navigation: AdoptionRequestsScreenNavigationProp;
  route: AdoptionRequestsScreenRouteProp;
}

const AdoptionRequestsScreen: React.FC<AdoptionRequestsScreenProps> = ({ navigation }) => {
  const [requests, setRequests] = useState<FullAdoptionRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Fetch the basic adoption requests
      const requestsFromApi = await getAdoptionRequests();
      console.log("requestsFromApi: ", requestsFromApi);

      if (requestsFromApi.length === 0) {
        setRequests([]);
        return;
      }

      // Step 2: Get a list of all unique dog IDs from the requests
      const dogsInfo = requestsFromApi.map(req => ({
        dogId: req.dogId,
        dogCreatedAt: req.dogCreatedAt
      }));      
      console.log("dogsInfo: ", dogsInfo);
      // Step 3: Fetch the full dog details using those IDs
      const fetchedDogs = await getDogsByIds(dogsInfo);
      console.log("fetchedDogs: ", fetchedDogs);

      // Step 4: Combine the requests with the fetched dog details
      const combinedRequests: FullAdoptionRequest[] = requestsFromApi.map(req => {
        const dogDetails = fetchedDogs.find(dog => dog.dog_id === req.dogId);
        // It's possible a dog was deleted, so we'll check if dogDetails exists.
        if (!dogDetails) {
          console.log(`No dog details found for dogId: ${req.dogId}`);
          return null;
        }

        return { ...req, dog_details: dogDetails };
      }).filter(Boolean) as FullAdoptionRequest[]; // Filter out any nulls
      console.log("combinedRequests: ", combinedRequests);
      setRequests(combinedRequests);

    } catch (err) {
      console.error("Failed to load requests:", err);
      setError("Failed to load adoption requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleChatNow = (request: FullAdoptionRequest) => {
    if (request.status === 'approved' && request.chatid) {
      navigation.navigate('ChatScreen', {
        chatId: request.chatid,
        dogId: request.dogId,
        dogName: request.dog_details.name,
        senderId: request.adopterId,
        receipientId: request.shelterId,
        role: 'adopter',
        chatStatus: 'active',
      });
    } else {
      Alert.alert("Error", "Chat is not available for this request yet.");
    }
  };

  const handleWithdrawRequest = async (requestId: string) => {
    Alert.alert(
      "Withdraw Request",
      "Are you sure you want to withdraw this adoption request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          onPress: async () => {
            try {
              // Simulating API call
              setRequests(prev =>
                prev.map(req => req.requestId === requestId ? { ...req, status: 'Withdrawn' as any } : req)
              );
              Alert.alert("Success", "Request withdrawn successfully.");
            } catch (error) {
              Alert.alert("Error", "Failed to withdraw request. Please try again.");
            }
          }
        }
      ]
    );
  };

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
              setRequests(prev => prev.filter(req => req.requestId !== requestId));
              Alert.alert("Success", "Request removed from list.");
            } catch (error) {
              Alert.alert("Error", "Failed to remove request. Please try again.");
            }
          }
        }
      ]
    );
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={fetchRequests}>
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
            <AppHeader leftComponent={<BackButton onPress={() => navigation.goBack()} />} />
            <Text style={styles.pageTitle}>My Adoption Requests</Text>
          </>
        }
        data={requests}
        keyExtractor={(item) => item.requestId}
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
        contentContainerStyle={requests.length === 0 ? styles.flatListEmptyContent : styles.flatListContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', padding: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 15 },
  retryButton: { backgroundColor: '#F48B7B', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  flatListContent: { paddingBottom: 20 },
  flatListEmptyContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#F7B781', textAlign: 'center', marginTop: 20, marginBottom: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 18, color: '#999', textAlign: 'center', marginTop: 20, marginBottom: 30 },
  browseButton: { backgroundColor: '#F7B781', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
  browseButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AdoptionRequestsScreen;