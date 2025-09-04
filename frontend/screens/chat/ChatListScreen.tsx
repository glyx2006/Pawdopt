import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, RefreshControl, Pressable } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useSubscription } from '@apollo/client';
import { RootStackParamList } from '../../App';
import { AppHeader, AppFooter } from '../../components';
import { LIST_ALL_MESSAGES, ON_CREATE_MESSAGE, ON_UPDATE_MESSAGE } from './graphql/queries';
import { fetchUserChats, enrichChatData, EnrichedChatData } from '../../src/api';

interface Message {
  chat_id: string;
  sent_at: string;
  message_id: string;
  sender_id: string;
  text: string;
  read_status?: boolean;
}

type ChatThread = EnrichedChatData;

type ChatListScreenRouteProp = RouteProp<RootStackParamList, 'ChatListScreen'>;
type ChatListScreenNavigationProp = NavigationProp<RootStackParamList, 'ChatListScreen'>;

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const route = useRoute<ChatListScreenRouteProp>();
  const { role: userRole, userId } = route.params;

  const [chats, setChats] = useState<ChatThread[]>([]);
  const [chatIds, setChatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Query to get all messages
  const { 
    data: messagesData, 
    loading: messagesLoading, 
    refetch: refetchMessages,
    error: messagesError
  } = useQuery(LIST_ALL_MESSAGES, {
    variables: {
      limit: 1000,
    },
    fetchPolicy: 'cache-first', // Use cache for faster navigation
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      console.log('📤 Messages query completed successfully:', data?.listMessages?.items?.length || 0, 'messages');
      setLoading(false); // Stop loading when query completes
    },
    onError: (error) => {
      console.error('❌ Messages query failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        extraInfo: error.extraInfo
      });
      setLoading(false); // Stop loading even on error
    },
  });

  // Subscribe to new messages across all chats
  useSubscription(ON_CREATE_MESSAGE, {
    onData: ({ data }) => {
      if (data?.data?.onCreateMessage) {
        handleNewMessage(data.data.onCreateMessage);
      }
    },
  });

  // Subscribe to message updates (read status changes)
  useSubscription(ON_UPDATE_MESSAGE, {
    onData: ({ data }) => {
      if (data?.data?.onUpdateMessage) {
        handleMessageUpdate(data.data.onUpdateMessage);
      }
    },
  });

  // Process messages and create chat list
  const processMessages = useCallback(async (messages: Message[]) => {
    try {
      // Get user's chat IDs from your existing API (this contains chat metadata)
      const rawChats = await fetchUserChats();
      const userChatIds = rawChats.map(chat => chat.chatId);
      setChatIds(userChatIds);

      if (!messages || messages.length === 0) {
        // Even if no messages, still show chats with empty state
        const enrichedChats = await enrichChatData(rawChats, userRole);
        setChats(enrichedChats);
        return;
      }

      // Filter messages for user's chats only
      const userMessages = messages.filter(msg => userChatIds.includes(msg.chat_id));

      // Group messages by chat_id and find latest message for each
      const chatMap = new Map<string, {
        latestMessage: Message;
        unreadCount: number;
        messages: Message[];
      }>();

      userMessages.forEach(message => {
        const chatId = message.chat_id;
        
        if (!chatMap.has(chatId)) {
          chatMap.set(chatId, {
            latestMessage: message,
            unreadCount: 0,
            messages: [message]
          });
        } else {
          const chatData = chatMap.get(chatId)!;
          chatData.messages.push(message);
          
          // Update latest message if this one is newer
          if (new Date(message.sent_at) > new Date(chatData.latestMessage.sent_at)) {
            chatData.latestMessage = message;
          }
        }
      });

      // Enrich chat data with metadata
      const enrichedChats = await enrichChatData(rawChats, userRole);

      // Update enriched chats with message data
      const updatedChats = enrichedChats.map(chat => {
        const messageData = chatMap.get(chat.chatId);
        
        if (messageData) {
          // Calculate unread count (messages not sent by user and not read)
          const unreadCount = messageData.messages.filter(
            msg => msg.sender_id !== userId && msg.read_status === false
          ).length;

          return {
            ...chat,
            lastMessageAt: messageData.latestMessage.sent_at,
            lastMessagePreview: messageData.latestMessage.text,
            unreadCount,
          };
        }
        
        return {
          ...chat,
          lastMessageAt: '',
          lastMessagePreview: '',
          unreadCount: 0,
        };
      });

      // Sort by latest message time (most recent first)
      updatedChats.sort((a, b) => {
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });

      setChats(updatedChats);
    } catch (error) {
      console.error('Failed to process messages:', error);
      setChats([]);
    }
  }, [userRole, userId]);

  // Handle new message from subscription
  const handleNewMessage = useCallback((newMessage: Message) => {
    console.log('New message received:', newMessage);
    
    setChats(prevChats => {
      const updatedChats = [...prevChats];
      const chatIndex = updatedChats.findIndex(chat => chat.chatId === newMessage.chat_id);
      
      if (chatIndex >= 0) {
        // Update existing chat
        const chat = { ...updatedChats[chatIndex] };
        chat.lastMessageAt = newMessage.sent_at;
        chat.lastMessagePreview = newMessage.text;
        
        // Update unread count if message is not from current user
        if (newMessage.sender_id !== userId && !newMessage.read_status) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        }
        
        updatedChats[chatIndex] = chat;
        
        // Re-sort by latest message time
        updatedChats.sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
      }
      
      return updatedChats;
    });
  }, [userId]);

  // Handle message updates (like read status changes)
  const handleMessageUpdate = useCallback((updatedMessage: Message) => {
    console.log('Message updated:', updatedMessage);
    
    setChats(prevChats => {
      const updatedChats = [...prevChats];
      const chatIndex = updatedChats.findIndex(chat => chat.chatId === updatedMessage.chat_id);
      
      if (chatIndex >= 0) {
        const chat = { ...updatedChats[chatIndex] };
        
        // If this is the latest message, update the preview
        if (updatedMessage.sent_at === chat.lastMessageAt) {
          chat.lastMessagePreview = updatedMessage.text;
        }
        
        // Recalculate unread count - this would require fetching all messages for the chat
        // For now, we'll just update the current chat
        updatedChats[chatIndex] = chat;
      }
      
      return updatedChats;
    });
  }, []);

  // Process messages when data changes
  useEffect(() => {
    if (messagesData?.listMessages?.items) {
      processMessages(messagesData.listMessages.items);
    } else if (!messagesLoading) {
      // No data and not loading - still try to get chat metadata
      processMessages([]);
    }
  }, [messagesData, processMessages, messagesLoading]);

  // Refresh function for pull-to-refresh
  const fetchChats = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      await refetchMessages();
    } catch (error) {
      console.error('Failed to refresh chats:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchMessages]);

  // Smart focus behavior
  useFocusEffect(
    useCallback(() => {
      // Only refetch if we don't have any chats loaded yet
      if (chats.length === 0 && !loading) {
        refetchMessages();
      }
    }, [chats.length, loading, refetchMessages])
  );

  const navigateToChat = (chat: ChatThread) => {
    navigation.navigate('ChatScreen', {
      chatId: chat.chatId,
      dogId: chat.dogId,
      dogName: chat.dogName,
      dogCreatedAt: chat.dogCreatedAt,
      senderId: userRole === 'adopter' ? chat.adopterId : chat.shelterId,
      receipientId: userRole === 'adopter' ? chat.shelterId : chat.adopterId,
      role: userRole,
      chatStatus: (chat.status === 'closed' || chat.status === 'rejected') ? 'inactive' : chat.status,
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
          isNewRequest && styles.newRequestChatCard
        ]}
        onPress={() => navigateToChat(item)}
      >
        <Image source={{ uri: item.otherParticipantPhotoUrl }} style={styles.chatAvatar} />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{otherParticipantName}</Text>
          <Text style={styles.chatDogName}>Dog: {item.dogName}</Text>
          <Text style={styles.lastMessagePreview} numberOfLines={1}>
            {item.lastMessagePreview || 'No messages yet'}
          </Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.messageTime}>
            {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : ''}
          </Text>
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

  // Show loading during initial data fetch or when we don't have any chats yet
  const shouldShowLoading = chats.length === 0 && !messagesError;

  if (shouldShowLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F7B781" />
          <Text style={styles.loadingText}>Loading your chats...</Text>
        </View>
        <AppFooter
          onPressProfile={goToProfile}
          onPressHome={goToHome}
          onPressChat={goToChat}
          activeScreen="chat"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Your Chats</Text>
        {messagesError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Failed to load messages. Pull to refresh.
            </Text>
            <Text style={styles.errorDetails}>
              Error: {messagesError.message}
            </Text>
            {messagesError.graphQLErrors?.length > 0 && (
              <Text style={styles.errorDetails}>
                GraphQL: {messagesError.graphQLErrors[0].message}
              </Text>
            )}
            {messagesError.networkError && (
              <Text style={styles.errorDetails}>
                Network: {messagesError.networkError.message}
              </Text>
            )}
          </View>
        )}
        <FlatList
          data={chats}
          keyExtractor={(item) => item.chatId}
          renderItem={renderChatItem}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={fetchChats}
              colors={['#F7B781']}
            />
          }
          contentContainerStyle={styles.flatListContent}
        />
      </View>
      <AppFooter
        onPressProfile={goToProfile}
        onPressHome={goToHome}
        onPressChat={goToChat}
        activeScreen="chat"
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
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F7B781',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorDetails: {
    color: '#c0392b',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  noChatsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 18,
    color: '#777',
  },
  flatListContent: {
    paddingBottom: 20,
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
    borderColor: '#F48B7B',
    borderWidth: 2,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#eee',
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
    backgroundColor: '#F48B7B',
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