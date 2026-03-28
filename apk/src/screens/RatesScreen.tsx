import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ImageBackground, 
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  Linking
} from 'react-native';
import axios from 'axios';
import { IMAGE_ASSETS, EXTERNAL_SOURCES, BASE_URL } from '../constants';
import NativeHeader from '../components/NativeHeader';
import Ticker from '../components/Ticker';
import { LinearGradient } from 'expo-linear-gradient';
import { parseRateText } from '../utils/rateParser';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const RatesScreen = () => {
  const [rates, setRates] = useState<any>({ rtgs: [], spot: [], ratesPagePurities: [], ticker: '' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRates = async () => {
    try {
      const response = await axios.get(EXTERNAL_SOURCES.RB_GOLD_URL);
      const data = parseRateText(response.data);
      setRates(data);
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRates();
  };

  const fmt = (val: any) => {
    if (typeof val !== 'number') return '-';
    return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <ImageBackground 
      source={{ uri: IMAGE_ASSETS.BG_INTERNAL }} 
      style={styles.fullBackground}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d4af37" />
          }
        >
          <NativeHeader centered />

          {/* Rates Header Image */}
          <Image 
            source={{ uri: IMAGE_ASSETS.RATES_HEADER }} 
            style={styles.ratesHeaderImg}
            resizeMode="contain"
          />

          {/* Scrolling Ticker */}
          <Ticker message={rates.ticker || 'Loading market news...'} />

          <View style={styles.content}>
            <Text style={styles.pageTitle}>Live Retail Rates with GST</Text>

            {/* Gold Rates Table */}
            <View style={styles.tableCard}>
              <LinearGradient 
                colors={['#C2187A', '#8E0E5A']} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 0}}
                style={styles.tableHeader}
              >
                <Text style={styles.headerCellLeft}>PURITY</Text>
                <Text style={styles.headerCellCenter}>Gold Rates</Text>
                <Text style={styles.headerCellRight}>RATES</Text>
              </LinearGradient>
              
              <View style={styles.tableBody}>
                {rates.purities?.map((item: any, idx: number) => (
                  <View key={idx} style={[styles.row, idx === rates.purities.length - 1 && { borderBottomWidth: 0 }]}>
                    <Text style={styles.purityName}>{item.name}</Text>
                    <Text style={styles.purityRate}>
                      <Text style={styles.currency}>₹</Text>{item.sell !== '-' ? fmt(item.sell) : '-'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Silver Rates Table */}
            <View style={[styles.tableCard, { marginTop: 30 }]}>
              <LinearGradient 
                colors={['#1e293b', '#0f172a']} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 0}}
                style={styles.tableHeader}
              >
                <Text style={styles.headerCellLeft}>PURITY</Text>
                <Text style={styles.headerCellCenter}>Silver Rates</Text>
                <Text style={styles.headerCellRight}>RATES</Text>
              </LinearGradient>
              
              <View style={styles.tableBody}>
                <View style={[styles.row, { borderBottomWidth: 0 }]}>
                  <Text style={styles.purityName}>Silver 999 (1 KG)</Text>
                  <Text style={[styles.purityRate, { color: '#CFE9E1' }]}>
                    <Text style={styles.currency}>₹</Text>{rates.silverSell !== '-' ? fmt(rates.silverSell) : '-'}
                  </Text>
                </View>
              </View>
            </View>

            {/* QR Codes Section */}
            <View style={styles.qrSection}>
               <View style={styles.qrItem}>
                  <Text style={styles.qrLabel}>Bank QR</Text>
                  <TouchableOpacity 
                    style={styles.qrBox}
                    onPress={() => Linking.openURL('https://wa.me/919441055916')}
                  >
                    <Image source={{ uri: `${BASE_URL}/qr-code.webp` }} style={styles.qrImage} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.qrButton} onPress={() => Linking.openURL('https://wa.me/919441055916')}>
                    <Text style={styles.qrButtonText}>Pay Now</Text>
                  </TouchableOpacity>
               </View>

               <View style={styles.qrItem}>
                  <Text style={styles.qrLabel}>Location QR</Text>
                  <TouchableOpacity 
                     style={styles.qrBox}
                     onPress={() => Linking.openURL('https://maps.google.com/?daddr=Abhinav+Jewellery+Tenali')}
                  >
                    <Image source={{ uri: `${BASE_URL}/qr-code (1).webp` }} style={styles.qrImage} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.qrButton} onPress={() => Linking.openURL('https://maps.google.com/?daddr=Abhinav+Jewellery+Tenali')}>
                    <Text style={styles.qrButtonText}>Direction</Text>
                  </TouchableOpacity>
               </View>
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
  ratesHeaderImg: {
    width: width,
    height: width * 0.45,
    marginTop: -5,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  pageTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tableCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCellLeft: {
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  headerCellCenter: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  headerCellRight: {
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'right',
    letterSpacing: 1.5,
  },
  tableBody: {
    paddingVertical: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  purityName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  purityRate: {
    fontSize: 22,
    fontWeight: '900',
    color: '#facc15', // gold-500
  },
  currency: {
    fontFamily: 'System', // Inter/System
    opacity: 0.6,
  },
  qrSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 30,
  },
  qrItem: {
    alignItems: 'center',
    gap: 12,
  },
  qrLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  qrBox: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  qrButton: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  qrButtonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#facc15',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  }
});

export default RatesScreen;
