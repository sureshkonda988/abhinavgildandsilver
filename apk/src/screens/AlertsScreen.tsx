import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ImageBackground, 
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { IMAGE_ASSETS, ENDPOINTS } from '../constants';
import NativeHeader from '../components/NativeHeader';
import Ticker from '../components/Ticker';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AlertsScreen = () => {
  const [rates, setRates] = useState<any>({ ticker: '' });
  const [news, setNews] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    try {
      const response = await axios.get(ENDPOINTS.RATES.LIVE);
      setRates(response.data);
      // If the API doesn't return news directly, we'll use fallback news from website if needed
      // But for now we try to get it from the rates object if available
      if (response.data.news) {
        setNews(response.data.news);
      } else {
        // Fallback static alerts matching website exactly
        setNews([
          {
            id: 'static-1',
            title: 'Gold Breaks $5,400 Mark',
            msg: 'Spot gold has surged past $5,400 per ounce, marking a historic intraday gain. MCX Gold futures are also trading at record highs.',
            date: '02 Mar 2026',
            type: 'urgent'
          },
          {
            id: 'static-2',
            title: 'MCX Futures Surge 3.5%',
            msg: 'Indian gold futures for April delivery climbed over ₹5,800 to trade at ₹1,67,915 per 10g. Silver futures advanced to ₹2,84,490 per kg.',
            date: '02 Mar 2026',
            type: 'urgent'
          }
        ]);
      }
    } catch (error) {
       console.error('Error fetching news:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  return (
    <ImageBackground 
      source={{ uri: IMAGE_ASSETS.BG_ALERTS }} 
      style={styles.fullBackground}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView 
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d4af37" />
          }
        >
          <NativeHeader centered />

          {/* Ticker */}
          <Ticker message={rates.ticker || 'Stay updated with live bullion news...'} />

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications" color="#d4af37" size={24} />
              </View>
              <Text style={styles.pageTitle}>Market Alerts</Text>
            </View>

            <View style={styles.alertList}>
              {news.map((alert, idx) => (
                <View key={alert.id || idx} style={styles.alertCard}>
                  <View style={[styles.glowOverlay, { opacity: 0 }]} />
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={12} color="rgba(0,0,0,0.5)" />
                        <Text style={styles.dateText}>{alert.date}</Text>
                      </View>
                    </View>
                    <View style={[styles.badge, alert.type === 'urgent' ? styles.urgentBadge : styles.infoBadge]}>
                      <Text style={[styles.badgeText, alert.type === 'urgent' ? styles.urgentText : styles.infoText]}>
                        {alert.type}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.alertMsg}>{alert.msg}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" color="#d4af37" size={32} />
              <Text style={styles.infoBoxText}>
                Stay tuned for real-time market updates and exclusive offers from Abhinav Gold & Silver.
              </Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  fullBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 30,
    justifyContent: 'center',
  },
  iconBox: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  alertList: {
    gap: 20,
  },
  alertCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 24,
    padding: 20,
    borderLeftWidth: 8,
    borderLeftColor: '#C2187A',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    maxWidth: width * 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  urgentBadge: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  infoBadge: {
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  urgentText: {
    color: '#dc2626',
  },
  infoText: {
    color: '#2563eb',
  },
  alertMsg: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    lineHeight: 20,
  },
  infoBox: {
    marginTop: 40,
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    gap: 15,
  },
  infoBoxText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  }
});

export default AlertsScreen;
