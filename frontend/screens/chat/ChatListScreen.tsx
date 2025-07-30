import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, RefreshControl, Pressable, Platform } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Dog } from '../../App'; // Import Dog and RootStackParamList
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import { Ionicons } from '@expo/vector-icons'; // For icons

// Define ChatThread interface based on your DynamoDB Chats table
interface ChatThread {
  chatId: string;
  dogId: string;
  dogName: string; // Denormalized for display
  shelterId: string;
  shelterName: string; // Denormalized for display
  adopterId: string;
  adopterName: string; // Denormalized for display
  lastMessageAt: string;
  lastMessagePreview: string;
  status: 'pending_request' | 'active' | 'closed' | 'rejected';
  unreadCount?: number; // Optional for displaying unread messages
  otherParticipantPhotoUrl: string; // Mock for display
}

// Mock Data for Chat Threads
const mockChatThreads: ChatThread[] = [
  // Active chat for Adopter
  {
    chatId: 'chat-1',
    dogId: 'mock-dog-1',
    dogName: 'Bella',
    shelterId: 'mock-shelter-id-1',
    shelterName: 'Happy Paws Rescue',
    adopterId: 'mock-adopter-id-1',
    adopterName: 'Jane Doe',
    lastMessageAt: '2025-07-29T10:00:00Z',
    lastMessagePreview: 'Sounds great! Looking forward to meeting Bella.',
    status: 'active',
    unreadCount: 0,
    otherParticipantPhotoUrl: 'https://via.placeholder.com/50/C1FFDD/000000?text=SH', // Shelter mock pic
  },
  // Pending request for Shelter
  {
    chatId: 'chat-2',
    dogId: 'mock-dog-3', // Assuming a new dog for a new request
    dogName: 'Buddy',
    shelterId: 'mock-shelter-id-1',
    shelterName: 'Happy Paws Rescue',
    adopterId: 'mock-adopter-id-2',
    adopterName: 'John Smith',
    lastMessageAt: '2025-07-30T11:30:00Z',
    lastMessagePreview: 'New adoption request for Buddy!',
    status: 'pending_request',
    unreadCount: 1, // Indicate new request
    otherParticipantPhotoUrl: 'https://via.placeholder.com/50/FFDDC1/000000?text=AD', // Adopter mock pic
  },
  // Active chat for Shelter
  {
    chatId: 'chat-3',
    dogId: 'mock-dog-2',
    dogName: 'Charlie',
    shelterId: 'mock-shelter-id-1',
    shelterName: 'Happy Paws Rescue',
    adopterId: 'mock-adopter-id-3',
    adopterName: 'Alice Brown',
    lastMessageAt: '2025-07-28T15:45:00Z',
    lastMessagePreview: 'We are very excited to welcome Charlie!',
    status: 'active',
    unreadCount: 0,
    otherParticipantPhotoUrl: 'https://via.placeholder.com/50/FFDDC1/000000?text=AB', // Adopter mock pic
  },
   // Pending request for Adopter (that they sent)
  {
    chatId: 'chat-4',
    dogId: 'mock-dog-4',
    dogName: 'Lucy',
    shelterId: 'mock-shelter-id-2',
    shelterName: 'City Animal Shelter',
    adopterId: 'mock-adopter-id-1', // Jane Doe sending a request
    adopterName: 'Jane Doe',
    lastMessageAt: '2025-07-30T12:00:00Z',
    lastMessagePreview: 'Your request for Lucy is pending review.',
    status: 'pending_request',
    unreadCount: 0,
    otherParticipantPhotoUrl: 'https://via.placeholder.co/50/C1FFDD/000000?text=CA', // Shelter mock pic
  },
];

