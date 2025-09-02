import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, globalStyles } from '../styles/GlobalStyles';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 16,
}) => {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    ...globalStyles.shadowStyle,
    marginVertical: 8,
  },
});
