import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { BASE_URL, ENDPOINTS, EXTERNAL_SOURCES } from './src/constants';

import { DEFAULT_SITE_URL } from './src/constants';

const STORAGE_KEY = 'abhanav.siteUrl.v1';

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [siteUrl, setSiteUrl] = useState(DEFAULT_SITE_URL);
  const [editingUrl, setEditingUrl] = useState(DEFAULT_SITE_URL);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [nativeRates, setNativeRates] = useState<any>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const normalized = normalizeUrl(stored);
        if (normalized) {
          setSiteUrl(normalized);
          setEditingUrl(normalized);
        }
      }
    })();
    fetchNativeRates();
  }, []);

  const fetchNativeRates = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.RATES.LIVE}?_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setNativeRates(data);
      }
    } catch (e) {
      console.warn('Native fetch failed:', e);
    }
  };

  const source = useMemo(() => ({ uri: siteUrl }), [siteUrl]);

  const handleRetry = () => {
    setHasError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  const openInBrowser = async () => {
    await Linking.openURL(siteUrl);
  };

  const openUrlEditor = () => {
    setEditingUrl(siteUrl);
    setShowUrlModal(true);
  };

  const saveUrl = async () => {
    const normalized = normalizeUrl(editingUrl);
    if (!normalized) return;
    await AsyncStorage.setItem(STORAGE_KEY, normalized);
    setSiteUrl(normalized);
    setHasError(false);
    setShowUrlModal(false);
    setLoading(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={source}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onHttpError={() => {
          setHasError(true);
          setLoading(false);
        }}
        onError={() => {
          setHasError(true);
          setLoading(false);
        }}
        onShouldStartLoadWithRequest={(req) => {
          // Keep external links outside the app (WhatsApp, YouTube, Maps, etc)
          const url = req.url ?? '';
          const allowed = siteUrl.replace(/\/+$/, '');
          if (url.startsWith(allowed)) return true;
          if (url.startsWith('http')) {
            Linking.openURL(url).catch(() => {});
            return false;
          }
          return true;
        }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />

      <View pointerEvents="box-none" style={styles.fabContainer}>
        <Pressable onPress={openUrlEditor} style={styles.fab}>
          <Text style={styles.fabText}>URL</Text>
        </Pressable>
        <Pressable onPress={() => setShowInfo(true)} style={[styles.fab, { marginTop: 8 }]}>
          <Text style={styles.fabText}>API</Text>
        </Pressable>
      </View>

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
            Current URL:
            {'\n'}
            {siteUrl}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={handleRetry} style={styles.button}>
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
            <Pressable onPress={openInBrowser} style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.buttonText}>Open in Browser</Text>
            </Pressable>
            <Pressable onPress={openUrlEditor} style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.buttonText}>Change URL</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Modal
        transparent
        visible={showUrlModal}
        animationType="fade"
        onRequestClose={() => setShowUrlModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Website URL</Text>
            <Text style={styles.modalHint}>
              Paste your deployed site URL (or your local dev server URL reachable from your phone).
            </Text>
            <TextInput
              value={editingUrl}
              onChangeText={setEditingUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="https://your-site.com"
              placeholderTextColor="#999"
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setShowUrlModal(false)} style={[styles.button, styles.secondaryButton]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveUrl} style={styles.button}>
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={showInfo}
        animationType="slide"
        onRequestClose={() => setShowInfo(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Backend & API Status</Text>
            
            <View style={styles.infoScroll}>
              <Text style={styles.infoLabel}>Base URL:</Text>
              <Text style={styles.infoValue}>{BASE_URL}</Text>
              
              <Text style={styles.infoLabel}>Rate Source:</Text>
              <Text style={styles.infoValue}>{EXTERNAL_SOURCES.TEMPLATE_ID} (rbgold)</Text>

              <Text style={styles.infoLabel}>Native Sync:</Text>
              <Text style={styles.infoValue}>
                {nativeRates ? `Last Update: ${new Date(nativeRates.timestamp).toLocaleTimeString()}` : 'Fetching...'}
              </Text>
              
              {nativeRates && (
                <View style={styles.ratesPreview}>
                   <Text style={styles.rateText} numberOfLines={3}>
                     {nativeRates.text.substring(0, 150)}...
                   </Text>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <Pressable onPress={fetchNativeRates} style={[styles.button, styles.secondaryButton]}>
                <Text style={styles.buttonText}>Refresh API</Text>
              </Pressable>
              <Pressable onPress={() => setShowInfo(false)} style={styles.button}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  fabContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-start'
  },
  fab: {
    marginTop: 12,
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5
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
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center'
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 18
  },
  modalCard: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  modalHint: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 12
  },
  input: {
    backgroundColor: '#0b0b0b',
    color: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },
  infoScroll: {
    marginVertical: 12,
    maxHeight: 300
  },
  infoLabel: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textTransform: 'uppercase'
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4
  },
  ratesPreview: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  rateText: {
    color: '#d4af37',
    fontSize: 12,
    fontFamily: 'monospace'
  }
});

