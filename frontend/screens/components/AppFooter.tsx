import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Example icon library

// Define props for navigation
interface AppFooterProps {
  onPressProfile: () => void;
  onPressHome: () => void;
  onPressChat: () => void;
  onPressRequests?: () => void; // Optional for adopters only
  activeScreen: 'profile' | 'home' | 'chat' | 'requests'; // To highlight active icon
  userRole?: 'adopter' | 'shelter'; // To show different footer layouts
}

const AppFooter: React.FC<AppFooterProps> = ({
  onPressProfile,
  onPressHome,
  onPressChat,
  onPressRequests,
  activeScreen,
  userRole = 'adopter',
}) => {
  const getIconColor = (screen: string) =>
    activeScreen === screen ? '#FF6F61' : '#888'; // Active vs inactive color

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={onPressChat} style={styles.footerIcon}>
        <Ionicons name="chatbubbles-outline" size={30} color={getIconColor('chat')} />
        <Text style={[styles.iconText, { color: getIconColor('chat') }]}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressHome} style={styles.footerIcon}>
        <Ionicons name="home-outline" size={30} color={getIconColor('home')} />
        <Text style={[styles.iconText, { color: getIconColor('home') }]}>Home</Text>
      </TouchableOpacity>
      {userRole === 'adopter' && onPressRequests && (
        <TouchableOpacity onPress={onPressRequests} style={styles.footerIcon}>
          <Ionicons name="document-text-outline" size={30} color={getIconColor('requests')} />
          <Text style={[styles.iconText, { color: getIconColor('requests') }]}>Requests</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onPressProfile} style={styles.footerIcon}>
        <Ionicons name="person-outline" size={30} color={getIconColor('profile')} />
        <Text style={[styles.iconText, { color: getIconColor('profile') }]}>Profile</Text>
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute', // Make it stick to the bottom
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20, // Add padding for iPhone safe area
  },
  footerIcon: {
    alignItems: 'center',
    flex: 1, // Distribute space evenly
  },
  iconText: {
    fontSize: 12,
    marginTop: 2,
    color: '#888',
  },
});

export default AppFooter;