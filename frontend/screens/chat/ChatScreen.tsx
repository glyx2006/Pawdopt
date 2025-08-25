import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, Alert, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { client } from '../../apolloClient';
import { CREATE_MESSAGE, LIST_MESSAGES } from '../../src/api'
import { useMutation } from '@apollo/client';

const { width } = Dimensions.get('window');

// Define Message interface based on your DynamoDB Messages table
interface Message {
  messageId: string;
  chatId: string;
  senderId: string;
  receiverId?: string;
  text: string;
  sentAt: string;
  readStatus: boolean;
}

// Mock Data for Messages (for chat-2, the pending request)
// const mockMessages: Message[] = [
//   {
//     messageId: 'msg-1',
//     chatId: 'chat-1',
//     senderId: 'mock-adopter-id-1',
//     receiverId: 'mock-shelter-id-1',
//     content: 'Hi Happy Paws, I\'m very interested in Bella!',
//     sentAt: '2025-07-29T09:58:00Z',
//     read: true,
//   },
//   {
//     messageId: 'msg-2',
//     chatId: 'chat-1',
//     senderId: 'mock-shelter-id-1',
//     receiverId: 'mock-adopter-id-1',
//     content: 'Hi Jane! Great to hear. Bella is a lovely dog.',
//     sentAt: '2025-07-29T10:00:00Z',
//     read: false,
//   },
//   {
//     messageId: 'msg-3', // This would be the "system" message for a new request
//     chatId: 'chat-2',
//     senderId: 'system', // Special senderId for system messages
//     receiverId: 'mock-shelter-id-1', // Or the shelterId
//     content: 'John Smith has sent a new adoption request for Buddy. Review their profile to proceed.',
//     sentAt: '2025-07-30T11:30:00Z',
//     read: false,
//   },
// ];


