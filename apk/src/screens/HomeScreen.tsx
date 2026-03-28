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
  TouchableOpacity
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { IMAGE_ASSETS, EXTERNAL_SOURCES } from '../constants';
import NativeHeader from '../components/NativeHeader';
import SpotBar from '../components/SpotBar';
import { parseRateText } from '../utils/rateParser';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [rates, setRates] = useState<any>({ rtgs: [], spot: [] });
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
      source={{ uri: IMAGE_ASSETS.BG_HOME }} 
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
          <NativeHeader />

          {/* Hero Header Image */}
          <Image 
            source={{ uri: IMAGE_ASSETS.HOME_HEADER }} 
            style={styles.heroHeaderImg}
            resizeMode="contain"
          />

          {/* Spot Bar Section */}
          <View style={styles.spotBarSection}>
            <SpotBar rates={rates} />
            
            {/* Decorative Ornament - Positioned like website */}
            <Image 
              source={{ uri: IMAGE_ASSETS.DECORATIVE_ORNAMENT }} 
              style={styles.ornament}
              resizeMode="contain"
            />
          </View>

          {/* Live Spot Rates Table */}
          <View style={styles.tableSection}>
            <Text style={styles.tableHeading}>LIVE SPOT RATES</Text>
            <View style={styles.tableHeaderRow}>
               <View style={styles.headerBox}><Text style={styles.headerText}>PRODUCTS</Text></View>
               <View style={styles.headerBox}><Text style={styles.headerText}>LIVE</Text></View>
               <View style={styles.headerBox}><Text style={styles.headerText}>STATUS</Text></View>
            </View>

            {rates.rtgs?.filter((item: any) => !(item.name.toLowerCase().includes('silver') && (item.name.toLowerCase().includes('10 kg') || item.name.toLowerCase().includes('5 kg')))).map((item: any, idx: number) => (
              <View key={idx} style={styles.row}>
                <View style={styles.productCol}>
                  <Text style={styles.productName}>{item.name.split('(')[0]}</Text>
                  <Text style={styles.productSub}>
                    {item.name.match(/\((.*?)\)/)?.[1] || (item.name.toLowerCase().includes('gold') ? '100 Grams' : '30 KGS')}
                  </Text>
                </View>
                
                <View style={styles.priceCol}>
                  <View style={[styles.priceBox, { backgroundColor: item.name.toLowerCase().includes('gold') ? '#facc15' : '#CFE9E1' }]}>
                    <Text style={styles.priceText}>
                      {item.sell !== '-' ? `₹${fmt(item.sell * (item.factor || 1))}` : '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusCol}>
                  <View style={[styles.statusCircle, item.stock ? styles.inStock : styles.outOfStock]}>
                     {item.stock ? <Ionicons name="checkmark" size={20} color="#1c7c3c" /> : <MaterialCommunityIcons name="minus" size={20} color="#dc2626" />}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Market Status Box */}
          <View style={styles.marketStatusContainer}>
            <View style={[styles.marketBox, rates.market?.isOpen ? styles.marketOpen : styles.marketClosed]}>
              <View style={styles.marketStatusRow}>
                <View style={[styles.pulseDot, rates.market?.isOpen && styles.activePulse]} />
                <Text style={styles.marketStatusText}>
                  {rates.market?.message || (rates.market?.isOpen ? 'MARKET IS OPEN' : 'MARKET IS CLOSED')}
                </Text>
              </View>
              <Text style={styles.marketTimings}>
                {rates.market?.timings || '10:00 AM - 09:00 PM'} (IST)
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
  heroHeaderImg: {
    width: width,
    height: width * 0.4, // Aspect ratio matching mobile-home-header
    marginTop: -10,
  },
  spotBarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 60, // Space for ornament
  },
  ornament: {
    position: 'absolute',
    right: -10,
    top: 0,
    width: 80,
    height: 80,
    transform: [{ scaleX: -1 }],
  },
  tableSection: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  tableHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8E0E5A', // magenta-700
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 1.5,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(142,14,90,0.1)',
    paddingBottom: 4,
    width: '60%',
    alignSelf: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  headerBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  productCol: {
    flex: 1.2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  productSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#666',
    marginTop: 2,
  },
  priceCol: {
    flex: 1.5,
    alignItems: 'center',
  },
  priceBox: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  statusCol: {
    flex: 0.6,
    alignItems: 'flex-end',
  },
  statusCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  inStock: {
    backgroundColor: '#e6f9ec',
    borderColor: 'rgba(28,124,60,0.3)',
  },
  outOfStock: {
    backgroundColor: '#fef2f2',
    borderColor: 'rgba(220,38,38,0.2)',
  },
  marketStatusContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  marketBox: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  marketOpen: {
    backgroundColor: '#22c55e',
  },
  marketClosed: {
    backgroundColor: '#ef4444',
  },
  marketStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  activePulse: {
    // Note: React Native animation would be needed for true pulse
  },
  marketStatusText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  marketTimings: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 2,
    opacity: 0.8,
  }
});

export default HomeScreen;
