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
  Linking,
  FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { IMAGE_ASSETS, ENDPOINTS } from '../constants';
import NativeHeader from '../components/NativeHeader';
import Ticker from '../components/Ticker';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const VideosScreen = () => {
  const [rates, setRates] = useState<any>({ ticker: '' });
  const [videos, setVideos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(ENDPOINTS.RATES.LIVE);
      setRates(response.data);
      if (response.data.videos) {
        setVideos(response.data.videos.filter((v: any) => v.videoId && v.videoId.length === 11));
      } else {
        // Fallback or fetch from dedicated endpoint if needed
        const vidRes = await axios.get(ENDPOINTS.VIDEOS);
        setVideos(vidRes.data.filter((v: any) => v.videoId && v.videoId.length === 11));
      }
    } catch (error) {
       console.error('Error fetching videos:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideos();
  };

  const renderVideoItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.videoCard}
      onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${item.videoId}`)}
      activeOpacity={0.9}
    >
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg` }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play-circle" color="#fff" size={48} />
          </View>
        </View>
        
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.textOverlay}
        >
          <Text style={styles.brandText}>Abhinav Gold</Text>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground 
      source={{ uri: IMAGE_ASSETS.BG_VIDEOS }} 
      style={styles.fullBackground}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.container}>
          <NativeHeader centered />
          
          {/* Ticker */}
          <Ticker message={rates.ticker || 'Explore our latest collection and market updates...'} />

          <FlatList 
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={(item, index) => item.videoId || index.toString()}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d4af37" />
            }
            ListHeaderComponent={() => (
              <View style={styles.header}>
                 <View style={styles.youtubeIconBox}>
                   <MaterialCommunityIcons name="youtube" color="#ff0000" size={24} />
                 </View>
                 <Text style={styles.pageTitle}>Video Gallery</Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                 <Text style={styles.emptyText}>No videos available at the moment.</Text>
              </View>
            )}
            ListFooterComponent={() => <View style={{ height: 120 }} />}
          />
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
    marginTop: 10,
  },
  youtubeIconBox: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  videoCard: {
    width: '100%',
    aspectRatio: 9/16,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 25,
    backgroundColor: '#000',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  thumbnailContainer: {
    flex: 1,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    padding: 2,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#facc15',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 24,
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  }
});

export default VideosScreen;
