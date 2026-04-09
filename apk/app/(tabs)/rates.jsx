import React from 'react';
import { StyleSheet, View, Text, Image, ImageBackground, ScrollView, Dimensions, TouchableOpacity, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRates } from '../../context/RateContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const fmt = (val) => {
    if (typeof val !== 'number') return '-';
    return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export default function RatesScreen() {
    const insets = useSafeAreaInsets();
    const { displayRates, getPriceClass } = useRates();

    const getKaratClass = (key, field) => {
        const cls = getPriceClass('purities', key, field);
        if (cls === 'price-up' || cls === 'price-down') return cls;
        return 'gold-default';
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../assets/images/bg-internal.webp')} style={styles.background}>
                <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                    
                    {/* Header Image exactly like web */}
                    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 8) }]}>
                        <Image source={require('../../assets/images/mobile-rates-header.webp')} style={styles.logo} resizeMode="contain" />
                    </View>

                    <View style={styles.contentWrap}>
                        <Text style={styles.mainTitle}>Live Retail Rates with GST</Text>

                        {/* Gold Rates Table */}
                        <View style={styles.tableContainer}>
                            <LinearGradient colors={['#C2187A', '#8E0E5A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tableHeader}>
                                <Text style={[styles.thText, { flex: 1, textAlign: 'left' }]}>PURITY</Text>
                                <Text style={[styles.thText, { flex: 1, textAlign: 'right', paddingRight: 4 }]}>Gold Rates</Text>
                            </LinearGradient>
                            
                            <View style={styles.tableBody}>
                                {displayRates.ratesPagePurities.map((gold, idx) => {
                                    const gSellVal = gold?.sell !== '-' && gold?.sell !== undefined ? fmt(gold.sell) : '-';
                                    const cStyle = getKaratClass(gold.key, 'sell');
                                    const textColor = cStyle === 'price-up' ? '#4ade80' : cStyle === 'price-down' ? '#f87171' : '#facc15';

                                    return (
                                        <View key={idx} style={[styles.tableRow, idx < displayRates.ratesPagePurities.length - 1 && styles.tableRowBorder]}>
                                            <Text style={styles.tdName}>{gold.name}</Text>
                                            <Text style={[styles.tdPrice, { color: textColor }]}>
                                                {gSellVal !== '-' ? `₹${gSellVal}` : '-'}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* QR Codes - exact replica */}
                        <View style={styles.qrSection}>
                            <View style={styles.qrRow}>
                                {/* Bank QR */}
                                <View style={styles.qrBox}>
                                    <Text style={styles.qrTitle}>Bank QR</Text>
                                    <View style={styles.qrImageContainer}>
                                        <Image source={require('../../assets/images/qr-code.webp')} style={styles.qrImage} />
                                    </View>
                                    <TouchableOpacity style={styles.qrBtn} onPress={() => Linking.openURL('https://wa.me/919441055916')}>
                                        <Text style={styles.qrBtnText}>PAY NOW</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Location QR */}
                                <View style={styles.qrBox}>
                                    <Text style={styles.qrTitle}>Location QR</Text>
                                    <View style={styles.qrImageContainer}>
                                        <Image source={require('../../assets/images/qr-code (1).webp')} style={styles.qrImage} />
                                    </View>
                                    <TouchableOpacity style={styles.qrBtn} onPress={() => Linking.openURL('https://maps.app.goo.gl/xxx')}>
                                        <Text style={styles.qrBtnText}>DIRECTION</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    background: { flex: 1, ...StyleSheet.absoluteFillObject },
    headerContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', marginBottom: 16 },
    logo: { width: '100%', height: 160, maxWidth: width },
    contentWrap: { paddingHorizontal: 16, alignItems: 'center' },
    
    mainTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        textAlign: 'center',
        marginBottom: 16,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 4
    },
    
    tableContainer: {
        width: '100%',
        maxWidth: 540,
        marginBottom: 32,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    thText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
        lineHeight: 14,
        letterSpacing: 2,
    },
    tableBody: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderTopWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    tableRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    tdName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    tdPrice: {
        fontSize: 42,
        fontWeight: 'bold',
    },

    qrSection: {
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 32,
        marginTop: 12,
    },
    qrRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 40,
    },
    qrBox: {
        alignItems: 'center',
        gap: 12,
    },
    qrTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    qrImageContainer: {
        backgroundColor: '#FFF',
        padding: 8,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    qrImage: {
        width: 80,
        height: 80,
    },
    qrBtn: {
        backgroundColor: 'rgba(255,215,0,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    qrBtnText: {
        color: '#FFD700',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
    }
});
