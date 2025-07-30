import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
// If you ever decide to use icons, you'll need to install this: `npx expo install @expo/vector-icons`
// import { Ionicons } from '@expo/vector-icons'; 

interface BackButtonProps {
  onPress: () => void; // Function to call when the button is pressed (e.g., navigation.goBack())
  color?: string;     // Optional: Color of the '<' text. Defaults to #F7B781.
  size?: number;      // Optional: Font size of the '<' text. Defaults to 24.
  style?: ViewStyle;  // Optional: Custom styles for the TouchableOpacity container.
  textStyle?: TextStyle; // Optional: Custom styles specifically for the '<' Text component.
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color = '#F7B781',  // Default color to match your design
  size = 24,           // Default font size to match your design
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      // Apply base container styles and any custom styles passed via 'style' prop
      style={[styles.buttonContainer, style]}
    >
      <Text
        // Apply base text styles, dynamic size/color, and any custom text styles
        style={[styles.buttonText, { fontSize: size, color: color }, textStyle]}
      >
        {'<'} {/* This is the hardcoded '<' character */}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: 'flex-start', // Pushes the button to the left
    padding: 5,   
    // Add other common container styles here if you want them to apply to all BackButtons by default
  },
  buttonText: {
    // Base styles for the text ('<')
    fontWeight: 'bold',
  },
});
export default BackButton;