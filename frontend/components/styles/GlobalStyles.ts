import { StyleSheet } from "react-native";

export const colors = {
    red: '#F48B7B',
    orange: '#F7B781',
    yellow: '#F9E286',
    lightGrey: '#ddd',
    grey: '#999',
    darkGrey: '#333',
    white: '#fff',
};

export const globalStyles = StyleSheet.create({
  // Add any global styles here if needed
  shadowStyle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
