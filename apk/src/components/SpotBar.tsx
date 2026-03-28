import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

interface SpotRate {
  id: string;
  name: string;
  bid: number | string;
  ask: number | string;
  high: number | string;
  low: number | string;
}

interface SpotBarProps {
  rates: {
    spot?: SpotRate[];
  };
}

const { width } = Dimensions.get('window');

const SpotBar = ({ rates }: SpotBarProps) => {
  const fmt = (val: any) => {
    if (typeof val !== 'number') return '-';
    return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const gold = rates?.spot?.[0] || { bid: '-', ask: '-', name: 'GOLD', high: '-', low: '-' };
  const silver = rates?.spot?.[1] || { bid: '-', ask: '-', name: 'SILVER', high: '-', low: '-' };
  const inr = rates?.spot?.[2] || { bid: '-', ask: '-', name: 'USD/INR', high: '-', low: '-' };

  const items = [
    { label: 'USD-INR (₹)', value: fmt(inr.ask), h: fmt(inr.high), l: fmt(inr.low), symbol: '₹', type: 'inr' },
    { label: 'GOLD ($)', value: fmt(gold.ask), h: fmt(gold.high), l: fmt(gold.low), symbol: '$', type: 'gold' },
    { label: 'SILVER ($)', value: fmt(silver.ask), h: fmt(silver.high), l: fmt(silver.low), symbol: '$', type: 'silver' }
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, idx) => {
          // Simplified color logic matching the website's default look
          const bColor = item.type === 'inr' ? '#f8fafc' : item.type === 'gold' ? '#facc15' : '#E5E5E5';
          
          return (
            <View key={idx} style={styles.itemWrapper}>
              <Text style={styles.label}>{item.label}</Text>
              <View style={[styles.card, { backgroundColor: bColor }]}>
                <View style={styles.valueRow}>
                  <Text style={styles.symbol}>{item.symbol}</Text>
                  <Text style={styles.value}>{item.value}</Text>
                </View>
                <View style={[styles.hiLoRow, { backgroundColor: '#bae6fd', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4, width: '100%', justifyContent: 'center' }]}>
                  <Text style={[styles.hiLoText, { color: '#16a34a' }]}>H:{item.h}</Text>
                  <View style={[styles.divider, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />
                  <Text style={[styles.hiLoText, { color: '#dc2626' }]}>L:{item.l}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  itemWrapper: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  symbol: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.6)',
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  hiLoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    opacity: 0.5,
  },
  hiLoText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#000',
  },
  divider: {
    width: 1,
    height: 8,
    backgroundColor: '#000',
    marginHorizontal: 4,
    opacity: 0.3,
  }
});

export default SpotBar;
