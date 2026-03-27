import * as Linking from 'expo-linking';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { BASE_URL as SITE_URL } from '../src/constants';

export default function HomeScreen() {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const source = useMemo(() => ({ uri: SITE_URL }), []);

  const handleRetry = () => {
    setHasError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  const openInBrowser = async () => {
    await Linking.openURL(SITE_URL);
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={source}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setHasError(true);
          setLoading(false);
        }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />

      {loading && !hasError && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#d4af37" />
          <Text style={styles.overlayText}>Loading website...</Text>
        </View>
      )}

      {hasError && (
        <View style={styles.overlay}>
          <Text style={styles.errorTitle}>Unable to load website</Text>
          <Text style={styles.errorText}>
            Check your internet connection or update SITE_URL in app/index.tsx.
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={handleRetry} style={styles.button}>
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
            <Pressable onPress={openInBrowser} style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.buttonText}>Open in Browser</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  webview: {
    flex: 1
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 24
  },
  overlayText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10
  },
  errorText: {
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14
  },
  actions: {
    flexDirection: 'row',
    gap: 10
  },
  button: {
    backgroundColor: '#d4af37',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  secondaryButton: {
    backgroundColor: '#555'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});
