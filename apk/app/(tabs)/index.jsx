import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Image, ImageBackground, ScrollView, Animated as RNAnimated, Easing, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRates } from '../../context/RateContext';
import { RATE_DOWN_COLOR, RATE_UP_COLOR } from '../../constants/rateColors';

const { width } = Dimensions.get('window');

const fmt = (val) => {
    if (typeof val !== 'number') return '-';
    return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const { displayRates, ticker, getMarketStatus, getPriceClass } = useRates();
    const tickerScrollX = useRef(new RNAnimated.Value(0)).current;
    const [tickerWidth, setTickerWidth] = useState(0);

    const mkt = getMarketStatus();
    
    // Process RTGS similar to web removing certain Silver weights
    const rtgsFiltered = displayRates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && (item.name.toLowerCase().includes('10 kg') || item.name.toLowerCase().includes('5 kg'))));

    useEffect(() => {
        setTickerWidth(0); 
    }, [ticker]);

    useEffect(() => {
        if (tickerWidth > 0) {
            tickerScrollX.setValue(0);
            RNAnimated.loop(
                RNAnimated.timing(tickerScrollX, {
                    toValue: -tickerWidth,
                    duration: tickerWidth * 15,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [tickerWidth]);

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../assets/images/bg-home-mobile.webp')} style={styles.background}>
                <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                    
                    {/* Header Image exactly like web */}
                    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 8) }]}>
                        <Image source={require('../../assets/images/mobile-home-header.webp')} style={styles.logo} resizeMode="contain" />
                    </View>

                    {/* LIVE SPOT RATES exactly like web mobile */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.headingBox}>
                            <Text style={styles.headingText}>LIVE SPOT RATES</Text>
                            <View style={styles.headingUnderline} />
                        </View>

                        <View style={styles.tableHeadGrid}>
                            <View style={styles.th1}>
                                <View style={styles.thChip}><Text style={styles.thText}>PRODUCTS</Text></View>
                            </View>
                            <View style={styles.th2}>
                                <View style={[styles.thChip, { paddingHorizontal: 24 }]}><Text style={styles.thText}>LIVE</Text></View>
                            </View>
                            <View style={styles.th3}>
                                <View style={styles.thChip}><Text style={styles.thTextX}>STATUS</Text></View>
                            </View>
                        </View>

                        {rtgsFiltered.map((item, idx) => {
                            const pClass = getPriceClass('rtgs', item.id, 'sell');
                            const bColor = pClass === 'price-up' ? RATE_UP_COLOR : pClass === 'price-down' ? RATE_DOWN_COLOR : pClass === 'gold-default' ? '#facc15' : pClass === 'silver-default' ? '#CFE9E1' : '#0f172a';
                            const effStock = item.stock;

                            const nameParts = item.name.split('(')[0].trim();
                            const subName = item.name.match(/\((.*?)\)/)?.[1] || (item.name.toLowerCase().includes('gold') ? '10 Grams' : '30 KGS');

                            return (
                                <View key={idx} style={styles.trBox}>
                                    <View style={styles.trGrid}>
                                        <View style={styles.td1}>
                                            <Text style={styles.tdName}>{nameParts}</Text>
                                            <Text style={styles.tdSub}>{subName}</Text>
                                        </View>
                                        <View style={styles.td2}>
                                            <View style={[styles.priceBox, { backgroundColor: bColor }]}>
                                                <Text style={styles.priceText}>{item.sell !== '-' ? `₹${fmt(item.sell * (item.factor || 1))}` : '—'}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.td3}>
                                            <View style={[styles.statusBox, effStock ? styles.statusInStock : styles.statusOut]}>
                                                <MaterialCommunityIcons name={effStock ? "check" : "minus"} size={20} color={effStock ? "#1c7c3c" : "#dc2626"} />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Scrolling Ticker exactly like web */}
                    <View style={styles.tickerContainer}>
                        <ImageBackground source={require('../../assets/images/bg-ticker.webp')} style={styles.tickerImage} resizeMode="cover">
                            <View style={styles.tickerContentOverlay}>
                                <RNAnimated.View style={[styles.tickerScrollContainer, { transform: [{ translateX: tickerScrollX }] }]}>
                                    <Text
                                        style={styles.tickerText}
                                        onLayout={(e) => {
                                            const w = e.nativeEvent.layout.width;
                                            if (tickerWidth === 0 && w > 0) setTickerWidth(w);
                                        }}
                                        numberOfLines={1}
                                    >
                                        {ticker}
                                    </Text>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Text key={i} style={styles.tickerText} numberOfLines={1}>
                                            {ticker}
                                        </Text>
                                    ))}
                                </RNAnimated.View>
                            </View>
                        </ImageBackground>
                    </View>

                    {/* Market Status exactly like web mobile */}
                    <View style={styles.marketStatusWrap}>
                        <View style={[styles.marketBox, mkt.isOpen ? styles.marketBoxOpen : styles.marketBoxClosed]}>
                            <View style={styles.marketRow}>
                                <View style={styles.marketDot} />
                                <Text style={styles.marketMsg}>{mkt.message || mkt.text}</Text>
                            </View>
                            <Text style={styles.marketTime}>{mkt.timings} (IST)</Text>
                        </View>
                    </View>

                    {/* LOCAL GOLD AND SILVER RETAIL RATES exactly like web mobile */}
                    <View style={[styles.sectionContainer, { marginTop: 24 }]}>
                        <View style={styles.headingBox}>
                            <Text style={styles.headingText}>LOCAL GOLD AND SILVER RETAIL RATES</Text>
                            <View style={styles.headingUnderline} />
                        </View>

                        <View style={styles.table2HeadGrid}>
                            <View style={styles.th2_1}><View style={styles.thChip}><Text style={styles.thText8}>PRODUCTS</Text></View></View>
                            <View style={styles.th2_2}><View style={styles.thChip}><Text style={styles.thText8}>BUY</Text></View></View>
                            <View style={styles.th2_2}><View style={styles.thChip}><Text style={styles.thText8}>SELL</Text></View></View>
                            <View style={styles.th2_2}><View style={styles.thChip}><Text style={styles.thText8}>HI/LO</Text></View></View>
                        </View>

                        {[
                            displayRates.rtgs.find(r => r.id === '945') || { name: 'Gold 999 (10 Grams)', bid: '-', ask: '-', high: '-', low: '-', id: 'gold_default' },
                            displayRates.rtgs.find(r => r.id === '2987' || r.name.toLowerCase().includes('silver')) || { name: 'Silver 999 (1 KG)', bid: '-', ask: '-', high: '-', low: '-', id: 'silver_1_default' }
                        ].map((item, idx) => {
                            const lookupId = item.id;
                            const buyClass = getPriceClass('rtgs', lookupId, 'buy');
                            const sellClass = getPriceClass('rtgs', lookupId, 'sell');
                            const isSilver = item.name.toLowerCase().includes('silver');
                            const defColor = isSilver ? '#CFE9E1' : '#facc15';
                            
                            const buyColor = buyClass === 'price-up' ? RATE_UP_COLOR : buyClass === 'price-down' ? RATE_DOWN_COLOR : defColor;
                            const sellColor = sellClass === 'price-up' ? RATE_UP_COLOR : sellClass === 'price-down' ? RATE_DOWN_COLOR : defColor;

                            const nameParts = item.name.split('(')[0].trim();

                            return (
                                <View key={idx} style={styles.trBox}>
                                    <View style={styles.tr2Grid}>
                                        <View style={styles.td2_1}>
                                            <Text style={styles.td2Name}>{nameParts}</Text>
                                            <Text style={styles.td2Sub}>{isSilver ? '1 KG' : '10 GRAMS'}</Text>
                                        </View>
                                        <View style={styles.td2_2}>
                                            <View style={[styles.price2Box, { backgroundColor: buyColor }]}>
                                                <Text style={styles.price2Text}>{item.bid !== '-' ? `₹${fmt(item.bid)}` : '—'}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.td2_2}>
                                            <View style={[styles.price2Box, { backgroundColor: sellColor }]}>
                                                <Text style={styles.price2Text}>{item.ask !== '-' ? `₹${fmt(item.ask)}` : '—'}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.td2_2}>
                                            <View style={styles.hiloBox}>
                                                <View style={styles.hiRow}>
                                                    <Text style={styles.hiLbl}>HI</Text>
                                                    <Text style={styles.hiVal}>{item.high !== '-' ? `₹${fmt(item.high)}` : '—'}</Text>
                                                </View>
                                                <View style={styles.loRow}>
                                                    <Text style={styles.loLbl}>LO</Text>
                                                    <Text style={styles.loVal}>{item.low !== '-' ? `₹${fmt(item.low)}` : '—'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                </ScrollView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    background: { flex: 1, ...StyleSheet.absoluteFillObject },
    headerContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', marginBottom: 4 },
    logo: { width: '100%', height: 180, maxWidth: width },
    sectionContainer: { paddingHorizontal: 4, marginTop: 4 },
    headingBox: { alignItems: 'center', marginBottom: 12 },
    headingText: { fontSize: 16, fontWeight: '900', color: '#8E0E5A', textAlign: 'center', letterSpacing: 1 },
    headingUnderline: { height: 2, width: '100%', backgroundColor: '#fbcfe8', marginTop: 2, alignSelf: 'center' },
    
    tableHeadGrid: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
    th1: { flex: 0.8, alignItems: 'center' },
    th2: { flex: 1.5, alignItems: 'center' },
    th3: { width: 60, alignItems: 'center' },
    thChip: { borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: 'transparent' },
    thText: { fontSize: 9, fontWeight: '900', color: '#0f172a', letterSpacing: 1 },
    thTextX: { fontSize: 8, fontWeight: '900', color: '#0f172a', letterSpacing: 1 },

    trBox: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, paddingVertical: 16, marginBottom: 8 },
    trGrid: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
    td1: { flex: 0.8, alignItems: 'flex-start', paddingLeft: 4 },
    tdName: { fontSize: 14, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
    tdSub: { fontSize: 9, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginTop: 2 },
    td2: { flex: 1.5, alignItems: 'center', paddingHorizontal: 2 },
    priceBox: { borderWidth: 1.5, borderColor: '#000', borderRadius: 14, width: '100%', paddingVertical: 16, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity: 0.3 },
    priceText: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
    td3: { width: 60, alignItems: 'center' },
    statusBox: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    statusInStock: { backgroundColor: '#e6f9ec', borderColor: 'rgba(28,124,60,0.3)' },
    statusOut: { backgroundColor: '#fef2f2', borderColor: 'rgba(239,68,68,0.2)' },

    table2HeadGrid: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 2, gap: 4 },
    th2_1: { flex: 1, alignItems: 'flex-start', paddingLeft: 4 },
    th2_2: { flex: 1.2, alignItems: 'center' },
    thText8: { fontSize: 8, fontWeight: '900', color: '#0f172a', letterSpacing: 1 },
    tr2Grid: { flexDirection: 'row', alignItems: 'stretch', paddingHorizontal: 2, gap: 4 },
    td2_1: { flex: 1, justifyContent: 'center', paddingLeft: 4 },
    td2Name: { fontSize: 13, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
    td2Sub: { fontSize: 8, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginTop: 2 },
    td2_2: { flex: 1.2, justifyContent: 'center' },
    price2Box: { borderWidth: 1.5, borderColor: '#000', borderRadius: 12, width: '100%', paddingVertical: 16, alignItems: 'center', elevation: 4 },
    price2Text: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
    hiloBox: { borderWidth: 1.5, borderColor: '#38bdf8', borderRadius: 12, backgroundColor: '#bae6fd', flex: 1, minHeight: 70 },
    hiRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
    loRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
    hiLbl: { fontSize: 7, fontWeight: '900', color: '#16a34a' },
    hiVal: { fontSize: 14, fontWeight: '900', color: '#16a34a' },
    loLbl: { fontSize: 7, fontWeight: '900', color: '#dc2626' },
    loVal: { fontSize: 14, fontWeight: '900', color: '#dc2626' },

    tickerContainer: { width: '100%', alignItems: 'center', marginTop: 16 },
    tickerImage: { width: '100%', height: 40, justifyContent: 'center', overflow: 'hidden' },
    tickerContentOverlay: { flex: 1, justifyContent: 'center' },
    tickerScrollContainer: { flexDirection: 'row', position: 'absolute', left: 0, width: 10000 },
    tickerText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 2, textAlignVertical: 'center' },

    marketStatusWrap: { alignItems: 'center', marginTop: 24, paddingHorizontal: 16 },
    marketBox: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', width: '100%', maxWidth: 400, elevation: 4 },
    marketBoxOpen: { backgroundColor: '#22c55e', borderColor: '#000' },
    marketBoxClosed: { backgroundColor: '#ef4444', borderColor: '#000' },
    marketRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    marketDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
    marketMsg: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
    marketTime: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 3, marginTop: 4 }
});
