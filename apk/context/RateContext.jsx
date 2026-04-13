import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const RateContext = createContext();

const API_BASE = 'https://www.abhinavgoldandsilver.com/api';

const INITIAL_SPOT_CONFIG = [
    { id: '3101', name: 'GOLD ($)' },
    { id: '3107', name: 'SILVER ($)' },
    { id: '3103', name: 'USD-INR (₹)' }
];

const INITIAL_RTGS_CONFIG = [
    { id: '945', name: 'Gold 999 (100 grams)', factor: 10 },
    { id: '2966', name: 'Silver 999 (30 KGS)', factor: 1 },
    { id: '2987', name: 'Silver 999 (5 KGS)', factor: 1 }
];

const getPlaceholders = () => ({
    spot: INITIAL_SPOT_CONFIG.map(it => ({ ...it, bid: '-', ask: '-', high: '-', low: '-', stock: false })),
    rtgs: INITIAL_RTGS_CONFIG.map(it => ({ ...it, buy: '-', sell: '-', stock: false }))
});

export const RateProvider = ({ children }) => {
    const [rawRates, setRawRates] = useState(getPlaceholders());
    const [loading, setLoading] = useState(true);
    const [priceChangeMap, setPriceChangeMap] = useState({});
    const previousRatesPageValuesRef = useRef({});
    const ratesPageTrendRef = useRef({});
    const ratesPagePulseRef = useRef({ dir: 'neutral', expiry: 0 });
    const rtgsPulseRef = useRef({});
    
    // Website specific state ported:
    const getInitialAdj = () => ({
        gold: { mode: 'amount', value: 0 },
        silver: { mode: 'amount', value: 0 },
        baseModifications: {
            gold999: { mode: 'amount', value: 0 },
            silver999: { mode: 'amount', value: 0 }
        },
        stockOverrides: {},
        ratesPage: {
            gold: { mode: 'amount', value: 0 },
            silver: { mode: 'amount', value: 0 },
            showModified: false
        },
        marketStatus: {
            mode: 'regular',
            modifiedStatus: 'open',
            openTime: '10:00',
            closeTime: '20:00'
        }
    });

    const [adj, setAdjState] = useState(getInitialAdj());
    const adjRef = useRef(getInitialAdj());
    const [ticker, setTicker] = useState('Welcome to Abhinav Gold & Silver - Quality Purity Guaranteed');

    const setAdj = (newAdj) => {
        adjRef.current = newAdj;
        setAdjState(newAdj);
    };

    const syncSettingsWithMongoDB = async () => {
        try {
            const res = await axios.get(`${API_BASE}/rates/settings?_=${Date.now()}`);
            if (res.data) {
                setAdj({
                    ...getInitialAdj(),
                    ...res.data
                });
                if (res.data.ticker) setTicker(res.data.ticker);
            }
        } catch (error) {
            console.error("Failed to sync settings from MongoDB in App:", error);
        }
    };

    const fetchLiveRates = async () => {
        let xmlText = '';
        let backendRates = null;

        try {
            // Use their own production Node.js backend to bypass SSL/CORS constraints reliably
            const res = await axios.get(`${API_BASE}/rates/live?_=${Date.now()}`, { timeout: 4000 });
            if (res.data && res.data.text) {
                xmlText = res.data.text;
                // Preferred source for synchronized values:
                // backend-calculated map expected as: { [id]: { rate, high, low } }
                backendRates = res.data.rates || null;
            } else if (typeof res.data === 'string' && res.data.includes('<RateDetails>')) {
                xmlText = res.data;
            }
        } catch (error) {
            console.log("Primary backend fetch failed, retrying on next tick...");
            setLoading(false);
            return;
        }

        if (!xmlText) {
            setLoading(false);
            return;
        }

        try {
            // Native XML parse via regex since DOMParser isn't in React Native natively
            const items = [...xmlText.matchAll(/<RateDetails>(.*?)<\/RateDetails>/gs)];
            
            let newSpot = [];
            let newRtgs = [];
            
            const getApiValues = (id) => {
                const row = backendRates && backendRates[id] ? backendRates[id] : null;
                if (!row) return null;
                const rate = Number(row.rate);
                const high = Number(row.high);
                const low = Number(row.low);
                return {
                    rate: Number.isFinite(rate) ? rate : null,
                    high: Number.isFinite(high) ? high : null,
                    low: Number.isFinite(low) ? low : null,
                };
            };

            items.forEach(match => {
                const itemXml = match[1];
                const id = (itemXml.match(/<SymbolId>(.*?)<\/SymbolId>/) || [])[1];
                const bid = (itemXml.match(/<Bid>(.*?)<\/Bid>/) || [])[1];
                const ask = (itemXml.match(/<Ask>(.*?)<\/Ask>/) || [])[1];
                const apiVals = getApiValues(id);

                const spotConf = INITIAL_SPOT_CONFIG.find(c => c.id === id);
                if (spotConf) newSpot.push({ 
                    ...spotConf, 
                    bid, 
                    ask: apiVals?.rate != null ? String(apiVals.rate) : ask,
                    high: apiVals?.high != null ? String(apiVals.high) : '-',
                    low: apiVals?.low != null ? String(apiVals.low) : '-',
                    stock: adjRef.current.stockOverrides?.[id] || false 
                });
                
                const rtgsConf = INITIAL_RTGS_CONFIG.find(c => c.id === id);
                if (rtgsConf) newRtgs.push({ 
                    ...rtgsConf, 
                    buy: bid,
                    sell: apiVals?.rate != null ? String(apiVals.rate) : ask,
                    high: apiVals?.high != null ? apiVals.high : 0,
                    low: apiVals?.low != null ? apiVals.low : 0,
                    stock: adjRef.current.stockOverrides?.[id] || false 
                });
            });
            
            if (newSpot.length || newRtgs.length) {
                const nextPriceMap = {};
                setRawRates(prev => {
                    const nextSpot = newSpot.length ? newSpot : prev.spot;
                    const nextRtgs = newRtgs.length ? newRtgs : prev.rtgs;
                    const toNum = (val) => {
                        const num = Number.parseFloat(val);
                        return Number.isFinite(num) ? num : null;
                    };
                    nextRtgs.forEach((nextItem) => {
                        const prevItem = prev.rtgs.find((r) => r.id === nextItem.id);
                        if (!prevItem) return;
                        const prevBuy = toNum(prevItem.buy);
                        const nextBuy = toNum(nextItem.buy);
                        const prevSellRow = toNum(prevItem.sell);
                        const nextSellRow = toNum(nextItem.sell);
                        const now = Date.now();
                        const applyPulse = (key, instantDir) => {
                            const prevPulse = rtgsPulseRef.current[key] || { dir: 'neutral', expiry: 0 };
                            let dir = prevPulse.dir;
                            let expiry = prevPulse.expiry;
                            if (instantDir === 'up' || instantDir === 'down') {
                                dir = instantDir;
                                expiry = now + 5000;
                            } else if (now > expiry) {
                                dir = 'neutral';
                                expiry = 0;
                            }
                            rtgsPulseRef.current[key] = { dir, expiry };
                            return dir;
                        };
                        if (prevBuy !== null && nextBuy !== null) {
                            const instant = nextBuy > prevBuy ? 'up' : nextBuy < prevBuy ? 'down' : 'neutral';
                            nextPriceMap[`rtgs-${nextItem.id}-buy`] = applyPulse(`rtgs-${nextItem.id}-buy`, instant);
                        }
                        if (prevSellRow !== null && nextSellRow !== null) {
                            const instant = nextSellRow > prevSellRow ? 'up' : nextSellRow < prevSellRow ? 'down' : 'neutral';
                            nextPriceMap[`rtgs-${nextItem.id}-sell`] = applyPulse(`rtgs-${nextItem.id}-sell`, instant);
                        }
                    });

                    const prevGold999 = prev.rtgs.find(r => r.id === '945' || r.name?.toLowerCase().includes('gold 999'));
                    const nextGold999 = nextRtgs.find(r => r.id === '945' || r.name?.toLowerCase().includes('gold 999'));
                    const prevSell = Number.parseFloat(prevGold999?.sell);
                    const nextSell = Number.parseFloat(nextGold999?.sell);

                    let dir = 'neutral';
                    if (Number.isFinite(prevSell) && Number.isFinite(nextSell)) {
                        if (nextSell > prevSell) dir = 'up';
                        else if (nextSell < prevSell) dir = 'down';
                    }
                    const now = Date.now();
                    let pulseDir = ratesPagePulseRef.current.dir;
                    let pulseExpiry = ratesPagePulseRef.current.expiry;
                    if (dir === 'up' || dir === 'down') {
                        pulseDir = dir;
                        pulseExpiry = now + 5000;
                    } else if (now > pulseExpiry) {
                        pulseDir = 'neutral';
                        pulseExpiry = 0;
                    }
                    ratesPagePulseRef.current = { dir: pulseDir, expiry: pulseExpiry };

                    ['24K', '22K', '18K', '14K'].forEach((key) => {
                        nextPriceMap[`purities-${key}-sell`] = pulseDir;
                    });
                    nextPriceMap['navarsu-navarsu-sell'] = pulseDir;

                    return {
                        spot: nextSpot,
                        rtgs: nextRtgs
                    };
                });
                setPriceChangeMap(nextPriceMap);
            }
        } catch (error) {
            console.error("Rate fetching error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        let timeoutId;

        const loopFetch = async () => {
            if (!active) return;
            await fetchLiveRates();
            if (active) timeoutId = setTimeout(loopFetch, 1000);
        };

        syncSettingsWithMongoDB();
        loopFetch();

        const settingsPoller = setInterval(syncSettingsWithMongoDB, 5000); // 5 sec sync
        return () => {
            active = false;
            clearTimeout(timeoutId);
            clearInterval(settingsPoller);
        };
    }, []);

    const processRate = (val, mod) => {
        if (!val || val === '-' || isNaN(val)) return val;
        let v = parseFloat(val);
        if (mod && mod.value !== 0) {
            if (mod.mode === 'amount') v += parseFloat(mod.value);
            else if (mod.mode === 'percent') v += v * (parseFloat(mod.value) / 100);
        }
        return Math.floor(v).toString();
    };

    const getMarketStatus = () => {
        const config = adj.marketStatus;
        if (!config) return { isOpen: true, text: 'Market Open', message: 'Market Open', timings: 'Open 10 AM Closed 8 PM' };

        const now = new Date();
        
        // Check if it's Sunday in Indian Standard Time
        const istDay = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            weekday: 'short',
        }).format(now);
        
        if (istDay === 'Sun') {
            return {
                isOpen: false,
                text: 'Market Closed (Sunday)',
                message: 'Market Closed (Sunday)',
                timings: 'Opens Monday 10:00 AM',
                type: 'closed'
            };
        }

        const istTime = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(now);

        const [hours, minutes] = istTime.split(':').map(Number);
        const currentMinutes = hours * 60 + minutes;

        const formatTime = (t) => {
            if (!t) return '';
            const [h, m] = t.split(':').map(Number);
            const suffix = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
        };

        if (config.mode === 'modified') {
            const [oH, oM] = (config.openTime || '10:00').split(':').map(Number);
            const [cH, cM] = (config.closeTime || '20:00').split(':').map(Number);
            const openMin = oH * 60 + oM;
            const closeMin = cH * 60 + cM;

            const timeRangeOpen = currentMinutes >= openMin && currentMinutes < closeMin;
            const isOpen = config.modifiedStatus === 'open' && timeRangeOpen;

            return {
                isOpen,
                text: isOpen ? 'Market Open' : 'Market Closed',
                message: isOpen ? 'Market Open' : 'Market Closed',
                timings: `Open ${formatTime(config.openTime)} Closed ${formatTime(config.closeTime)}`,
                type: isOpen ? 'open' : 'closed'
            };
        } else {
            // Regular Mode: Hardcoded 10:00 AM to 08:00 PM as per website
            const isOpen = currentMinutes >= 600 && currentMinutes < 1200;
            return {
                isOpen,
                text: isOpen ? 'Market Open' : 'Market Closed',
                message: isOpen ? 'Market Open' : 'Market Closed',
                timings: 'Open 10:00 AM Closed 08:00 PM',
                type: isOpen ? 'open' : 'closed'
            };
        }
    };

    const getPriceClass = (section, id, field) => {
        const trendKey = `${section}-${id}-${field}`;
        const dir = priceChangeMap[trendKey];
        if (dir === 'up') return 'price-up';
        if (dir === 'down') return 'price-down';
        if (section === 'purities') {
            const trend = priceChangeMap[`${section}-${id}-${field}`];
            if (trend === 'up') return 'price-up';
            if (trend === 'down') return 'price-down';
            return 'price-neutral';
        }
        if (section === 'navarsu') {
            const trend = priceChangeMap[`${section}-${id}-${field}`];
            if (trend === 'up') return 'price-up';
            if (trend === 'down') return 'price-down';
            return 'price-neutral';
        }
        let name = String(id).toLowerCase();
        if (rawRates[section]) {
            const item = rawRates[section].find(r => r.id === id || r.name === id);
            if (item && item.name) name = item.name.toLowerCase();
        }
        if (name.includes('gold') || id === '3101' || id === '945' || id === '24K' || id === '22K' || id === '18K' || id === '14K') return 'gold-default';
        if (name.includes('silver') || id === '3107' || id === '2966' || id === '2987') return 'silver-default';
        return 'price-neutral';
    };

    const getDisplayRates = () => {
        const mkt = getMarketStatus();
        const baseOverrides = adj.baseModifications;
        
        const spot = rawRates.spot.map(it => ({
            ...it,
            stock: adj.stockOverrides?.[it.id] || false
        }));

        const processRtgsIfOpen = (val, rateMod, baseMod) => {
            if (!mkt.isOpen) return '--';
            let calc = processRate(val, rateMod);
            if (calc !== '--') return processRate(calc, baseMod);
            return '--';
        };

        const rtgs = rawRates.rtgs.map(item => {
            const isGold = item.name.toLowerCase().includes('gold');
            let itemMod = {};
            let baseMod = isGold ? baseOverrides.gold999 : baseOverrides.silver999;
            
            return {
                ...item,
                buy: processRtgsIfOpen(item.buy, itemMod, baseMod),
                sell: processRtgsIfOpen(item.sell, itemMod, baseMod),
                stock: adj.stockOverrides?.[item.id] || false
            };
        });

        const ratesPagePurities = [
            { label: 'Gold 24 KT', key: '24K', factor: 1.0 },
            { label: 'Gold 22 KT', key: '22K', factor: 0.916 },
            { label: 'Gold 18 KT', key: '18K', factor: 0.75 },
            { label: 'Gold 14 KT', key: '14K', factor: 0.583 }
        ].map(p => {
            const now = Date.now();
            const rawGold999 = rawRates.rtgs.find(r => r.id === '945' || r.name?.toLowerCase().includes('gold 999'));
            const live999Sell = parseFloat(rawGold999?.sell) || 0;
            const karatBase = Math.round(live999Sell * p.factor);

            let sell = karatBase;
            if (adj.ratesPage?.showModified) {
                const sDelta = adj.ratesPage?.gold?.value || 0;
                sell = Math.round(karatBase + sDelta);
            }

            const currentValue = live999Sell !== 0 ? Number(sell) : null;
            const trendKey = `purities-${p.key}-sell`;
            const trendClass = priceChangeMap[trendKey];
            const trend = trendClass === 'up' ? 'up' : trendClass === 'down' ? 'down' : 'stable';
            if (Number.isFinite(currentValue)) {
                previousRatesPageValuesRef.current[p.key] = currentValue;
            }
            ratesPageTrendRef.current[p.key] = { trend, trendExpiry: 0 };

            return {
                name: p.label,
                key: p.key,
                sell: live999Sell !== 0 ? sell : '-',
                trend
            };
        });

        const tenG_22K = ratesPagePurities.find(p => p.key === '22K')?.sell;
        const navarsuRate = tenG_22K && tenG_22K !== '-' ? Math.round((parseFloat(tenG_22K) / 10) * 8) : '-';
        const navarsuValue = navarsuRate !== '-' ? Number(navarsuRate) : null;
        const navarsuTrendClass = priceChangeMap['navarsu-navarsu-sell'];
        const navarsuTrend = navarsuTrendClass === 'up' ? 'up' : navarsuTrendClass === 'down' ? 'down' : 'stable';
        if (Number.isFinite(navarsuValue)) {
            previousRatesPageValuesRef.current.navarsu = navarsuValue;
        }
        ratesPageTrendRef.current.navarsu = { trend: navarsuTrend, trendExpiry: 0 };

        return { spot, rtgs, ratesPagePurities, navarsuRate, navarsuTrend };
    };

    return (
        <RateContext.Provider value={{ rawRates, displayRates: getDisplayRates(), ticker, loading, getMarketStatus, adj, getPriceClass }}>
            {children}
        </RateContext.Provider>
    );
};

export const useRates = () => useContext(RateContext);
