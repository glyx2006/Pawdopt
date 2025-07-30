import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

interface AppHeaderProps {
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
}

const AppHeader: React.FC<AppHeaderProps> = ({ rightComponent, style }) => {
  const isCentered = !rightComponent;

  return (
    <View
      style={[
        styles.header,
        isCentered ? styles.headerCentered : styles.headerSpaced,
        style,
      ]}
    >
      <View style={styles.logoTitleContainer}>
        <Image
          source={require('../../assets/pawdopt_logo.png')} // Adjust path if your components folder is deeper
          style={styles.logo}
        />
        <MaskedView
          // Adjust height and width to accommodate larger font size
          style={styles.headerTitleMaskedView}
          maskElement={
            <Text style={[styles.headerTitle, { backgroundColor: 'transparent' }]}>Pawdopt</Text>
          }
        >
          <LinearGradient
            colors={["#F9E286", "#F48B7B"]}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 0 }}
            style={styles.headerTitleGradientBackground}
          />
        </MaskedView>
      </View>

      {!isCentered && (
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 70, // Increased minimum height to make space for larger text and logo
  },
  headerSpaced: {
    justifyContent: 'space-between',
  },
  headerCentered: {
    justifyContent: 'center',
  },
  logoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40, // Increased logo size slightly to match larger text
    height: 40, // Increased logo size slightly
    resizeMode: 'contain',
    marginRight: 10, // Increased margin for spacing
  },
  headerTitleMaskedView: {
    height: 40, // **Adjusted:** Needs to be taller than fontSize 30
    width: 150, // **Adjusted:** Needs to be wider for "Pawdopt" at fontSize 30
  },
  headerTitle: {
    fontSize: 30, // **Your desired font size**
    fontWeight: 'bold',
    fontFamily: 'Roboto', // If you have a custom font
    // Ensure text aligns within MaskedView, often `textAlignVertical: 'center'` helps if not already vertically centered
  },
  headerTitleGradientBackground: {
    flex: 1,
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});

export default AppHeader;