type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;
type ChatScreenNavigationProp = NavigationProp<RootStackParamList, 'ChatScreen'>;

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();
  const { chatId, dogId, dogName, senderId, receipientId, role, chatStatus: initialChatStatus } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatStatus, setChatStatus] = useState(initialChatStatus); // Mutable chat status
  const [nextToken, setNextToken] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Mock current user ID (replace with actual Cognito user ID)
  // const currentUserId = role === 'adopter' ? 'mock-adopter-id-1' : 'mock-shelter-id-1';
  const currentUserId = senderId

  // Simulate fetching messages for the current chat
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    // const filteredMessages = mockMessages.filter(msg => msg.chatId === chatId);

    try {
      const { data } = await client.query({
        query: LIST_MESSAGES,
        variables: {
          filter: { chat_id: {eq: chatId} },
          limit: 50,
          nextToken: nextToken || null,
        },
        fetchPolicy: 'network-only',
      })

      const filteredMessages = data.listMessages.items;
      console.log("filteredMessages: ", filteredMessages);
      console.log("messages:", messages)
          // Sort messages chronologically
      filteredMessages.sort((a: any, b: any) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      setMessages(prev => {
        const newMessages = filteredMessages.filter(
          (fm: Message) => !prev.some(pm => pm.messageId === fm.messageId)
        );
        return [...prev, ...newMessages];
      });

    } catch (error) {
      console.error('Error fetching message:', error);
    } finally {
      setLoading(false);
      // Scroll to bottom after messages load
      // setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }

  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const [createMessage] = useMutation(CREATE_MESSAGE);


  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageToSend = {
      messageId: `msg-${Date.now()}`,
      chatId: chatId,
      senderId: currentUserId,
      // receiverId: role === 'adopter' ? receipientId : senderId,
      text: newMessage.trim(),
      sentAt: new Date().toISOString(),
      readStatus: false, // Will be true when other party reads
    };

    setMessages(prevMessages => [...prevMessages, messageToSend]);
    setNewMessage('');
    // TODO: Send message to backend (Messages table)
      try {
        const { data } = await createMessage({
          variables: {
            input: {
              message_id: messageToSend.messageId,
              chat_id: messageToSend.chatId,
              sender_id: messageToSend.senderId,
              text: messageToSend.text,
              sent_at: messageToSend.sentAt,
              read_status: messageToSend.readStatus
            }
          },
        });

        // Apollo will automatically update cache if normalized properly,
        // but if you want to ensure UI update immediately:
        if (data?.createMessage) {
          setMessages(prev => {
            if (prev.find(msg => msg.messageId === data.createMessage.messageId)) return prev;
            return [...prev, data.createMessage]
          });
        }

        setNewMessage('');
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100
        );
      } catch (error) {
        console.error("Error sending message:", error);
      }

    


    // TODO: Update Chats table (lastMessageAt, lastMessagePreview)
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleReviewProfile = () => {
    // Navigate to the adopter's profile screen
    // TODO: Make sure 'AdopterProfileDetail' exists in RootStackParamList
    Alert.alert('Review Profile', `Navigating to ${role === 'adopter' ? senderId : receipientId}'s profile (ID: ${role === 'adopter' ? senderId : receipientId})`);
    // navigation.navigate('AdopterProfileDetail', { adopterId: role === 'adopter' ? senderId : receipientId });
  };

  const handleConfirmRequest = () => {
    Alert.alert(
      "Confirm Adoption",
      `Are you sure you want to confirm the adoption request for ${dogName} with ${role === 'adopter' ? senderId : receipientId}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => {
            setChatStatus('active'); // Update local state
            // TODO: Call backend API to update Request status to 'approved' and Chat status to 'active'
            // Backend should also send a system message like "Your request has been approved!"
            Alert.alert('Success', 'Request confirmed! You can now chat.');
            // Optionally, send an initial message from shelter
            const confirmationMessage: Message = {
              messageId: `msg-${Date.now()}-confirm`,
              chatId: chatId,
              senderId: currentUserId, // Shelter sending
              receiverId: role === 'adopter' ? receipientId : senderId, // Adopter receiving
              text: `Great news! Your adoption request for ${dogName} has been approved. Let's chat!`,
              sentAt: new Date().toISOString(),
              readStatus: false,
            };
            setMessages(prevMessages => [...prevMessages, confirmationMessage]);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          }
        }
      ]
    );
  };

  const handleIgnoreRequest = () => {
    Alert.alert(
      "Ignore Request",
      `Are you sure you want to ignore the request for ${dogName} from ${role === 'adopter' ? senderId : receipientId}? This will close the chat.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Ignore", onPress: () => {
            setChatStatus('rejected'); // Update local state
            // TODO: Call backend API to update Request status to 'rejected' and Chat status to 'rejected'/'closed'
            Alert.alert('Request Ignored', 'This chat has been closed.');
            // Optionally, send a system message or navigate back
            const rejectionMessage: Message = {
              messageId: `msg-${Date.now()}-reject`,
              chatId: chatId,
              senderId: currentUserId, // Shelter sending
              receiverId: role === 'adopter' ? receipientId : senderId, // Adopter receiving
              text: `Your request for ${dogName} has been declined.`,
              sentAt: new Date().toISOString(),
              readStatus: false,
            };
            setMessages(prevMessages => [...prevMessages, rejectionMessage]);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUserId;
    const isSystemMessage = item.senderId === 'system';
    console.log('messages: ', messages)

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTimeSmall}>{new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        leftComponent={
          // Use the BackButton here
          <BackButton
            onPress={() => navigation.goBack()}
          />
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F7B781" />
          </View>
        ) : (
          <>
            {/* Conditional "New Adoption Request" Banner for Shelters */}
            {role === 'shelter' && chatStatus === 'pending_request' && (
              <View style={styles.requestBanner}>
                <Text style={styles.requestBannerTitle}>New Adoption Request!</Text>
                <Text style={styles.requestBannerText}>
                  {(role === 'shelter' ? senderId : receipientId)} is interested in {dogName}.
                </Text>
                <View style={styles.requestBannerButtons}>
                  <TouchableOpacity style={styles.reviewProfileButton} onPress={handleReviewProfile}>
                    <Text style={styles.reviewProfileButtonText}>Review Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmRequest}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.ignoreButton} onPress={handleIgnoreRequest}>
                    <Text style={styles.ignoreButtonText}>Ignore</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.messageId}
              renderItem={renderMessage}
              contentContainerStyle={styles.messageListContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Message Input Area */}
            {chatStatus === 'active' ? ( // Only show input if chat is active
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
                <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                  <Ionicons name="send" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.chatClosedMessageContainer}>
                <Text style={styles.chatClosedMessageText}>
                  {role === 'shelter' && chatStatus === 'pending_request'
                    ? 'Confirm or Ignore the request to start chatting.'
                    : chatStatus === 'rejected'
                    ? 'This chat has been closed.'
                    : 'Chat is not active.'}
                </Text>
              </View>
            )}
          </>
        )}
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  backButton: {
    padding: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  messageListContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'flex-end', // Stick messages to the bottom
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 8,
    flexDirection: 'column', // To stack text and time
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', // Light green for sender
    borderBottomRightRadius: 2,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff', // White for receiver
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTimeSmall: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    maxWidth: '80%',
  },
  systemMessageText: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8, // Adjust for iOS keyboard safe area
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100, // Prevent input from growing too large
  },
  sendButton: {
    backgroundColor: '#F7B781',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  // Request Banner Styles (for shelters)
  requestBanner: {
    backgroundColor: '#FFDDC1', // Light orange background
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  requestBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F61',
    marginBottom: 5,
  },
  requestBannerText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  requestBannerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  reviewProfileButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  reviewProfileButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#4CAF50', // Green for confirm
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ignoreButton: {
    backgroundColor: '#F44336', // Red for ignore
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  ignoreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chatClosedMessageContainer: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  chatClosedMessageText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
});

export default ChatScreen;