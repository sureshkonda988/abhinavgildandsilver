import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, ImageBackground } from 'react-native';

const { width } = Dimensions.get('window');

interface TickerProps {
  message: string;
}

const Ticker = ({ message }: TickerProps) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      scrollX.setValue(0);
      Animated.timing(scrollX, {
        toValue: -width, // Move by width
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => startAnimation());
    };

    startAnimation();
  }, [message]);

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: 'https://abhinavgildandsilver-git-main-sureshs-projects-386c3552.vercel.app/bg-ticker.webp' }}
        style={styles.bg}
        resizeMode="repeat"
      >
        <Animated.View 
          style={[
            styles.tickerWrapper, 
            { transform: [{ translateX: scrollX }] }
          ]}
        >
          <View style={styles.textGroup}>
            <Text style={styles.tickerText}>
               <Text style={styles.star}>✦</Text> {message}
            </Text>
            <View style={{ width: 50 }} />
            <Text style={styles.tickerText}>
               <Text style={styles.star}>✦</Text> {message}
            </Text>
          </View>
          {/* Duplicate for seamless loop might need more logic for varying text lengths, 
              but for mobile width, this is a good start. */}
          <View style={styles.textGroup}>
            <Text style={styles.tickerText}>
               <Text style={styles.star}>✦</Text> {message}
            </Text>
            <View style={{ width: 50 }} />
            <Text style={styles.tickerText}>
               <Text style={styles.star}>✦</Text> {message}
            </Text>
          </View>
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 35,
    width: '100%',
    backgroundColor: '#90034a',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  bg: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  tickerWrapper: {
    flexDirection: 'row',
  },
  textGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tickerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  star: {
    color: '#facc15',
    fontSize: 16,
  }
});

export default Ticker;
