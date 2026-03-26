import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Assuming the default Vercel URL based on the folder name. Replace with actual URL if different. */}
      <WebView 
        source={{ uri: 'https://abhinavgildandsilver-7f7fr3ydq-sureshs-projects-386c3552.vercel.app' }} 
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
