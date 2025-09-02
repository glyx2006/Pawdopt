import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './GlobalStyles';

interface BackButtonProps {
  onPress: () => void; // Function to call when the button is pressed (e.g., navigation.goBack())
  color?: string;     // Optional: Color of the '<' text. Defaults to #F7B781.
  size?: number;      // Optional: Font size of the '<' text. Defaults to 24.
  style?: ViewStyle;  // Optional: Custom styles for the TouchableOpacity container.
  textStyle?: TextStyle; // Optional: Custom styles specifically for the '<' Text component.
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color = colors.orange,  // Default color to match your design
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
        <Ionicons name="chevron-back" size={size} color={color} />
      </Text>
    </TouchableOpacity>
  );
};



interface GradientButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({ onPress, title, style, textStyle }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.buttonWrapper, style]}>
      <LinearGradient
        colors={[colors.yellow, colors.red]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </LinearGradient>
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
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.white,
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 50, // Make button wrapper rounded
    overflow: 'hidden', // Clip gradient to rounded corners
  },
  gradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
});