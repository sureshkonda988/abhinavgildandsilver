import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IMAGE_ASSETS } from '../constants';

interface NativeHeaderProps {
  centered?: boolean;
}

const NativeHeader = ({ centered = false }: NativeHeaderProps) => {
  return (
    <View style={[styles.container, centered && styles.centeredContainer]}>
      {centered ? (
        <Image 
          source={{ uri: IMAGE_ASSETS.LOGO }} 
          style={styles.centeredLogo}
          resizeMode="contain"
        />
      ) : (
        <>
          <Image 
            source={{ uri: IMAGE_ASSETS.LOGO }} 
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="#d4af37" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  centeredContainer: {
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 40,
  },
  centeredLogo: {
    width: 160,
    height: 50,
    marginTop: 20,
  },
  menuButton: {
    padding: 5,
  }
});

export default NativeHeader;