type ChatListScreenRouteProp = RouteProp<RootStackParamList, 'ChatListScreen'>;
type ChatListScreenNavigationProp = NavigationProp<RootStackParamList, 'ChatListScreen'>;

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const route = useRoute<ChatListScreenRouteProp>();
  const { role: userRole, userId } = route.params; // Get user role and ID from route params

  const [chats, setChats] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate fetching chats based on user role and ID
  const fetchChats = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    let filteredChats: ChatThread[] = [];
    if (userRole === 'adopter') {
      filteredChats = mockChatThreads.filter(chat => chat.adopterId === userId);
    } else { // shelter
      filteredChats = mockChatThreads.filter(chat => chat.shelterId === userId);
    }

    // Sort by last message time (most recent first)
    filteredChats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    setChats(filteredChats);
    setLoading(false);
    setIsRefreshing(false);
  }, [userRole, userId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useFocusEffect(
    useCallback(() => {
      fetchChats(); // Refresh when screen comes into focus
    }, [fetchChats])
  );

  const navigateToChat = (chat: ChatThread) => {
    const otherParticipantId = userRole === 'adopter' ? chat.shelterId : chat.adopterId;
    const otherParticipantName = userRole === 'adopter' ? chat.shelterName : chat.adopterName;

    navigation.navigate('ChatScreen', {
      chatId: chat.chatId,
      dogId: chat.dogId,
      dogName: chat.dogName,
      senderId: userRole === 'adopter' ? chat.adopterId : chat.shelterId,
      receipientId: userRole === 'adopter' ? chat.shelterId : chat.adopterId,
      role: userRole,
      chatStatus: chat.status,
    });
  };

  const renderChatItem = ({ item }: { item: ChatThread }) => {
    const isNewRequest = item.status === 'pending_request' && userRole === 'shelter';
    const otherParticipantName = userRole === 'adopter' ? item.shelterName : item.adopterName;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.chatCard,
          { opacity: pressed ? 0.7 : 1 },
          isNewRequest && styles.newRequestChatCard // Highlight new requests for shelters
        ]}
        onPress={() => navigateToChat(item)}
      >
        <Image source={{ uri: item.otherParticipantPhotoUrl }} style={styles.chatAvatar} />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{otherParticipantName}</Text>
          <Text style={styles.chatDogName}>Dog: {item.dogName}</Text>
          <Text style={styles.lastMessagePreview} numberOfLines={1}>{item.lastMessagePreview}</Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.messageTime}>{new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          {(item.unreadCount ?? 0) > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
          {isNewRequest && (
            <View style={styles.newRequestBadge}>
              <Text style={styles.newRequestText}>NEW REQUEST</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  // Footer Navigation Handlers
  const goToProfile = () => {
    if (userRole === 'adopter') {
      navigation.navigate('AdopterProfile');
    } else {
      navigation.navigate('ShelterProfile');
    }
  };
  const goToHome = () => {
    if (userRole === 'adopter') {
      navigation.navigate('AdopterDashboard');
    } else {
      navigation.navigate('ShelterDashboard', {});
    }
  };
  const goToChat = () => {
    // Already on chat list screen
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F7B781" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader /> {/* Header with Pawdopt logo */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Your Chats</Text>
        {chats.length === 0 ? (
          <Text style={styles.noChatsText}>No active chats yet. Check back later!</Text>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.chatId}
            renderItem={renderChatItem}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={fetchChats} />
            }
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>
      <AppFooter
        onPressProfile={goToProfile}
        onPressHome={goToHome}
        onPressChat={goToChat}
        activeScreen="chat" // Highlight chat icon
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10, // Small padding below header
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F7B781',
    marginBottom: 20,
    textAlign: 'center',
  },
  noChatsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 18,
    color: '#777',
  },
  flatListContent: {
    paddingBottom: 20, // Space for footer
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newRequestChatCard: {
    borderColor: '#F48B7B', // Highlight border for new requests
    borderWidth: 2,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#eee', // Placeholder background
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chatDogName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  lastMessagePreview: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: '#F7B781',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newRequestBadge: {
    backgroundColor: '#F48B7B', // Reddish color for new requests
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 5,
  },
  newRequestText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ChatListScreen;